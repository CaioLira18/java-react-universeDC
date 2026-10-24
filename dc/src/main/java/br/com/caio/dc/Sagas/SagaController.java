package br.com.caio.dc.Sagas;

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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/sagas")
public class SagaController {

  private final SagaService sagaService;

  public SagaController(SagaService sagaService) {
    this.sagaService = sagaService;
  }

  @GetMapping
  public ResponseEntity<List<Saga>> findActive() {
    return ResponseEntity.ok(sagaService.findActive());
  }

  @GetMapping("/admin")
  public ResponseEntity<List<Saga>> findAll() {
    return ResponseEntity.ok(sagaService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Saga> findById(@PathVariable String id) {
    return ResponseEntity.ok(sagaService.findActiveById(id));
  }

  @PostMapping
  public ResponseEntity<Saga> create(@RequestBody Saga saga) {
    return ResponseEntity.status(HttpStatus.CREATED).body(sagaService.create(saga));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Saga> update(@PathVariable String id, @RequestBody Saga saga) {
    return ResponseEntity.ok(sagaService.update(id, saga));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", sagaService.uploadMedia(id, file)));
  }

  @PostMapping("/{id}/comics/{comicId}/media")
  public ResponseEntity<Map<String, String>> uploadComicMedia(
      @PathVariable String id,
      @PathVariable String comicId,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", sagaService.uploadComicMedia(id, comicId, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    sagaService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
