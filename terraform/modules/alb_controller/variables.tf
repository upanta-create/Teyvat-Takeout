variable "cluster_name" {
  type        = string
  description = "EKS Cluster Name"
}

variable "alb_controller_role_arn" {
  type        = string
  description = "IAM Role ARN for AWS Load Balancer Controller IRSA"
}
