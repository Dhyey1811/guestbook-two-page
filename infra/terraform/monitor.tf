resource "aws_sns_topic" "alerts" {
  name = "${var.project}-alerts"
  depends_on = [aws_dynamodb_table.guest_messages]
}

resource "aws_sns_topic_subscription" "email" {
  count     = var.alarm_email == "" ? 0 : 1
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# Alert on any throttled requests
resource "aws_cloudwatch_metric_alarm" "ddb_throttles" {
  alarm_name          = "${var.project}-ddb-throttled-requests"
  namespace           = "AWS/DynamoDB"
  metric_name         = "ThrottledRequests"
  dimensions          = { TableName = aws_dynamodb_table.guest_messages.name }
  statistic           = "Sum"
  period              = 60
  evaluation_periods  = 1
  threshold           = 1
  comparison_operator = "GreaterThanOrEqualToThreshold"
  treat_missing_data  = "notBreaching"
  alarm_description   = "DynamoDB table is throttling."
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}
