output "eks_cluster_name" {
  value       = module.eks.cluster_name
  description = "The name of the EKS cluster"
}

output "eks_cluster_endpoint" {
  value       = module.eks.cluster_endpoint
  description = "The endpoint of the EKS cluster"
}

output "eks_cluster_certificate_authority" {
  value       = module.eks.cluster_ca_certificate
  description = "The CA certificate of the EKS cluster"
}
