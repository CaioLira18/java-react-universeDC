package br.com.caio.dc.Series;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/series")
public class SeriesController {

  private final SeriesService seriesService;

  public SeriesController(SeriesService seriesService) {
    this.seriesService = seriesService;
  }

  @GetMapping
  public ResponseEntity<List<Series>> findAll() {
    return ResponseEntity.ok(seriesService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Series> findById(@PathVariable String id) {
    return ResponseEntity.ok(seriesService.findById(id));
  }

  @PostMapping
  public ResponseEntity<Series> create(@RequestBody Series series) {
    Series created = seriesService.create(series);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Series> update(@PathVariable String id, @RequestBody Series series) {
    return ResponseEntity.ok(seriesService.update(id, series));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", seriesService.uploadMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    seriesService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
