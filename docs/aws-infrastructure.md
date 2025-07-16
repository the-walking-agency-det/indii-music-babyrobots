# AWS Infrastructure Documentation

This document describes the AWS infrastructure setup for the Indii Music BabyRobots application.

## Overview

The application is deployed on AWS using the following services:

- ECS (Elastic Container Service) for container orchestration
- ECR (Elastic Container Registry) for Docker image storage
- Application Load Balancer for traffic distribution
- VPC with public and private subnets
- Route 53 for DNS management
- RDS for database (planned for future use)

## Infrastructure as Code

The infrastructure is managed using Terraform. The configuration is stored in the `terraform/` directory.

### Key Components

1. **VPC Configuration**
   - CIDR: 10.0.0.0/16
   - 2 Availability Zones
   - Public and Private Subnets
   - NAT Gateway for private subnet internet access
   - Internet Gateway for public subnet access

2. **ECS Cluster**
   - Fargate launch type
   - Auto-scaling based on CPU and Memory utilization
   - Task definitions for the API service
   - Service discovery using AWS Cloud Map

3. **Load Balancer**
   - Application Load Balancer in public subnets
   - HTTPS listeners with ACM certificates
   - Target groups for API service
   - Security groups for controlled access

4. **Route 53**
   - Hosted zone management
   - A records pointing to ALB
   - Health check configuration

## Deployment Process

1. GitHub Actions workflow is triggered on push to main/develop
2. Docker image is built and pushed to ECR
3. Terraform applies infrastructure changes
4. ECS service is updated with new image
5. Health checks confirm deployment success

## Security Considerations

- All secrets are stored in AWS Secrets Manager
- Private subnets for application components
- Security groups limit network access
- IAM roles follow principle of least privilege
- HTTPS enforced for all traffic
- WAF rules protect against common attacks

## Monitoring

- CloudWatch for logs and metrics
- CloudWatch Alarms for critical thresholds
- X-Ray for distributed tracing
- AWS Systems Manager for operational insights

## Cost Optimization

- Auto-scaling based on demand
- Spot instances for non-critical workloads
- Resource tagging for cost allocation
- Regular review of unused resources

## Disaster Recovery

1. **Backup Strategy**
   - Daily ECS task definition backups
   - RDS automated backups
   - S3 version control for assets

2. **Recovery Process**
   - Multi-AZ deployments
   - Automated failover for RDS
   - Backup restoration procedures documented

## Environment Variables

Required environment variables for deployment:

```shell
# AWS Credentials
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>

# Database Configuration
DB_USERNAME=<username>
DB_PASSWORD=<password>

# Application Settings
ENVIRONMENT=staging|production
```

## Future Improvements

1. Implement AWS WAF for enhanced security
2. Set up CloudFront for content delivery
3. Add ElastiCache for performance optimization
4. Implement blue-green deployments
5. Set up cross-region disaster recovery
