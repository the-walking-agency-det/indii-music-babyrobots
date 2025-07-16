terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "indiimusic-terraform-state"
    key    = "staging/terraform.tfstate"
    region = "us-west-2"
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  environment = var.environment
  vpc_cidr    = var.vpc_cidr
  azs         = var.availability_zones
}

# ECS Cluster
module "ecs" {
  source = "./modules/ecs"
  
  environment     = var.environment
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  app_port       = var.app_port
  container_port = var.container_port
  image_tag      = var.image_tag
}

# Application Load Balancer
module "alb" {
  source = "./modules/alb"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.public_subnet_ids
}

# Route 53 Records
module "route53" {
  source = "./modules/route53"
  
  domain_name = var.domain_name
  alb_dns_name = module.alb.dns_name
  environment  = var.environment
}

# RDS Database (for future use)
module "rds" {
  source = "./modules/rds"
  
  environment = var.environment
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
}
