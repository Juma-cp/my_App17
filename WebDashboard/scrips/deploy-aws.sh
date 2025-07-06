#!/bin/bash

# Deployment script for AWS infrastructure
STACK_NAME="addiction-tracker-prod"
REGION="us-east-1"
TEMPLATE="cloudformation.yml"

echo "Deploying infrastructure..."
aws cloudformation deploy \
  --stack-name $STACK_NAME \
  --template-file $TEMPLATE \
  --capabilities CAPABILITY_IAM \
  --region $REGION \
  --parameter-overrides \
    Environment=production \
    DBCredentialsSecretArn=$DB_SECRET_ARN

echo "Building Docker images..."
docker build -t backend:latest -f backend/Dockerfile .
docker build -t dashboard:latest -f dashboard/Dockerfile .

echo "Pushing to ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_URI
docker tag backend:latest $ECR_URI/backend:latest
docker push $ECR_URI/backend:latest
docker tag dashboard:latest $ECR_URI/dashboard:latest
docker push $ECR_URI/dashboard:latest

echo "Updating ECS services..."
aws ecs update-service --cluster addiction-tracker-cluster --service backend --force-new-deployment
aws ecs update-service --cluster addiction-tracker-cluster --service dashboard --force-new-deployment

echo "Deploying mobile app to AppCenter..."
appcenter codepush release-react -a org/app-android -d Production
appcenter codepush release-react -a org/app-ios -d Production

echo "Deployment complete!"
