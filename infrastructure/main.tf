data "aws_vpc" "shared" {
  filter {
    name   = "tag:Name"
    values = ["${var.project_name}-shared-vpc"]
  }
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.shared.id]
  }
  filter {
    name   = "tag:kubernetes.io/role/internal-elb"
    values = ["1"]
  }
}

module "eks" {
  source = "./modules/eks"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = data.aws_vpc.shared.id
  private_subnet_ids = data.aws_subnets.private.ids
  # Additional EKS config can go here
}
