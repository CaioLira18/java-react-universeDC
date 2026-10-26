variable "aws_region" {
  description = "AWS region for all regional resources."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Short project identifier used in resource names."
  type        = string
  default     = "dc-universe"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "production"
}

variable "github_repository" {
  description = "GitHub repository in owner/name format allowed to deploy."
  type        = string
  default     = "CaioLira18/java-react-universeDC"
}

variable "ec2_instance_type" {
  description = "Small instance type suitable for a low-cost single-instance deployment."
  type        = string
  default     = "t3.micro"
}

variable "ec2_ssh_cidr" {
  description = "CIDR allowed to SSH to the EC2 instance. Leave empty to disable port 22."
  type        = string
  default     = ""
}

variable "database_bucket_name" {
  description = "Optional globally unique bucket name for uploaded media."
  type        = string
  default     = ""
}

variable "frontend_bucket_name" {
  description = "Optional globally unique bucket name for the frontend."
  type        = string
  default     = ""
}
