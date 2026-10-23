package br.com.caio.dc.Games;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/character-game-appearances")
public class CharacterGameAppearanceController {

  private final CharacterGameAppearanceService appearanceService;

  public CharacterGameAppearanceController(CharacterGameAppearanceService appearanceService) {
    this.appearanceService = appearanceService;
  }

  @GetMapping
  public ResponseEntity<List<CharacterGameAppearance>> findAll() {
    return ResponseEntity.ok(appearanceService.findAll());
  }

  @PostMapping
  public ResponseEntity<CharacterGameAppearance> create(
      @RequestBody CharacterGameAppearanceRequest request) {
    return ResponseEntity.status(HttpStatus.CREATED).body(appearanceService.create(request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    appearanceService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
