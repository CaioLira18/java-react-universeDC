package br.com.caio.dc.Games;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CharacterGameAppearanceRequest {

  private String characterId;
  private String gameId;
  private String characterImage;
}
