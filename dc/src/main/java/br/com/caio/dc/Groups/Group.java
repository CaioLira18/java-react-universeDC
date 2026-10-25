package br.com.caio.dc.Groups;

import java.util.LinkedHashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import br.com.caio.dc.Character.Character;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity(name = "HeroGroup")
@Table(name = "hero_groups")
public class Group {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(nullable = false, length = 200)
  private String name;

  @Column(length = 3000)
  private String description;

  @Column(length = 200)
  private String groupType;

  @Column(length = 200)
  private String universe;

  @Column(length = 300)
  private String base;

  private Integer foundedYear;

  @Column(length = 300)
  private String firstAppearance;

  @Column(length = 2048)
  private String banner;

  @ManyToMany(fetch = FetchType.EAGER)
  @JoinTable(
      name = "hero_group_characters",
      joinColumns = @JoinColumn(name = "group_id"),
      inverseJoinColumns = @JoinColumn(name = "character_id"))
  @OrderBy("name ASC")
  @JsonIgnoreProperties({ "appearances", "gameAppearances" })
  private Set<Character> characters = new LinkedHashSet<>();

  private Integer displayOrder = 0;
  private Boolean active = true;
}
