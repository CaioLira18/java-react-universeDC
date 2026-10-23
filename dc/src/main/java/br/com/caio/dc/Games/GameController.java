package br.com.caio.dc.Games;

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
@RequestMapping("/games")
public class GameController {

  private final GameService gameService;

  public GameController(GameService gameService) {
    this.gameService = gameService;
  }

  @GetMapping
  public ResponseEntity<List<Game>> findAll() {
    return ResponseEntity.ok(gameService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Game> findById(@PathVariable String id) {
    return ResponseEntity.ok(gameService.findById(id));
  }

  @PostMapping
  public ResponseEntity<Game> create(@RequestBody Game game) {
    return ResponseEntity.status(HttpStatus.CREATED).body(gameService.create(game));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Game> update(@PathVariable String id, @RequestBody Game game) {
    return ResponseEntity.ok(gameService.update(id, game));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", gameService.uploadMedia(id, file)));
  }

  @PostMapping("/{gameId}/characters/{characterId}/media")
  public ResponseEntity<Map<String, String>> uploadCharacterMedia(
      @PathVariable String gameId,
      @PathVariable String characterId,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", gameService.uploadCharacterMedia(gameId, characterId, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    gameService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
