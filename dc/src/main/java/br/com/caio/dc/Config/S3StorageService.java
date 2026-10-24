package br.com.caio.dc.Config;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3StorageService {

  private final S3Client s3Client;
  private final String bucketName;
  private final String bucketRegion;

  public S3StorageService(
      S3Client s3Client,
      @Value("${aws.s3.bucket:}") String bucketName,
      @Value("${aws.s3.region:us-east-1}") String bucketRegion) {
    this.s3Client = s3Client;
    this.bucketName = bucketName;
    this.bucketRegion = bucketRegion;
  }

  public String uploadUserMedia(String userId, MultipartFile file) {
    return uploadMedia("users/" + userId, file);
  }

  public String uploadGameMedia(String gameId, MultipartFile file) {
    return uploadMedia("games/" + gameId, file);
  }

  public String uploadSeriesMedia(String seriesId, MultipartFile file) {
    return uploadMedia("series/" + seriesId, file);
  }

  public String uploadMovieMedia(String movieId, MultipartFile file) {
    return uploadMedia("movies/" + movieId, file);
  }

  public String uploadHomeSlideMedia(String slideId, MultipartFile file) {
    return uploadMedia("home-slides/" + slideId, file);
  }

  public String uploadSagaMedia(String sagaId, MultipartFile file) {
    return uploadMedia("sagas/" + sagaId, file);
  }

  public String uploadSagaComicMedia(String sagaId, String comicId, MultipartFile file) {
    return uploadMedia("sagas/" + sagaId + "/comics/" + comicId, file);
  }

  public String uploadPlanetMedia(String planetId, MultipartFile file) {
    return uploadMedia("planets/" + planetId, file);
  }

  public String uploadGameCharacterMedia(String gameId, String characterId, MultipartFile file) {
    return uploadMedia("games/" + gameId + "/Personagens/" + characterId, file);
  }

  public String uploadContentCharacterMedia(
      String contentFolder,
      String contentId,
      String characterId,
      MultipartFile file) {
    if (!"movies".equals(contentFolder) && !"series".equals(contentFolder)) {
      throw new IllegalArgumentException("Unsupported content media folder");
    }
    return uploadMedia(contentFolder + "/" + contentId + "/" + characterId, file);
  }

  public String uploadCharacterMedia(String characterName, MultipartFile file) {
    if (characterName == null || characterName.isBlank()) {
      throw new IllegalArgumentException("Character name is required");
    }

    String folderName = characterName.trim()
        .replaceAll("[^\\p{L}\\p{N}._ -]", "_")
        .replaceAll("\\s+", "_");
    if (folderName.equals(".") || folderName.equals("..")) {
      folderName = "_" + folderName;
    }

    return uploadMedia("characters/" + folderName, file);
  }

  private String uploadMedia(String objectPrefix, MultipartFile file) {
    if (objectPrefix == null || objectPrefix.isBlank()) {
      throw new IllegalArgumentException("Media folder is required");
    }

    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("File cannot be empty");
    }

    if (bucketName == null || bucketName.isBlank()) {
      throw new IllegalStateException("AWS S3 bucket name is not configured");
    }

    String originalFilename = Objects.requireNonNullElse(file.getOriginalFilename(), "media");
    String sanitizedName = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
    String objectKey = objectPrefix + "/" + UUID.randomUUID() + "-" + sanitizedName;

    try {
      PutObjectRequest request = PutObjectRequest.builder()
          .bucket(bucketName)
          .key(objectKey)
          .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
          .build();

      s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

      String encodedKey = java.util.Arrays.stream(objectKey.split("/"))
          .map(segment -> URLEncoder.encode(segment, StandardCharsets.UTF_8).replace("+", "%20"))
          .collect(java.util.stream.Collectors.joining("/"));
      return "https://" + bucketName + ".s3." + bucketRegion + ".amazonaws.com/" + encodedKey;
    } catch (IOException exception) {
      throw new IllegalStateException("Failed to upload media to S3", exception);
    }
  }
}
