package br.com.caio.dc.Planet;

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
@Table(name = "planet")
public class Planet {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  private String name;
  private String description;
  private String image;

  // cor usada no brilho/glow do planeta no mapa estelar (ex.: "#c86dd7")
  private String color;

  // setor/galaxia, ex.: "Setor de Vega", "Espaço de Oa"
  private String sector;

  // ex.: "Zamarons, Corpo Zafira Estelar"
  private String notableResidents;

  // coordenadas no espaco 3D do mapa estelar (unidades livres, ex.: -20 a 20)
  private Double positionX;
  private Double positionY;
  private Double positionZ;

  // raio da esfera do planeta no mapa (ex.: 0.8 a 1.6)
  private Double size;
}
