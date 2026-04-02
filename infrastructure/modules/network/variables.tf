variable "project_name" {}
variable "environment" {}
variable "vpc_cidr" {}
variable "public_subnets" {}
variable "private_subnets" {}
variable "availability_zones" {}
variable "cluster_name" {
  description = "The name of the EKS cluster for discovery tagging"
  type        = string
}
