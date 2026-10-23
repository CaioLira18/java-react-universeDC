package br.com.caio.dc.Users;

public record UserProfileResponse(
    String id,
    String name,
    String email,
    String role,
    String imageUrl) {

  public static UserProfileResponse from(User user) {
    return new UserProfileResponse(
        user.getId(),
        user.getName(),
        user.getEmail(),
        user.getRole().name(),
        user.getImageUrl());
  }
}
