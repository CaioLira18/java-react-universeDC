package br.com.caio.dc.Series;

import br.com.caio.dc.Content.Content;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "series")
@DiscriminatorValue("SERIES")
public class Series extends Content {

  private String serieLogo;
}
