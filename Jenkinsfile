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
        SERVICES        = "user-service flight-service hotel-service package-service payment-service notification-service api-gateway service-registry"
        BACKEND_SERVICES = "user-service flight-service hotel-service package-service payment-service notification-service"
        K8S_NAMESPACE   = "travelnest"
        MAVEN_OPTS      = "-Xmx512m -XX:MaxMetaspaceSize=256m"
    }

    stages {

        stage('Stage 0 - Credential Check') {
            steps {
                script {
                    def credIds = ['OCI_TOKEN', 'OCI_REGISTRY', 'OCI_NAMESPACE', 'OCI_USERNAME', 'DB_HOST', 'DB_PASSWORD']
                    def missing = []
                    for (int i = 0; i < credIds.size(); i++) {
                        def cid = credIds[i]
                        try {
                            withCredentials([string(credentialsId: cid, variable: "TEST_${cid}")]) {
                                echo "✅ Credential '${cid}' exists (Secret text type)"
                            }
                        } catch(e1) {
                            try {
                                withCredentials([usernamePassword(credentialsId: cid, usernameVariable: "U_${cid}", passwordVariable: "P_${cid}")]) {
                                    echo "✅ Credential '${cid}' exists (Username+Password type)"
                                }
                            } catch(e2) {
                                try {
                                    withCredentials([file(credentialsId: cid, variable: "F_${cid}")]) {
                                        echo "✅ Credential '${cid}' exists (File type)"
                                    }
                                } catch(e3) {
                                    echo "❌ Credential '${cid}' NOT FOUND in Jenkins!"
                                    missing.add(cid)
                                }
                            }
                        }
                    }
                    // Also check KUBECONFIG_PATH
                    try {
                        withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'TEST_KUBE')]) {
                            echo "✅ Credential 'KUBECONFIG_PATH' exists (File type)"
                        }
                    } catch(e) {
                        echo "❌ Credential 'KUBECONFIG_PATH' NOT FOUND in Jenkins!"
                        missing.add('KUBECONFIG_PATH')
                    }

                    if (missing.size() > 0) {
                        echo "=========================================="
                        echo "MISSING CREDENTIALS: ${missing.join(', ')}"
                        echo "Go to: Jenkins > Manage Jenkins > Credentials"
                        echo "Add the missing credentials as 'Secret text' type"
                        echo "=========================================="
                        error("Cannot continue — ${missing.size()} credential(s) missing: ${missing.join(', ')}")
                    } else {
                        echo "All credentials verified successfully!"
                    }
                }
            }
        }

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
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'DOCKER_REG'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'DOCKER_NS')
                    ]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            echo "Building ${svc}..."
                            runCmd "docker build -t ${DOCKER_REG}/${DOCKER_NS}/${svc}:${BUILD_NUMBER} ${svc}"
                            runCmd "docker tag ${DOCKER_REG}/${DOCKER_NS}/${svc}:${BUILD_NUMBER} ${DOCKER_REG}/${DOCKER_NS}/${svc}:latest"
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
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'DOCKER_REG'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'DOCKER_NS'),
                        string(credentialsId: 'OCI_USERNAME',  variable: 'OCI_USER')
                    ]) {
                        retry(3) {
                            if (isUnix()) {
                                sh '''
                                    ACTUAL_NS=$(echo "$DOCKER_NS" | cut -d/ -f1)
                                    echo "$TOKEN" | docker login "$DOCKER_REG" -u "$ACTUAL_NS/$OCI_USER" --password-stdin
                                '''
                            } else {
                                bat '''
                                    @echo off
                                    for /f "tokens=1 delims=/" %%a in ("%DOCKER_NS%") do set ACTUAL_NS=%%a
                                    @echo | set /p="%TOKEN%" | docker login "%DOCKER_REG%" -u "%ACTUAL_NS%/%OCI_USER%" --password-stdin
                                '''
                            }

                            def svcs = env.SERVICES.split(' ')
                            for (int i = 0; i < svcs.size(); i++) {
                                def svc = svcs[i]
                                runCmd "docker push ${DOCKER_REG}/${DOCKER_NS}/${svc}:${BUILD_NUMBER}"
                                runCmd "docker push ${DOCKER_REG}/${DOCKER_NS}/${svc}:latest"
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
                            string(credentialsId: 'DB_HOST',     variable: 'DBHOST'),
                            string(credentialsId: 'DB_PASSWORD', variable: 'DBPASS')
                        ]) {
                            withEnv(['ANSIBLE_HOST_KEY_CHECKING=False']) {
                                sh """
                                    ansible-playbook infrastructure/ansible/site.yml \
                                        --tags 'database,rabbitmq,k8s' \
                                        --extra-vars 'mysql_host=${DBHOST} mysql_password=${DBPASS}' \
                                        -i infrastructure/ansible/inventory.ini
                                """
                            }
                        }
                    } else {
                        echo "Skipping Ansible on Windows agent."
                    }
                }
            }
        }

        stage('Stage 8 - Deploy to OKE') {
            steps {
                script {
                    withCredentials([
                        file(credentialsId: 'KUBECONFIG_PATH',  variable: 'KUBECONFIG'),
                        string(credentialsId: 'OCI_REGISTRY',   variable: 'DOCKER_REG'),
                        string(credentialsId: 'OCI_NAMESPACE',  variable: 'DOCKER_NS')
                    ]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            if (isUnix()) {
                                sh "sed -i 's|image: .*|image: ${DOCKER_REG}/${DOCKER_NS}/${svc}:${BUILD_NUMBER}|g' infrastructure/k8s/${svc}.yaml"
                            } else {
                                powershell "(Get-Content infrastructure/k8s/${svc}.yaml) -replace 'image: .*', 'image: ${DOCKER_REG}/${DOCKER_NS}/${svc}:${BUILD_NUMBER}' | Set-Content infrastructure/k8s/${svc}.yaml"
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
                } catch(e) { echo "Archive: ${e.message}" }
                try {
                    junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
                } catch(e) { echo "JUnit: ${e.message}" }
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
                } catch(e) { echo "Rollback failed: ${e.message}" }
            }
        }
        cleanup {
            script {
                try {
                    runCmd 'docker system prune -f'
                } catch(e) { echo "Prune failed: ${e.message}" }
                try {
                    withCredentials([string(credentialsId: 'OCI_REGISTRY', variable: 'DOCKER_REG')]) {
                        runCmd "docker logout ${DOCKER_REG} || true"
                    }
                } catch(e) { echo "Logout failed: ${e.message}" }
            }
        }
    }
}
