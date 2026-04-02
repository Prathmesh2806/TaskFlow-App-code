output "vpc_id" {
  value       = module.network.vpc_id
  description = "The ID of the shared VPC"
}

output "private_subnet_ids" {
  value       = module.network.private_subnet_ids
  description = "The IDs of the shared private subnets"
}

output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "The name of the EKS cluster for the selected environment"
}

output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "The endpoint of the EKS cluster"
}

output "ecr_repository_urls" {
  value       = module.ecr.repository_urls
  description = "The URLs of the shared ECR repositories"
}
