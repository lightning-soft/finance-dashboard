terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.region
}

terraform {
  backend "s3" {
    bucket = "tradrr-dev-tf-state"
    key    = "client"
    region = "us-east-2"
  }
}