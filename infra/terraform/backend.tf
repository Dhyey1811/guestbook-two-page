terraform {
  backend "s3" {
    bucket         = "gb-two-page-tf-state-dhyey1811"  # <- your bucket from above
    key            = "envs/prod/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "gb-two-page-tf-locks"
    encrypt        = true
  }
}
