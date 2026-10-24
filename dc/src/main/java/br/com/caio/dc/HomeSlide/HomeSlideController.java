package br.com.caio.dc.HomeSlide;

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
@RequestMapping("/home-slides")
public class HomeSlideController {

  private final HomeSlideService homeSlideService;

  public HomeSlideController(HomeSlideService homeSlideService) {
    this.homeSlideService = homeSlideService;
  }

  @GetMapping
  public ResponseEntity<List<HomeSlide>> findActive() {
    return ResponseEntity.ok(homeSlideService.findActive());
  }

  @GetMapping("/admin")
  public ResponseEntity<List<HomeSlide>> findAll() {
    return ResponseEntity.ok(homeSlideService.findAll());
  }

  @PostMapping
  public ResponseEntity<HomeSlide> create(@RequestBody HomeSlide homeSlide) {
    return ResponseEntity.status(HttpStatus.CREATED).body(homeSlideService.create(homeSlide));
  }

  @PutMapping("/{id}")
  public ResponseEntity<HomeSlide> update(@PathVariable String id, @RequestBody HomeSlide homeSlide) {
    return ResponseEntity.ok(homeSlideService.update(id, homeSlide));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", homeSlideService.uploadMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    homeSlideService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
