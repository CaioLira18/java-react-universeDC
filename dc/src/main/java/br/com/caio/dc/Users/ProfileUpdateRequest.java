package br.com.caio.dc.Users;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequest {

  private String name;
  private String email;
  private String password;
}
