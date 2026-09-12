package br.com.caio.dc.Movies;

import br.com.caio.dc.Content.Content;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "movie")
@DiscriminatorValue("MOVIE")
public class Movie extends Content {

  private String movieLogo;
}
