variable "vpc_cidr" {
  type        = string
  description = "Base CIDR block for the AWS VPC"
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of AWS Availability Zones for Multi-AZ deployment"
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets"
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private application subnets"
  default     = ["10.0.10.0/24", "10.0.11.0/24", "10.0.12.0/24"]
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster for resource tagging"
  default     = "teyvat-takeout-eks"
}

variable "environment" {
  type        = string
  description = "Deployment environment (e.g., prod, staging)"
  default     = "prod"
}
