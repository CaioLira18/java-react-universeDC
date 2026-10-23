package br.com.caio.dc.Games;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "games")
public class Game {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String title;
  private String gameLogo;
  @Column(length = 2000)
  private String description;
  @Column(length = 2048)
  private String banner;

  @ElementCollection
  @CollectionTable(name = "game_images", joinColumns = @JoinColumn(name = "game_id"))
  @Column(name = "image_url", length = 2048)
  private List<String> images = new ArrayList<>();
}
