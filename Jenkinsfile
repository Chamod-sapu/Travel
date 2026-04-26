def runCmd(cmd) {
    if (isUnix()) {
        sh cmd
    } else {
        bat cmd
    }
}

pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        SERVICES         = "user-service flight-service hotel-service package-service payment-service notification-service api-gateway service-registry"
        BACKEND_SERVICES = "user-service flight-service hotel-service package-service payment-service notification-service"
        K8S_NAMESPACE    = "travelnest"
        MAVEN_OPTS       = "-Xmx512m -XX:MaxMetaspaceSize=256m"
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Stage 1 - Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Stage 2 - Build') {
            steps {
                script {
                    def svcs = env.SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        echo "Building ${svc}..."
                        dir(svc) {
                            runCmd "mvn clean package -DskipTests"
                        }
                    }
                }
            }
        }

        stage('Stage 3 - Test') {
            steps {
                script {
                    def svcs = env.BACKEND_SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        echo "Testing ${svc}..."
                        dir(svc) {
                            runCmd "mvn test"
                        }
                    }
                }
                junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
            }
        }

        stage('Stage 4 - Docker Build') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCI_REGISTRY',   variable: 'OCI_REGISTRY'),
                        string(credentialsId: 'OCI_NAMESPACE',  variable: 'OCI_NAMESPACE_C')
                    ]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            runCmd "docker build -t ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER} ${svc}"
                            runCmd "docker tag ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER} ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:latest"
                        }
                    }
                }
            }
        }

        stage('Stage 5 - Docker Push') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCI_TOKEN',     variable: 'TOKEN'),
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'OCI_REGISTRY'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'NAMESPACE'),
                        string(credentialsId: 'OCI_USERNAME',  variable: 'OCI_USER')
                    ]) {
                        retry(3) {
                            if (isUnix()) {
                                sh '''
                                    ACTUAL_NS=$(echo "$NAMESPACE" | cut -d/ -f1)
                                    echo "$TOKEN" | docker login "$OCI_REGISTRY" -u "$ACTUAL_NS/$OCI_USER" --password-stdin
                                '''
                            } else {
                                bat '''
                                    @echo off
                                    for /f "tokens=1 delims=/" %%a in ("%NAMESPACE%") do set ACTUAL_NS=%%a
                                    @echo | set /p="%TOKEN%" | docker login "%OCI_REGISTRY%" -u "%ACTUAL_NS%/%OCI_USER%" --password-stdin
                                '''
                            }

                            def svcs = env.SERVICES.split(' ')
                            for (int i = 0; i < svcs.size(); i++) {
                                def svc = svcs[i]
                                runCmd "docker push ${OCI_REGISTRY}/${NAMESPACE}/${svc}:${BUILD_NUMBER}"
                                runCmd "docker push ${OCI_REGISTRY}/${NAMESPACE}/${svc}:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Stage 6 - Terraform Apply') {
            steps {
                script {
                    dir('infrastructure/terraform') {
                        runCmd 'terraform init -input=false'
                        runCmd 'terraform plan -out=tfplan -var-file=terraform.tfvars -input=false'
                        runCmd 'terraform apply -auto-approve tfplan'
                    }
                }
            }
        }

        stage('Stage 7 - Ansible') {
            steps {
                script {
                    if (isUnix()) {
                        withCredentials([
                            string(credentialsId: 'DB_HOST',     variable: 'DB_HOST'),
                            string(credentialsId: 'DB_PASSWORD', variable: 'DB_PASSWORD')
                        ]) {
                            withEnv(['ANSIBLE_HOST_KEY_CHECKING=False']) {
                                sh """
                                    ansible-playbook infrastructure/ansible/site.yml \
                                        --tags 'database,rabbitmq,k8s' \
                                        --extra-vars 'mysql_host=${DB_HOST} mysql_password=${DB_PASSWORD}' \
                                        -i infrastructure/ansible/inventory.ini
                                """
                            }
                        }
                    } else {
                        echo "Skipping Ansible on Windows agent. Ensure Ansible is run from a Linux controller or WSL."
                    }
                }
            }
        }

        stage('Stage 8 - Deploy to OKE') {
            steps {
                script {
                    withCredentials([
                        file(credentialsId: 'KUBECONFIG_PATH',  variable: 'KUBECONFIG'),
                        string(credentialsId: 'OCI_REGISTRY',   variable: 'OCI_REGISTRY'),
                        string(credentialsId: 'OCI_NAMESPACE',  variable: 'OCI_NAMESPACE_C')
                    ]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            if (isUnix()) {
                                sh "sed -i 's|image: .*|image: ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER}|g' infrastructure/k8s/${svc}.yaml"
                            } else {
                                powershell "(Get-Content infrastructure/k8s/${svc}.yaml) -replace 'image: .*', 'image: ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER}' | Set-Content infrastructure/k8s/${svc}.yaml"
                            }
                        }

                        runCmd "kubectl apply -f infrastructure/k8s/ --recursive -n ${K8S_NAMESPACE}"

                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            timeout(time: 5, unit: 'MINUTES') {
                                runCmd "kubectl rollout status deployment/${svc} -n ${K8S_NAMESPACE}"
                            }
                        }
                    }
                }
            }
        }

        stage('Stage 9 - Health Check') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                        def gwIp = ""
                        if (isUnix()) {
                            gwIp = sh(script: "kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'", returnStdout: true).trim()
                        } else {
                            gwIp = bat(script: "@kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath=\"{.status.loadBalancer.ingress[0].ip}\"", returnStdout: true).trim()
                        }

                        if (!gwIp) {
                            error("Could not retrieve api-gateway external IP.")
                        }

                        def healthPaths = [
                            'user-service'        : '/api/users/actuator/health',
                            'flight-service'      : '/api/flights/actuator/health',
                            'hotel-service'       : '/api/hotels/actuator/health',
                            'package-service'     : '/api/packages/actuator/health',
                            'payment-service'     : '/api/payments/actuator/health',
                            'notification-service': '/api/notifications/actuator/health',
                            'api-gateway'         : '/actuator/health',
                            'service-registry'    : '/actuator/health'
                        ]

                        healthPaths.each { svc, path ->
                            retry(5) {
                                sleep(time: 30, unit: 'SECONDS')
                                runCmd "curl --silent --fail http://${gwIp}${path}"
                            }
                        }
                    }
                }
            }
        }

        stage('Stage 10 - Notify') {
            steps {
                echo "✅ Build #${BUILD_NUMBER} deployed successfully."
            }
        }
    }

    post {
        always {
            script {
                try {
                    archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
                } catch(e) { echo "Archive failed: ${e.message}" }
                try {
                    junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
                } catch(e) { echo "JUnit publish failed: ${e.message}" }
            }
        }
        failure {
            script {
                try {
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            runCmd "kubectl rollout undo deployment/${svc} -n ${K8S_NAMESPACE} || true"
                        }
                    }
                } catch(e) { echo "Cleanup/Rollback failed: ${e.message}" }
            }
        }
        cleanup {
            script {
                try {
                    runCmd 'docker system prune -f'
                } catch(e) { echo "Docker prune failed: ${e.message}" }
                try {
                    withCredentials([string(credentialsId: 'OCI_REGISTRY', variable: 'OCI_REGISTRY')]) {
                        runCmd "docker logout ${OCI_REGISTRY} || true"
                    }
                } catch(e) { echo "Docker logout failed: ${e.message}" }
            }
        }
    }
}
