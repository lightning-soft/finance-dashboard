data "aws_eks_cluster" "eks_cluster" {
  name = "eks-cluster-ams-trading-group-prd"
}

data "aws_caller_identity" "current" {}

locals {
    account_id = data.aws_caller_identity.current.account_id
}

module "kubeconfig" {
  source                                = "git::https://readonly_user:glpat-ibfG77ip8zec_5VEyM32@gitlab.com/ams-trading-group-platform/infrastructure/tf-modules.git//kubeconfig?ref=develop"
  cluster_endpoint                      = data.aws_eks_cluster.eks_cluster.endpoint
  kubeconfig_certificate_authority_data = data.aws_eks_cluster.eks_cluster.certificate_authority[0].data
  cluster_name                          = data.aws_eks_cluster.eks_cluster.id
  region                                = var.region
  account_id                            = local.account_id
}

module "client_ecr" {
  source         = "git::https://readonly_user:glpat-ibfG77ip8zec_5VEyM32@gitlab.com/ams-trading-group-platform/infrastructure/tf-modules.git//ecr?ref=develop"
  application    = "client"
  tag_mutability = "MUTABLE"
  scan           = true
  tags = {
    environment = "prd"
  }
  default_tags = var.default_tags
}

module "client_namespace" {
  source             = "git::https://readonly_user:glpat-ibfG77ip8zec_5VEyM32@gitlab.com/ams-trading-group-platform/infrastructure/tf-modules.git//fargate-profile?ref=develop"
  application        = "client"
  cluster_name       = data.aws_eks_cluster.eks_cluster.id
  fargate_subnet_ids = ["subnet-0da1547ab6cb24f36", "subnet-005943f052325ae9e"]
  namespace          = ["client"]
  tags = {
    environment = "prd"
  }
  default_tags = var.default_tags
}