package br.com.caio.dc.Games;

import br.com.caio.dc.Character.Character;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "character_game_appearance",
    uniqueConstraints = @UniqueConstraint(columnNames = { "character_id", "game_id" }))
public class CharacterGameAppearance {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @ManyToOne
  @JoinColumn(name = "character_id", nullable = false)
  @JsonIgnoreProperties({ "appearances", "gameAppearances" })
  private Character character;

  @ManyToOne
  @JoinColumn(name = "game_id", nullable = false)
  private Game game;

  private String characterImage;
}
