terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws    = { source = "hashicorp/aws", version = ">= 5.50" }
    archive= { source = "hashicorp/archive" }
    random = { source = "hashicorp/random" }
  }
}

provider "aws" {
  region                      = var.aws_region
  skip_credentials_validation = var.ci
  skip_metadata_api_check     = var.ci
  skip_requesting_account_id  = var.ci

}
