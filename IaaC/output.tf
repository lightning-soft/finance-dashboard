output "cluster_name" {
  value = data.aws_eks_cluster.eks_cluster.id
}

output "ecr" {
  value = module.client_ecr.repository_url
}