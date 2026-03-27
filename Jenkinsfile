// ============================================================
// Jenkinsfile - Declarative Pipeline
// CI/CD Pipeline for Dockerised Node.js Microservices
// Author: Anish Tiwari | DevOps Engineer
// ============================================================

pipeline {
  agent any

  environment {
    IMAGE_NAME    = 'anishtiwari2315/cicd-docker-app'
    IMAGE_TAG     = "${env.BUILD_NUMBER}"
    DOCKER_CREDS  = credentials('dockerhub-credentials')
    KUBECONFIG    = credentials('kubeconfig')
    APP_PORT      = '3000'
  }

  options {
    buildDiscarder(logRotator(numToKeepStr: '10'))
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
  }

  stages {

    stage('Checkout') {
      steps {
        echo '=== Checking out source code ==='
        checkout scm
        sh 'git log --oneline -5'
      }
    }

    stage('Install Dependencies') {
      steps {
        echo '=== Installing Node.js dependencies ==='
        sh 'node --version'
        sh 'npm --version'
        sh 'npm ci'
      }
    }

    stage('Lint') {
      steps {
        echo '=== Running ESLint ==='
        sh 'npm run lint || true'
      }
    }

    stage('Test') {
      steps {
        echo '=== Running unit tests with coverage ==='
        sh 'npm test'
      }
      post {
        always {
          publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'coverage/lcov-report',
            reportFiles: 'index.html',
            reportName: 'Code Coverage Report'
          ])
        }
      }
    }

    stage('Build Docker Image') {
      steps {
        echo "=== Building Docker image: ${IMAGE_NAME}:${IMAGE_TAG} ==="
        sh """
          docker build \\
            --build-arg APP_VERSION=${IMAGE_TAG} \\
            --tag ${IMAGE_NAME}:${IMAGE_TAG} \\
            --tag ${IMAGE_NAME}:latest \\
            .
        """
        sh "docker image ls ${IMAGE_NAME}"
      }
    }

    stage('Scan Docker Image') {
      steps {
        echo '=== Scanning Docker image for vulnerabilities ==='
        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL ${IMAGE_NAME}:${IMAGE_TAG} || true"
      }
    }

    stage('Push to Docker Hub') {
      when {
        anyOf {
          branch 'main'
          branch 'develop'
        }
      }
      steps {
        echo '=== Pushing Docker image to Docker Hub ==='
        sh """
          echo ${DOCKER_CREDS_PSW} | docker login -u ${DOCKER_CREDS_USR} --password-stdin
          docker push ${IMAGE_NAME}:${IMAGE_TAG}
          docker push ${IMAGE_NAME}:latest
          docker logout
        """
      }
    }

    stage('Deploy to Kubernetes') {
      when {
        branch 'main'
      }
      steps {
        echo '=== Deploying to Kubernetes cluster ==='
        sh """
          export KUBECONFIG=${KUBECONFIG}
          # Update image tag in deployment
          sed -i "s|IMAGE_TAG|${IMAGE_TAG}|g" k8s/deployment.yaml
          kubectl apply -f k8s/
          kubectl rollout status deployment/cicd-docker-app --timeout=120s
          kubectl get pods -l app=cicd-docker-app
        """
      }
    }

    stage('Smoke Test') {
      when {
        branch 'main'
      }
      steps {
        echo '=== Running smoke test against deployed service ==='
        sh """
          sleep 10
          kubectl port-forward svc/cicd-docker-app-svc 8080:80 &
          sleep 5
          curl -sf http://localhost:8080/health | grep healthy
          echo 'Smoke test PASSED'
          kill %1 || true
        """
      }
    }
  }

  post {
    success {
      echo "Pipeline SUCCESS - Build ${env.BUILD_NUMBER} deployed."
    }
    failure {
      echo "Pipeline FAILED - Build ${env.BUILD_NUMBER}. Check logs."
    }
    always {
      sh 'docker rmi ${IMAGE_NAME}:${IMAGE_TAG} || true'
      cleanWs()
    }
  }
}
