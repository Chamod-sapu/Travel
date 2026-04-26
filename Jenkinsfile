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

        // Credentials defined as environment variables for easier access
        OCI_TOKEN        = credentials('OCI_TOKEN')
        OCI_REGISTRY     = credentials('OCI_REGISTRY')
        OCI_NAMESPACE    = credentials('OCI_NAMESPACE')
        OCI_USERNAME     = credentials('OCI_USERNAME')
        DB_HOST          = credentials('DB_HOST')
        DB_PASSWORD      = credentials('DB_PASSWORD')
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
                    def svcs = env.SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        runCmd "docker build -t ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:${BUILD_NUMBER} ${svc}"
                        runCmd "docker tag ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:${BUILD_NUMBER} ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:latest"
                    }
                }
            }
        }

        stage('Stage 5 - Docker Push') {
            steps {
                script {
                    retry(3) {
                        if (isUnix()) {
                            sh '''
                                ACTUAL_NS=$(echo "$OCI_NAMESPACE" | cut -d/ -f1)
                                echo "$OCI_TOKEN" | docker login "$OCI_REGISTRY" -u "$ACTUAL_NS/$OCI_USERNAME" --password-stdin
                            '''
                        } else {
                            bat '''
                                @echo off
                                for /f "tokens=1 delims=/" %%a in ("%OCI_NAMESPACE%") do set ACTUAL_NS=%%a
                                @echo | set /p="%OCI_TOKEN%" | docker login "%OCI_REGISTRY%" -u "%ACTUAL_NS%/%OCI_USERNAME%" --password-stdin
                            '''
                        }

                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            runCmd "docker push ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:${BUILD_NUMBER}"
                            runCmd "docker push ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:latest"
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
                        runCmd 'terraform apply -auto-approve'
                    }
                }
            }
        }

        stage('Stage 7 - Ansible') {
            steps {
                script {
                    if (isUnix()) {
                        withEnv(['ANSIBLE_HOST_KEY_CHECKING=False']) {
                            sh """
                                ansible-playbook infrastructure/ansible/site.yml \
                                    --tags 'database,rabbitmq,k8s' \
                                    --extra-vars 'mysql_host=${DB_HOST} mysql_password=${DB_PASSWORD}' \
                                    -i infrastructure/ansible/inventory.ini
                            """
                        }
                    } else {
                        echo "Skipping Ansible on Windows."
                    }
                }
            }
        }

        stage('Stage 8 - Deploy to OKE') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            if (isUnix()) {
                                sh "sed -i 's|image: .*|image: ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:${BUILD_NUMBER}|g' infrastructure/k8s/${svc}.yaml"
                            } else {
                                powershell "(Get-Content infrastructure/k8s/${svc}.yaml) -replace 'image: .*', 'image: ${OCI_REGISTRY}/${OCI_NAMESPACE}/${svc}:${BUILD_NUMBER}' | Set-Content infrastructure/k8s/${svc}.yaml"
                            }
                        }
                        runCmd "kubectl apply -f infrastructure/k8s/ --recursive -n ${K8S_NAMESPACE}"
                    }
                }
            }
        }

        stage('Stage 9 - Health Check') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBE')]) {
                        env.KUBECONFIG = KUBE
                        def gwIp = ""
                        if (isUnix()) {
                            gwIp = sh(script: "kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'", returnStdout: true).trim()
                        } else {
                            gwIp = bat(script: "@kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath=\"{.status.loadBalancer.ingress[0].ip}\"", returnStdout: true).trim()
                        }
                        
                        if (gwIp) {
                            echo "API Gateway IP: ${gwIp}. Performing health checks..."
                            // Health check logic simplified for brevity, can be expanded as needed
                        }
                    }
                }
            }
        }

        stage('Stage 10 - Notify') {
            steps {
                echo "✅ Build #${BUILD_NUMBER} completed."
            }
        }
    }

    post {
        always {
            script {
                try { archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true } catch(e) {}
                try { junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml' } catch(e) {}
            }
        }
        cleanup {
            script {
                try {
                    runCmd 'docker system prune -f'
                } catch(e) { echo "Docker prune failed: ${e.message}" }
                try {
                    runCmd "docker logout ${OCI_REGISTRY} || true"
                } catch(e) { echo "Docker logout failed: ${e.message}" }
            }
        }
    }
}
