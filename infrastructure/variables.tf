variable "aws_region" {
  description = "The AWS region to deploy to"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "TaskFlow"
}

variable "environment" {
  description = "The environment name (dev, qa, prod, dr)"
  type        = string
}

# The following network variables are auto-discovered via tags, 
# ensuring your environment always finds the correct 'shared' VPC.
