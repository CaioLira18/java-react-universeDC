package br.com.caio.dc.Character;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterAppearanceRequest {

  private String characterId;
  private String contentId;
  private String characterImage;
}
