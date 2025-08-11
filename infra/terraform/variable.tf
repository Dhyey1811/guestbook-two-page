variable "project" {
  description = "Project name prefix"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "alarm_email" {
  description = "Email for CloudWatch alarms (optional)"
  type        = string
  default     = ""
}

# used by CI offline plans
variable "ci" {
  description = "If true, provider skips account/cred checks"
  type        = bool
  default     = false
}
