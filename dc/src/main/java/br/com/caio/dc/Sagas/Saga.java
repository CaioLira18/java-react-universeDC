package br.com.caio.dc.Sagas;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "sagas")
public class Saga {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false)
  private String name;

  @Column(length = 2000)
  private String description;

  private Integer startYear;
  private Integer endYear;

  @Column(length = 2048)
  private String banner;

  @OneToMany(mappedBy = "saga", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("readingOrder ASC, name ASC")
  private List<SagaComic> comics = new ArrayList<>();

  private Integer displayOrder = 0;
  private Boolean active = true;
}
