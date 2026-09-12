package br.com.caio.dc.Character;

import java.util.Set;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "character")
public class Character {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String name;
  private String description;
  private String background;

  {/* Novas Informações */}
  private String true_name;
  private String powers;
  private String planet;
  private String first_appearance;
  private String first_appearance_year;
  private String logo;
  private String verticalmage;

  @OneToMany(mappedBy = "character", cascade = CascadeType.ALL, orphanRemoval = true)
  private Set<CharacterAppearance> appearances;
}
