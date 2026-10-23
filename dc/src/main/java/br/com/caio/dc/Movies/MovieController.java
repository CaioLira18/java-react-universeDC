package br.com.caio.dc.Movies;

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
@RequestMapping("/movies")
public class MovieController {

  private final MovieService movieService;

  public MovieController(MovieService movieService) {
    this.movieService = movieService;
  }

  @GetMapping
  public ResponseEntity<List<Movie>> findAll() {
    return ResponseEntity.ok(movieService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Movie> findById(@PathVariable String id) {
    return ResponseEntity.ok(movieService.findById(id));
  }

  @PostMapping
  public ResponseEntity<Movie> create(@RequestBody Movie movie) {
    Movie created = movieService.create(movie);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Movie> update(@PathVariable String id, @RequestBody Movie movie) {
    return ResponseEntity.ok(movieService.update(id, movie));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", movieService.uploadMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    movieService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
