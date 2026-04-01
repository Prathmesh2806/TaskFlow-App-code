variable "project_name" {}
variable "environment" {}
variable "vpc_id" {}
variable "private_subnet_ids" {
  type = list(string)
}
variable "oidc_provider_arn" {
  description = "Optional OIDC provider ARN if already exists"
  type        = string
  default     = ""
}
