/**
 * Production Root Module: Assembles VPC, EKS Cluster,
 * IAM IRSA, and AWS Load Balancer Controller modules.
 */

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Teyvat-Takeout"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# 1. Multi-AZ VPC Network Module
module "vpc" {
  source       = "../../modules/vpc"
  vpc_cidr     = var.vpc_cidr
  cluster_name = var.cluster_name
  environment  = var.environment
}

# 2. Amazon EKS Cluster & Node Groups Module
module "eks" {
  source           = "../../modules/eks"
  cluster_name     = var.cluster_name
  vpc_id           = module.vpc.vpc_id
  subnet_ids       = module.vpc.private_subnet_ids
  instance_types   = var.instance_types
  desired_capacity = var.desired_capacity
  min_capacity     = var.min_capacity
  max_capacity     = var.max_capacity
  environment      = var.environment
}

# 3. IAM IRSA Module
module "iam_irsa" {
  source            = "../../modules/iam_irsa"
  cluster_name      = var.cluster_name
  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_provider_url = module.eks.oidc_provider_url
  environment       = var.environment
}

# Helm Provider Configuration authenticated against EKS
provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
      command     = "aws"
    }
  }
}

# 4. AWS Load Balancer Controller Helm Release
module "alb_controller" {
  source                  = "../../modules/alb_controller"
  cluster_name            = module.eks.cluster_name
  alb_controller_role_arn = module.iam_irsa.alb_controller_role_arn

  depends_on = [module.eks]
}
