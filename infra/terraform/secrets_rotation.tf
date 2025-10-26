# Use AWS Serverless Application Repository rotation function
# App name: SecretsManagerRDSPostgreSQLRotationSingleUser

resource "aws_security_group" "rotation" {
  name        = "${local.name_prefix}-secrets-rotation-sg"
  description = "Allow rotation lambda to reach RDS"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound not required; lambda initiates outbound connections
}

resource "aws_serverlessapplicationrepository_cloudformation_stack" "rds_rotation" {
  name           = "${local.name_prefix}-rds-rotation"
  application_id = "arn:aws:serverlessrepo:us-east-1:297356227824:applications/SecretsManagerRDSPostgreSQLRotationSingleUser"
  semantic_version = "1.1.333"
  capabilities   = ["CAPABILITY_IAM", "CAPABILITY_RESOURCE_POLICY"]

  parameters = {
    functionName                 = "${local.name_prefix}-rds-rotation-lambda"
    endpoint                     = aws_db_instance.postgres.address
    port                         = tostring(aws_db_instance.postgres.port)
    dbName                       = aws_db_instance.postgres.db_name == null ? "postgres" : aws_db_instance.postgres.db_name
    tableName                    = ""
    VpcSubnetIds                 = join(",", [for s in aws_subnet.private : s.id])
    VpcSecurityGroupIds          = aws_security_group.rotation.id
    excludeCharacters            = "/@\"\\'`$"
    rotationSchedule             = "rate(30 days)"
    masterSecretArn              = aws_secretsmanager_secret.db_password.arn
  }
}

# Create composite secret with connection info for rotation
resource "aws_secretsmanager_secret" "db_conn" {
  name       = "${local.name_prefix}/rds/postgres/connection"
  kms_key_id = aws_kms_key.main.arn
}

resource "aws_secretsmanager_secret_version" "db_conn_v" {
  secret_id = aws_secretsmanager_secret.db_conn.id
  secret_string = jsonencode({
    engine   = "postgres",
    host     = aws_db_instance.postgres.address,
    port     = aws_db_instance.postgres.port,
    username = aws_db_instance.postgres.username,
    password = random_password.rds_master.result,
    dbname   = "postgres"
  })
}

resource "aws_secretsmanager_secret_rotation" "db_conn" {
  secret_id           = aws_secretsmanager_secret.db_conn.id
  rotation_lambda_arn = aws_serverlessapplicationrepository_cloudformation_stack.rds_rotation.outputs["FunctionArn"]

  rotation_rules {
    automatically_after_days = 30
  }
}

output "db_secret_arn" {
  value       = aws_secretsmanager_secret.db_conn.arn
  description = "Secrets Manager ARN with rotating DB credentials"
}
