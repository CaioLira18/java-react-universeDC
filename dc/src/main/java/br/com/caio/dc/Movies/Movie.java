package br.com.caio.dc.Movies;

import java.util.ArrayList;
import java.util.List;

import br.com.caio.dc.Content.Content;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "movie")
@DiscriminatorValue("MOVIE")
public class Movie extends Content {
  private String verticalImage;
  private String year;
  private String duration;
  @Column (length = 1000)
  private String description;
  private String movieLogo;
  @Column(length = 2048)
  private String banner;

  @ElementCollection
  @CollectionTable(name = "movie_images", joinColumns = @JoinColumn(name = "movie_id"))
  @Column(name = "image_url", length = 2048)
  private List<String> images = new ArrayList<>();
}
