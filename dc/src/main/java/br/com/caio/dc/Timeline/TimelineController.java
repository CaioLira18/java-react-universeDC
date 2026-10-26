package br.com.caio.dc.Timeline;

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
@RequestMapping("/timelines")
public class TimelineController {

  private final TimelineService timelineService;

  public TimelineController(TimelineService timelineService) {
    this.timelineService = timelineService;
  }

  @GetMapping
  public ResponseEntity<List<Timeline>> findActive() {
    return ResponseEntity.ok(timelineService.findActive());
  }

  @GetMapping("/admin")
  public ResponseEntity<List<Timeline>> findAll() {
    return ResponseEntity.ok(timelineService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Timeline> findById(@PathVariable String id) {
    return ResponseEntity.ok(timelineService.findByIdForPublic(id));
  }

  @PostMapping
  public ResponseEntity<Timeline> create(@RequestBody Timeline timeline) {
    return ResponseEntity.status(HttpStatus.CREATED).body(timelineService.create(timeline));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Timeline> update(@PathVariable String id, @RequestBody Timeline timeline) {
    return ResponseEntity.ok(timelineService.update(id, timeline));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", timelineService.uploadMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    timelineService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
