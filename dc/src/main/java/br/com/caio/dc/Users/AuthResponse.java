package br.com.caio.dc.Users;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AuthResponse {

  private String token;
  private String id;
  private String email;
  private String name;
  private String role;
  private String imageUrl;
}
