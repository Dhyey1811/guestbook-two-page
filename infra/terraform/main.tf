locals {
  table_name = "${var.project}-guest-messages"
}

resource "aws_dynamodb_table" "guest_messages" {
  name         = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Project = var.project
    App     = "guestbook"
  }
}
