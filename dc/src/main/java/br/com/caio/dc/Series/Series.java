package br.com.caio.dc.Series;

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
@Table(name = "series")
@DiscriminatorValue("SERIES")
public class Series extends Content {

  private String serieLogo;
  @Column(length = 1000)
  private String description;
  @Column(length = 2048)
  private String banner;

  @ElementCollection
  @CollectionTable(name = "series_images", joinColumns = @JoinColumn(name = "series_id"))
  @Column(name = "image_url", length = 2048)
  private List<String> images = new ArrayList<>();
}
