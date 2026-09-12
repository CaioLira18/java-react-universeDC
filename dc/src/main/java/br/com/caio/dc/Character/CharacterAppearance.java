package br.com.caio.dc.Character;

import br.com.caio.dc.Content.Content;
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
@Table(name = "character_appearance", uniqueConstraints = @UniqueConstraint(columnNames = { "character_id", "content_id" }))
public class CharacterAppearance {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  // ignora o campo "appearances" quando serializar o Character aqui dentro,
  // cortando o ciclo Character -> appearances -> character -> appearances...
  @ManyToOne
  @JoinColumn(name = "character_id", nullable = false)
  @JsonIgnoreProperties("appearances")
  private Character character;

  @ManyToOne
  @JoinColumn(name = "content_id", nullable = false)
  private Content content;

  private String characterImage;
}
