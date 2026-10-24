package br.com.caio.dc.Planet;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/planets")
@CrossOrigin(origins = "*")
public class PlanetController {

  private final PlanetService planetService;

  public PlanetController(PlanetService planetService) {
    this.planetService = planetService;
  }

  @GetMapping
  public List<Planet> getAll() {
    return planetService.findAll();
  }

  @GetMapping("/{id}")
  public ResponseEntity<Planet> getById(@PathVariable String id) {
    try {
      return ResponseEntity.ok(planetService.findById(id));
    } catch (NoSuchElementException exception) {
      return ResponseEntity.notFound().build();
    }
  }

  @PostMapping
  public ResponseEntity<Planet> create(@RequestBody Planet planet) {
    return ResponseEntity.status(HttpStatus.CREATED).body(planetService.create(planet));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Planet> update(@PathVariable String id, @RequestBody Planet planet) {
    return ResponseEntity.ok(planetService.update(id, planet));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", planetService.uploadMedia(id, file)));
  }

  @PostMapping("/{id}/primary-media")
  public ResponseEntity<Map<String, String>> uploadPrimaryMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", planetService.uploadPrimaryMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    planetService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
