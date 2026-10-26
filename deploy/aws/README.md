# AWS infrastructure

This directory provisions the low-cost production base selected for the project:

- private S3 bucket plus CloudFront for the React frontend;
- private S3 bucket for uploaded media;
- ECR repository for the Spring Boot image;
- one small EC2 instance running Docker;
- IAM role for the EC2 instance, including SSM, ECR pull and media-bucket access;
- GitHub Actions OIDC role for frontend and backend deployment.

No AWS access key is stored in this repository. Terraform uses the AWS CLI credential
chain on the operator's machine. The GitHub workflow uses the role output by Terraform.

## Provisioning

From this directory, authenticate with the AWS CLI or another supported credential
provider, then run:

```powershell
terraform init
terraform validate
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

Copy `terraform.tfvars.example` to `terraform.tfvars` and adjust the region or names
before applying. Do not commit `terraform.tfvars` or `terraform.tfstate`.

The outputs provide the values needed by GitHub secrets:

- `github_deploy_role_arn` -> `AWS_DEPLOY_ROLE_ARN`;
- `frontend_bucket` -> `FRONTEND_BUCKET`;
- `cloudfront_distribution_id` -> `CLOUDFRONT_DISTRIBUTION_ID`;
- `cloudfront_domain_name` -> the frontend URL;
- `ecr_repository_url` -> the API image repository;
- `ec2_instance_id` -> the backend deployment target;
- `media_bucket` -> `AWS_S3_BUCKET`.

The API is initially reachable at the EC2 public DNS on port `8080`. Before exposing
the application to real users, put the API behind HTTPS (a domain with a certificate
and reverse proxy or load balancer). Until then, use the public DNS only for smoke
tests and set `VITE_API_URL` to `http://<ec2-public-dns>:8080`.

## Important notes

- The configuration uses the default VPC and its first available subnet to keep the
  setup inexpensive. It is not a multi-AZ high-availability architecture.
- The EC2 instance is managed through SSM, so an SSH key is not required.
- Terraform state contains resource identifiers and must be kept private. For a team,
  migrate the state to an encrypted, locked S3 backend after the first successful
  bootstrap.
