#!groovy

properties([disableConcurrentBuilds()])

pipeline {
    agent any

    environment {
        DOCKER_DOCKERFILE = './Dockerfile'
        DOCKER_IMAGE = 'propokot/services-psychologist-dashboard-client'
        DOCKER_CREDENTIAL = 'docker-hub-credentials'
        SERVICE_NAME = 'services-psychologist-dashboard-client'
        NEXT_PUBLIC_DASHBOARD_API_URL = credentials('next-public-dashboard-api-url')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker System Prune') {
            steps {
                sh '''
                docker system prune -af
                '''
            }
        }

        stage('Build image') {
            steps {
                sh '''
                docker build -f "$DOCKER_DOCKERFILE" --force-rm \
                --build-arg NEXT_PUBLIC_DASHBOARD_API_URL="$NEXT_PUBLIC_DASHBOARD_API_URL" \
                -t "$DOCKER_IMAGE:latest" .
                '''
            }
        }

        stage('Docker login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: DOCKER_CREDENTIAL,
                    usernameVariable: 'USERNAME',
                    passwordVariable: 'PASSWORD'
                )]) {
                    sh '''
                    echo "$PASSWORD" | docker login -u "$USERNAME" --password-stdin
                    '''
                }
            }
        }

        stage('Push image') {
            steps {
                sh '''
                docker push $DOCKER_IMAGE:latest
                '''
            }
        }

        stage('Apply K8s') {
            steps {
                withCredentials([
                    string(credentialsId: 'kubernetes_username', variable: 'KUBERNETES_USERNAME'),
                    string(credentialsId: 'kubernetes_password', variable: 'KUBERNETES_PASSWORD'),
                    string(credentialsId: 'kubernetes_url', variable: 'KUBERNETES_URL')
                ]) {
                    sh '''
                    curl -u $KUBERNETES_USERNAME:$KUBERNETES_PASSWORD \
                    $KUBERNETES_URL/execute-commands/$SERVICE_NAME
                    '''
                }
            }
        }
    }

    post {
        success {
            script {
                sendTelegram('OK', 'YES')
            }
        }

        aborted {
            script {
                sendTelegram('Aborted', 'Aborted')
            }
        }

        failure {
            script {
                sendTelegram('not OK', 'no')
            }
        }
    }
}

def sendTelegram(buildStatus, publishStatus) {
    withCredentials([
        string(credentialsId: 'telegram_token', variable: 'TOKEN'),
        string(credentialsId: 'telegram_chat_id', variable: 'CHAT_ID')
    ]) {
        sh """
        MESSAGE="*\$JOB_NAME* : POC
Branch: \$GIT_BRANCH
Build: ${buildStatus}
Published: ${publishStatus}"

        curl -s -X POST "https://api.telegram.org/bot\$TOKEN/sendMessage" \
            --data-urlencode "chat_id=\$CHAT_ID" \
            --data-urlencode "parse_mode=Markdown" \
            --data-urlencode "text=\$MESSAGE"
        """
    }
}
