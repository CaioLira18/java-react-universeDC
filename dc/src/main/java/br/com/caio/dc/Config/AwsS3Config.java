package br.com.caio.dc.Config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;

@Configuration
public class AwsS3Config {

  @Bean
  public S3Client s3Client(
      @Value("${aws.s3.region:us-east-1}") String region,
      @Value("${aws.access-key:}") String accessKey,
      @Value("${aws.secret-key:}") String secretKey,
      @Value("${aws.s3.endpoint:}") String endpoint) {

    S3ClientBuilder builder = S3Client.builder().region(Region.of(region));

    if (StringUtils.hasText(endpoint)) {
      builder.endpointOverride(URI.create(endpoint));
    }

    if (StringUtils.hasText(accessKey) && StringUtils.hasText(secretKey)) {
      builder.credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKey, secretKey)));
    }

    return builder.build();
  }
}
