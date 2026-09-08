variable "cluster_name" {
  type        = string
  description = "EKS Cluster Name"
}

variable "oidc_provider_arn" {
  type        = string
  description = "OIDC Provider ARN from EKS"
}

variable "oidc_provider_url" {
  type        = string
  description = "OIDC Provider URL from EKS"
}

variable "environment" {
  type        = string
  description = "Environment identifier"
  default     = "prod"
}
