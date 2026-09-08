output "vpc_id" {
  description = "The ID of the provisioned VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "The Name of the Amazon EKS Cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "The Endpoint URL for Kubernetes API Server"
  value       = module.eks.cluster_endpoint
}

output "alb_controller_role_arn" {
  description = "IAM Role ARN for AWS Load Balancer Controller"
  value       = module.iam_irsa.alb_controller_role_arn
}
