pipeline {
    agent any

    triggers {
        githubPush()
    }

    environment {
        // Services list — api-gateway and service-registry have no mvn test, handled separately
        SERVICES        = "user-service flight-service hotel-service package-service payment-service notification-service api-gateway service-registry"
        BACKEND_SERVICES = "user-service flight-service hotel-service package-service payment-service notification-service"
        K8S_NAMESPACE   = "travelnest"

        // Credentials — using renamed OCI_NAMESPACE_C to avoid potential env var collisions
        OCI_TOKEN       = credentials('OCI_TOKEN')
        OCI_REGISTRY    = credentials('OCI_REGISTRY')
        OCI_NAMESPACE_C = credentials('OCI_NAMESPACE')
        OCI_USERNAME    = credentials('OCI_USERNAME')
        DB_HOST         = credentials('DB_HOST')
        DB_PASSWORD     = credentials('DB_PASSWORD')
    }

    stages {

        // ─────────────────────────────────────────────
        // STAGE 1 — Checkout
        // ─────────────────────────────────────────────
        stage('Stage 1 - Checkout') {
            steps {
                checkout scm
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 2 — Parallel Build
        // ─────────────────────────────────────────────
        stage('Stage 2 - Build') {
            steps {
                script {
                    def parallelBuilds = [:]
                    def svcs = env.SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        parallelBuilds[svc] = {
                            dir(svc) {
                                sh "mvn clean package -DskipTests"
                            }
                        }
                    }
                    parallel parallelBuilds
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 3 — Test
        // Only run mvn test on BACKEND_SERVICES (api-gateway and service-registry often lack unit tests)
        // ─────────────────────────────────────────────
        stage('Stage 3 - Test') {
            steps {
                script {
                    def parallelTests = [:]
                    def svcs = env.BACKEND_SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        parallelTests[svc] = {
                            dir(svc) {
                                sh "mvn test"
                            }
                        }
                    }
                    parallel parallelTests
                }
                junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 4 — Docker Build
        // ─────────────────────────────────────────────
        stage('Stage 4 - Docker Build') {
            steps {
                script {
                    def svcs = env.SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        sh """
                            docker build -t ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER} ${svc}
                            docker tag ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER} \
                                        ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:latest
                        """
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 5 — Docker Push
        // ─────────────────────────────────────────────
        stage('Stage 5 - Docker Push') {
            steps {
                script {
                    retry(3) {
                        // Use --password-stdin to avoid secret exposure in logs
                        sh """
                            echo '${OCI_TOKEN}' | docker login ${OCI_REGISTRY} \
                                -u '${OCI_NAMESPACE_C}/${OCI_USERNAME}' \
                                --password-stdin
                        """
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            sh """
                                docker push ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER}
                                docker push ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:latest
                            """
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 6 — Terraform Apply
        // ─────────────────────────────────────────────
        stage('Stage 6 - Terraform Apply') {
            steps {
                script {
                    dir('infrastructure/terraform') {
                        sh 'terraform init -input=false' 
                        sh 'terraform plan -out=tfplan -var-file=terraform.tfvars -input=false'
                        sh 'terraform apply -auto-approve tfplan'
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 7 — Ansible
        // ─────────────────────────────────────────────
        stage('Stage 7 - Ansible') {
            steps {
                script {
                    withEnv(['ANSIBLE_HOST_KEY_CHECKING=False']) {
                        sh """
                            ansible-playbook infrastructure/ansible/site.yml \
                                --tags 'database,rabbitmq,k8s' \
                                --extra-vars 'mysql_host=${DB_HOST} mysql_password=${DB_PASSWORD}' \
                                -i infrastructure/ansible/inventory.ini
                        """
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 8 — Deploy to OKE
        // ─────────────────────────────────────────────
        stage('Stage 8 - Deploy to OKE') {
            steps {
                script {
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            // Using a more flexible sed that matches 'image: .*' but builds a specific OCI image path
                            sh "sed -i 's|image: .*|image: ${OCI_REGISTRY}/${OCI_NAMESPACE_C}/${svc}:${BUILD_NUMBER}|g' infrastructure/k8s/${svc}.yaml"
                        }

                        // Apply all manifests
                        sh "kubectl apply -f infrastructure/k8s/ --recursive -n ${K8S_NAMESPACE}"

                        // Wait for each deployment to roll out
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            timeout(time: 5, unit: 'MINUTES') {
                                sh "kubectl rollout status deployment/${svc} -n ${K8S_NAMESPACE}"
                            }
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 9 — Health Check
        // Corrected health check paths per service route prefix
        // ─────────────────────────────────────────────
        stage('Stage 9 - Health Check') {
            steps {
                script {
                    // Export KUBECONFIG for kubectl commands
                    withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                        def gwIp = sh(
                            script: "kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'",
                            returnStdout: true
                        ).trim()

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
                                sleep(time: 30, unit: 'SECONDS') // sleep BEFORE curl gives pods time to start
                                sh "curl --silent --fail http://${gwIp}${path}"
                            }
                        }
                    }
                }
            }
        }

        // ─────────────────────────────────────────────
        // STAGE 10 — Notify
        // ─────────────────────────────────────────────
        stage('Stage 10 - Notify') {
            steps {
                script {
                    echo "✅ Build #${BUILD_NUMBER} deployed successfully to OKE."
                    // mail(
                    //     to: 'team@example.com',
                    //     subject: "✅ TravelNest Build #${BUILD_NUMBER} Deployed Successfully",
                    //     body: "Build #${BUILD_NUMBER} has been deployed to OCI OKE successfully.\n\nJenkins URL: ${env.BUILD_URL}"
                    // )
                }
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/target/*.jar', allowEmptyArchive: true
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
        }

        failure {
            script {
                withCredentials([file(credentialsId: 'KUBECONFIG_PATH', variable: 'KUBECONFIG')]) {
                    def svcs = env.SERVICES.split(' ')
                    for (int i = 0; i < svcs.size(); i++) {
                        def svc = svcs[i]
                        sh "kubectl rollout undo deployment/${svc} -n ${K8S_NAMESPACE} || true"
                        echo "⏪ Rolled back: ${svc}"
                    }
                }
            }
        }

        cleanup {
            sh 'docker system prune -f'
            sh 'docker logout ${OCI_REGISTRY} || true'
        }
    }
}
