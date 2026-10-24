package br.com.caio.dc.HomeSlide;

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
@Table(name = "home_slides")
public class HomeSlide {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String title;

  private String subtitle;

  @Column(length = 2000)
  private String description;

  private String image;
  private String buttonText;
  private String buttonLink;
  private Integer displayOrder = 0;
  private Boolean active = true;
}
