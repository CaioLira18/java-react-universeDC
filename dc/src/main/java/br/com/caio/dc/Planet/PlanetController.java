package br.com.caio.dc.Planet;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/planets")
@CrossOrigin(origins = "*")
public class PlanetController {

  @Autowired
  private PlanetRepository planetRepository;

  @GetMapping
  public List<Planet> getAll() {
    return planetRepository.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Planet> getById(@PathVariable String id) {
    return planetRepository.findById(id)
        .map(ResponseEntity::ok)
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  @PostMapping
  public Planet create(@RequestBody Planet planet) {
    // ignora um id que venha no corpo, pra garantir que o banco sempre gere um novo
    planet.setId(null);
    return planetRepository.save(planet);
  }
}
