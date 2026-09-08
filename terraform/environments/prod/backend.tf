# -------------------------------------------------------------
# S3 Backend Remote State & DynamoDB Locking
# -------------------------------------------------------------
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.26"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.12"
    }
  }

  # Uncomment when remote S3 bucket and DynamoDB table are created:
  # backend "s3" {
  #   bucket         = "teyvat-takeout-tfstate"
  #   key            = "prod/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "teyvat-takeout-tflocks"
  #   encrypt        = true
  # }
}
