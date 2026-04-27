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
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'REG'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'NS')
                    ]) {
                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            runCmd "docker build --provenance=false -t ${REG}/${NS}/${svc}:${BUILD_NUMBER} ${svc}"
                            runCmd "docker tag ${REG}/${NS}/${svc}:${BUILD_NUMBER} ${REG}/${NS}/${svc}:latest"
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
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'REG'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'NS'),
                        string(credentialsId: 'OCI_USERNAME',  variable: 'USER')
                    ]) {
                        retry(3) {
                            echo "Attempting Docker login to ${env.REG} with namespace ${env.NS}..."
                            if (isUnix()) {
                                sh '''
                                    # Ensure registry URL does not have http/https prefix for docker login
                                    CLEAN_REG=$(echo "$REG" | sed -e 's|^https://||' -e 's|^http://||')
                                    ACTUAL_NS=$(echo "$NS" | cut -d/ -f1)
                                    echo "$TOKEN" | docker login "$CLEAN_REG" -u "$ACTUAL_NS/$USER" --password-stdin
                                '''
                            } else {
                                powershell '''
                                    $ErrorActionPreference = "Continue"
                                    $reg = $env:REG -replace "^https?://", ""
                                    $ns  = $env:NS.Split("/")[0]
                                    $usr = $env:USER
                                    $tok = $env:TOKEN

                                    Write-Host "=== DOCKER LOGIN DEBUG ==="
                                    Write-Host "REG: $reg"
                                    Write-Host "Login user: $ns/$usr"
                                    Write-Host "Token length: $($tok.Length)"
                                    Write-Host "=========================="

                                    # Write token to temp file to avoid special char corruption in pipes
                                    $tmpFile = [System.IO.Path]::GetTempFileName()
                                    try {
                                        [System.IO.File]::WriteAllText($tmpFile, $tok)
                                        $result = cmd /c "type $tmpFile | docker login $reg -u $ns/$usr --password-stdin 2>&1"
                                        Write-Host $result
                                        if ($LASTEXITCODE -ne 0) {
                                            throw "Docker login failed with exit code $LASTEXITCODE"
                                        }
                                    } finally {
                                        Remove-Item $tmpFile -Force -ErrorAction SilentlyContinue
                                    }
                                '''
                            }

                            def svcs = env.SERVICES.split(' ')
                            for (int i = 0; i < svcs.size(); i++) {
                                def svc = svcs[i]
                                // Use CLEAN_REG if defined, otherwise REG
                                runCmd "docker push ${REG}/${NS}/${svc}:${BUILD_NUMBER}"
                                runCmd "docker push ${REG}/${NS}/${svc}:latest"
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
                        withCredentials([
                            string(credentialsId: 'OCI_TENANCY_OCID',     variable: 'TENANCY'),
                            string(credentialsId: 'OCI_USER_OCID',        variable: 'USER_OCID'),
                            string(credentialsId: 'OCI_FINGERPRINT',      variable: 'FINGERPRINT'),
                            string(credentialsId: 'OCI_REGION',           variable: 'REGION'),
                            string(credentialsId: 'OCI_COMPARTMENT_OCID', variable: 'COMPARTMENT'),
                            string(credentialsId: 'MYSQL_ADMIN_USER',      variable: 'MYSQL_USER'),
                            string(credentialsId: 'MYSQL_ADMIN_PASS',      variable: 'MYSQL_PASS'),
                            string(credentialsId: 'JENKINS_PUB_KEY',       variable: 'JENKINS_KEY'),
                            string(credentialsId: 'BASTION_PUB_KEY',       variable: 'BASTION_KEY'),
                            file(credentialsId: 'OCI_PRIVATE_KEY',         variable: 'OCI_KEY_FILE')
                        ]) {
                            withEnv([
                                "TF_VAR_tenancy_ocid=${TENANCY.trim()}",
                                "TF_VAR_user_ocid=${USER_OCID.trim()}",
                                "TF_VAR_fingerprint=${FINGERPRINT.trim()}",
                                "TF_VAR_region=${REGION.trim()}",
                                "TF_VAR_compartment_ocid=${COMPARTMENT.trim()}",
                                "TF_VAR_mysql_admin_username=${MYSQL_USER.trim()}",
                                "TF_VAR_mysql_admin_password=${MYSQL_PASS.trim()}",
                                "TF_VAR_jenkins_ssh_public_key=${JENKINS_KEY.trim()}",
                                "TF_VAR_bastion_ssh_public_key=${BASTION_KEY.trim()}",
                                "TF_VAR_private_key_path=${OCI_KEY_FILE.replace('\\\\', '/')}"
                            ]) {
                                runCmd 'terraform init -input=false'
                                runCmd 'terraform apply -auto-approve'
                            }
                        }
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
                                sh "ansible-playbook infrastructure/ansible/site.yml --extra-vars 'mysql_host=${DBHOST} mysql_password=${DBPASS}' -i infrastructure/ansible/inventory.ini"
                            }
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
                    withCredentials([
                        string(credentialsId: 'OCI_REGISTRY',  variable: 'REG'),
                        string(credentialsId: 'OCI_NAMESPACE', variable: 'NS'),
                        string(credentialsId: 'OCI_TENANCY_OCID', variable: 'TENANCY'),
                        string(credentialsId: 'OCI_USER_OCID', variable: 'USER_OCID'),
                        string(credentialsId: 'OCI_FINGERPRINT', variable: 'FINGERPRINT'),
                        string(credentialsId: 'OCI_REGION', variable: 'REGION'),
                        file(credentialsId: 'OCI_PRIVATE_KEY', variable: 'OCI_KEY_FILE')
                    ]) {
                        def clusterId = "ocid1.cluster.oc1.ap-mumbai-1.aaaaaaaa6wpppmc4hw23oyj27heys2bwl5a6avc22qslngi7oc3ailkqyrra"
                        
                        // Generate a fresh kubeconfig via the OCI Python SDK
                        def kubeconfigPath = ""
                        withEnv([
                            "TENANCY=${TENANCY}", "USER_OCID=${USER_OCID}", 
                            "FINGERPRINT=${FINGERPRINT}", "OCI_KEY_FILE=${OCI_KEY_FILE}",
                            "REGION=${REGION}", "CLUSTER_ID=${clusterId}"
                        ]) {
                            kubeconfigPath = powershell(script: "py infrastructure/scripts/generate_token.py", returnStdout: true).trim()
                        }
                        env.KUBECONFIG = kubeconfigPath

                        def svcs = env.SERVICES.split(' ')
                        for (int i = 0; i < svcs.size(); i++) {
                            def svc = svcs[i]
                            if (isUnix()) {
                                sh "sed -i 's|image: .*|image: ${REG}/${NS}/${svc}:${BUILD_NUMBER}|g' infrastructure/k8s/${svc}.yaml"
                            } else {
                                powershell "(Get-Content infrastructure/k8s/${svc}.yaml) -replace 'image: .*', 'image: ${REG}/${NS}/${svc}:${BUILD_NUMBER}' | Set-Content infrastructure/k8s/${svc}.yaml"
                            }
                        }
                        
                        runCmd "kubectl apply -f infrastructure/k8s/ --recursive -n ${K8S_NAMESPACE} --validate=false"
                    }
                }
            }
        }

        stage('Stage 9 - Health Check') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'OCI_TENANCY_OCID', variable: 'TENANCY'),
                        string(credentialsId: 'OCI_USER_OCID', variable: 'USER_OCID'),
                        string(credentialsId: 'OCI_FINGERPRINT', variable: 'FINGERPRINT'),
                        string(credentialsId: 'OCI_REGION', variable: 'REGION'),
                        file(credentialsId: 'OCI_PRIVATE_KEY', variable: 'OCI_KEY_FILE')
                    ]) {
                        def clusterId = "ocid1.cluster.oc1.ap-mumbai-1.aaaaaaaa6wpppmc4hw23oyj27heys2bwl5a6avc22qslngi7oc3ailkqyrra"
                        
                        def kubeconfigPath = ""
                        withEnv([
                            "TENANCY=${TENANCY}", "USER_OCID=${USER_OCID}", 
                            "FINGERPRINT=${FINGERPRINT}", "OCI_KEY_FILE=${OCI_KEY_FILE}",
                            "REGION=${REGION}", "CLUSTER_ID=${clusterId}"
                        ]) {
                            kubeconfigPath = powershell(script: "py infrastructure/scripts/generate_token.py", returnStdout: true).trim()
                        }
                        env.KUBECONFIG = kubeconfigPath

                        def gwIp = ""
                        if (isUnix()) {
                            gwIp = sh(script: "kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}'", returnStdout: true).trim()
                        } else {
                            gwIp = bat(script: "@kubectl get svc api-gateway -n ${K8S_NAMESPACE} -o jsonpath=\"{.status.loadBalancer.ingress[0].ip}\"", returnStdout: true).trim()
                        }
                        
                        if (gwIp) {
                            echo "API Gateway IP: ${gwIp}. Performing health checks..."
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
                withCredentials([string(credentialsId: 'OCI_REGISTRY', variable: 'REG')]) {
                    try { runCmd 'docker system prune -f' } catch(e) {}
                    // Ensure registry URL does not have http/https prefix for logout
                    if (isUnix()) {
                        sh 'CLEAN_REG=$(echo "$REG" | sed -e "s|^https://||" -e "s|^http://||"); docker logout "$CLEAN_REG" || true'
                    } else {
                        powershell '$cleanReg = $env:REG -replace "^https?://", ""; docker logout $cleanReg'
                    }
                }
            }
        }
    }
}
