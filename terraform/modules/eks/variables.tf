variable "cluster_name" {
  type        = string
  description = "Name of the EKS Cluster"
  default     = "teyvat-takeout-eks"
}

variable "cluster_version" {
  type        = string
  description = "Kubernetes control plane version"
  default     = "1.29"
}

variable "vpc_id" {
  type        = string
  description = "VPC ID where EKS will be deployed"
}

variable "subnet_ids" {
  type        = list(string)
  description = "Subnet IDs for EKS Control Plane and Managed Node Groups"
}

variable "instance_types" {
  type        = list(string)
  description = "EC2 instance types for EKS Managed Node Groups"
  default     = ["t3.medium"]
}

variable "desired_capacity" {
  type        = number
  description = "Desired number of worker nodes"
  default     = 2
}

variable "min_capacity" {
  type        = number
  description = "Minimum number of worker nodes"
  default     = 2
}

variable "max_capacity" {
  type        = number
  description = "Maximum number of worker nodes"
  default     = 6
}

variable "environment" {
  type        = string
  description = "Deployment environment"
  default     = "prod"
}
