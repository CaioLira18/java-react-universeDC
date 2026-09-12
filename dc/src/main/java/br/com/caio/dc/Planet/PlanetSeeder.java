package br.com.caio.dc.Planet;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class PlanetSeeder implements CommandLineRunner {

  @Autowired
  private PlanetRepository planetRepository;

  @Override
  public void run(String... args) {
    // so semeia se a tabela estiver vazia, pra nao duplicar toda vez que sobe a aplicacao
    if (planetRepository.count() > 0) {
      return;
    }

    planetRepository.save(planet(
        "Zamaron",
        "Planeta-lar do Corpo Zafira Estelar, onde o poder do amor é cultivado como energia; berço das guerreiras Zamaron que forjaram os primeiros anéis violeta.",
        "#e05fc4",
        "Sistema Vega",
        "Zamarons, Star Sapphire (Carol Ferris)",
        12.0, 3.0, -4.0, 1.15
    ));

    planetRepository.save(planet(
        "Oa",
        "Localizado no centro do universo, é a sede dos Guardiões do Universo e quartel-general do Corpo dos Lanternas Verdes.",
        "#3ddc72",
        "Centro do Universo",
        "Guardiões do Universo, Corpo dos Lanternas Verdes",
        -8.0, 5.0, -10.0, 1.3
    ));

    planetRepository.save(planet(
        "Apokolips",
        "Mundo industrial e infernal governado por Darkseid, dominado por fábricas, fogo e a busca pela Equação Anti-Vida.",
        "#ff5b3d",
        "Sistema Novos Deuses",
        "Darkseid, Parademônios, Novos Deuses do Mal",
        16.0, -7.0, -22.0, 1.4
    ));

    planetRepository.save(planet(
        "Novo Gênesis",
        "Planeta-paraíso dos Novos Deuses, governado pelo Alto-Pai; existe em oposição direta a Apokolips.",
        "#7fe8d4",
        "Sistema Novos Deuses",
        "Alto-Pai, Novos Deuses do Bem, Orion",
        6.0, 10.0, -26.0, 1.2
    ));

    planetRepository.save(planet(
        "Krypton",
        "Planeta natal de Superman, marcado por tecnologia cristalina avançada; destruído pouco depois do nascimento de Kal-El.",
        "#4fd1ff",
        "Setor Krypton",
        "Kryptonianos, Casa de El",
        -16.0, -4.0, -6.0, 1.0
    ));

    planetRepository.save(planet(
        "Thanagar",
        "Mundo natal de uma raça guerreira de humanoides alados, famosa pelo domínio do metal Nth usado por Gavião Negro e Mulher-Gavião.",
        "#e8b34d",
        "Sistema Polaris",
        "Thanagarianos, Gavião Negro, Mulher-Gavião",
        -4.0, -9.0, -16.0, 1.05
    ));
  }

  private Planet planet(String name, String description, String color, String sector,
                         String notableResidents, Double positionX, Double positionY,
                         Double positionZ, Double size) {
    Planet planet = new Planet();
    planet.setName(name);
    planet.setDescription(description);
    planet.setColor(color);
    planet.setSector(sector);
    planet.setNotableResidents(notableResidents);
    planet.setPositionX(positionX);
    planet.setPositionY(positionY);
    planet.setPositionZ(positionZ);
    planet.setSize(size);
    return planet;
  }
}
