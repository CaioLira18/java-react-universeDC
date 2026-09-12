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

  // posicao no mapa em porcentagem (0 a 100), pra desenhar sem depender de coordenadas reais
  private Double positionX;
  private Double positionY;

  // multiplicador de tamanho do ponto no mapa (1.0 = padrao)
  private Double size;
}
