
variable "project" {
  description = "Project name for resource naming"
  type        = string
}

resource "random_string" "suffix" {
  length  = 6
  upper   = false
  special = false
}

# Private S3 bucket for the SPA
resource "aws_s3_bucket" "site" {
  bucket        = "${var.project}-site-${random_string.suffix.result}"
  force_destroy = true
}

# Block public access (we will grant CloudFront OAI only)
resource "aws_s3_bucket_public_access_block" "site" {
  bucket                  = aws_s3_bucket.site.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Required by newer S3: set object ownership
resource "aws_s3_bucket_ownership_controls" "site" {
  bucket = aws_s3_bucket.site.id
  rule { object_ownership = "BucketOwnerEnforced" }
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "${var.project} OAI"
}

# Allow CloudFront OAI to read from the bucket
resource "aws_s3_bucket_policy" "site_policy" {
  bucket = aws_s3_bucket.site.id
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Sid       = "AllowCloudFrontRead",
        Effect    = "Allow",
        Principal = {
          # NOTE: for OAI use CanonicalUser with the OAI's canonical user ID
          CanonicalUser = aws_cloudfront_origin_access_identity.oai.s3_canonical_user_id
        },
        Action   = ["s3:GetObject"],
        Resource = ["${aws_s3_bucket.site.arn}/*"]
      }
    ]
  })
}

# CloudFront distribution in front of the bucket
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name = aws_s3_bucket.site.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.site.id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    target_origin_id       = aws_s3_bucket.site.id
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

output "site_bucket"  { value = aws_s3_bucket.site.bucket }
output "cdn_id"       { value = aws_cloudfront_distribution.cdn.id }
output "cdn_domain"   { value = aws_cloudfront_distribution.cdn.domain_name }
