module "network" {
  source = "./modules/network"

  project_name        = var.project_name
  environment         = "shared"
  vpc_cidr            = var.vpc_cidr
  public_subnets      = var.public_subnets
  private_subnets     = var.private_subnets
  availability_zones  = var.availability_zones
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = "shared"
  # Standardize all service names including the database
  services     = ["frontend", "project-service", "task-service", "user-service", "database"]
}

module "eks" {
  source = "./modules/eks"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.network.vpc_id
  private_subnet_ids = module.network.private_subnet_ids
}
