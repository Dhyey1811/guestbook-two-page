## README — Guestbook Two-Page (Node + DynamoDB + Terraform + GitHub Actions)
Last updated: August 11, 2025
Repository: https://github.com/Dhyey1811/guestbook-two-page
## Overview
A lightweight guestbook app with two pages (List + Add) and edit/delete/search. Local dev runs on Express; production runs serverlessly on AWS (Lambda + API Gateway). Frontend is hosted on S3 behind CloudFront. Infrastructure is defined with Terraform, CI/CD with GitHub Actions.
Architecture (prod)
Frontend (S3 + CloudFront) → API Gateway HTTP API → AWS Lambda (Node.js) → DynamoDB.
Logs: CloudWatch Logs for Lambda. Optional alarm: CloudWatch Alarm on DynamoDB throttling.
## Repo structure
•	frontend/: index.html, add.html, style.css, config.js (API URL injected at deploy)
•	backend/: Express app for dev (app.js/server.js/db.js) + lambda/handler.js for prod
•	infra/terraform/: Terraform files (DynamoDB, Lambda, API GW, S3, CloudFront, backend state)
•	.github/workflows/: PR Checks (tests + offline TF plan) and Main Deploy (apply + upload + invalidate)
## Local development
•	Prereq: Node 18+, npm, AWS CLI (optional).
•	Start API + UI locally: cd backend && npm install && npm run dev → open http://localhost:3000
•	Optional DynamoDB locally: backend/.env with USE_DB=1, AWS_REGION=us-east-1, TABLE_NAME=gb-two-page-guest-messages; ensure AWS creds (aws sts get-caller-identity).
## Production deployment (GitHub Actions)
•	Merge into main → Main Deploy runs:
•	  1) Configure AWS creds
•	  2) Terraform init/apply (DynamoDB, Lambda, API GW, S3, CloudFront)
•	  3) Read outputs (API URL, site bucket, distribution ID)
•	  4) Write frontend/config.js with API URL
•	  5) Sync frontend/ to S3
•	  6) Invalidate CloudFront cache
•	  7) Smoke-test /messages
Find the website at the cdn_domain output (e.g., https://dXXXXXXXX.cloudfront.net).
## CI (pull requests)
•	Install backend deps; run Jest unit tests with coverage (artifact uploaded).
•	Terraform fmt (auto), init without backend, validate, and an offline plan with provider checks skipped (no AWS creds required).
## Terraform state backend
•	S3 backend with use_lockfile=true (no DynamoDB lock table required).
•	File: infra/terraform/backend.tf (key: envs/prod/terraform.tfstate).
## Environment variables
•	Local dev (backend/.env): USE_DB = 0/1, AWS_REGION = us-east-1, TABLE_NAME = gb-two-page-guest-messages.
•	Prod: Terraform injects TABLE_NAME into Lambda; CI writes frontend/config.js with API URL.
## Testing
•	Run tests: cd backend && npm test
•	Coverage report is uploaded in PR checks (Actions artifact).
## Monitoring & logging
•	Lambda logs: CloudWatch Logs group /aws/lambda/<project>-api
•	Optional: CloudWatch Alarm on DynamoDB ThrottledRequests (SNS email subscription)
## Common issues & fixes
•	Site doesn’t update: wait for CloudFront invalidation; force refresh (Ctrl/Cmd+Shift+R).
•	API 403/404: check API URL in frontend/config.js; re-run deploy if needed.
•	PR plan needs creds: ensure PR job renames backend.tf and sets TF_VAR_ci=true.
•	Apply fails with 'already exists': import resource into TF state or delete stray resource and re-apply.
•	Wrong region: Console must be in us-east-1 (or your aws_region).
## Demo script (10 minutes)
•	Show repo structure and workflows.
•	Open PR (feature branch) → watch PR Checks pass.
•	Merge PR → watch Main Deploy apply/upload/invalidate; copy outputs.
•	Open CloudFront URL; add/edit/delete a message.
•	Show DynamoDB items and Lambda logs in CloudWatch.
License
Educational/demo use.
