package br.com.caio.dc.Timeline;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "timelines")
public class Timeline {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String year;

  @Column(nullable = false)
  private String era;

  @Column(nullable = false)
  private String title;

  @Column(length = 2000)
  private String description;

  @Column(length = 2048)
  private String image;

  @Column(length = 500)
  private String imageAlt;

  private String accent;
  private Integer displayOrder = 0;
  private Boolean active = true;
}
