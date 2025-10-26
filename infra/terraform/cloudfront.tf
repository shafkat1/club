resource "aws_cloudfront_origin_access_control" "assets" {
  name                              = "${local.name_prefix}-oac-assets"
  description                       = "OAC for assets bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "assets" {
  enabled = true

  origin {
    domain_name              = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id                = "assets-s3"
    origin_access_control_id = aws_cloudfront_origin_access_control.assets.id
  }

  aliases = var.enable_domain ? ["assets.${var.domain_name}"] : []

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "assets-s3"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate.cloudfront.arn
    cloudfront_default_certificate = false
    minimum_protocol_version       = "TLSv1.2_2021"
    ssl_support_method             = "sni-only"
  }

  depends_on = [aws_s3_bucket.assets]
}

output "cloudfront_assets_domain" {
  value       = aws_cloudfront_distribution.assets.domain_name
  description = "CloudFront domain for assets"
}
