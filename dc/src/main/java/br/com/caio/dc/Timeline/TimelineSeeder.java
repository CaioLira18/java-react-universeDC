package br.com.caio.dc.Timeline;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TimelineSeeder implements CommandLineRunner {

  private final TimelineRepository timelineRepository;

  public TimelineSeeder(TimelineRepository timelineRepository) {
    this.timelineRepository = timelineRepository;
  }

  @Override
  public void run(String... args) {
    if (timelineRepository.count() > 0) {
      return;
    }

    save("1934", "O começo", "Nasce a DC",
        "A National Allied Publications inicia a trajetória que daria origem à DC Comics.",
        "DC Comics", "blue", 1);
    save("1938", "A Era de Ouro", "Superman chega a Metropolis",
        "A estreia do Superman inaugura a era dos super-heróis.",
        "Superman", "yellow", 2);
    save("1939", "Um novo símbolo", "Batman aparece em Gotham",
        "Um herói sem poderes passa a proteger Gotham durante a noite.",
        "Batman", "red", 3);
    save("1941", "Uma nova fronteira", "Wonder Woman entra em cena",
        "Diana de Themyscira amplia o universo com mitologia e uma nova visão de heroísmo.",
        "Wonder Woman", "blue", 4);
    save("1956", "A Era de Prata", "O multiverso ganha forma",
        "Novas versões de heróis e mundos paralelos mostram que diferentes realidades podem coexistir.",
        "Multiverso", "yellow", 5);
    save("1960", "Heróis unidos", "A Liga da Justiça",
        "Os maiores heróis se unem para enfrentar ameaças grandes demais para qualquer integrante sozinho.",
        "Liga da Justiça", "red", 6);
    save("1985", "Crise", "As infinitas Terras entram em choque",
        "Uma grande crise reorganiza as realidades e muda a continuidade dos quadrinhos.",
        "Crise", "blue", 7);
    save("1986", "Novas perspectivas", "Heróis mais complexos",
        "Histórias mais maduras aprofundam conflitos, escolhas e consequências.",
        "Novas perspectivas", "yellow", 8);
    save("2011", "Os Novos 52", "Uma nova porta de entrada",
        "A editora reinventa origens e cronologias para apresentar uma nova fase editorial.",
        "Os Novos 52", "red", 9);
    save("2016", "Renascimento", "O legado continua",
        "Personagens, relações e memórias de fases anteriores voltam a ganhar espaço.",
        "Renascimento", "blue", 10);
    save("2021", "Fronteiras infinitas", "Todas as histórias importam",
        "A DC amplia novamente sua cosmologia e reúne diferentes Terras em um mesmo mapa.",
        "Fronteiras Infinitas", "yellow", 11);
    save("Hoje", "O futuro", "Um universo em expansão",
        "Quadrinhos, animações, filmes, séries e jogos continuam apresentando novas interpretações.",
        "O futuro", "red", 12);
  }

  private void save(
      String year,
      String era,
      String title,
      String description,
      String imageText,
      String accent,
      int displayOrder) {
    Timeline timeline = new Timeline();
    timeline.setYear(year);
    timeline.setEra(era);
    timeline.setTitle(title);
    timeline.setDescription(description);
    timeline.setImage("https://placehold.co/900x500/151a32/fff6dc?text=" + imageText.replace(" ", "+"));
    timeline.setImageAlt("Arte representando " + title);
    timeline.setAccent(accent);
    timeline.setDisplayOrder(displayOrder);
    timeline.setActive(true);
    timelineRepository.save(timeline);
  }
}
