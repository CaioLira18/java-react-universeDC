package br.com.caio.dc.Character;

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
@RequestMapping("/character-appearances")
public class CharacterAppearanceController {

  private final CharacterAppearanceService appearanceService;

  public CharacterAppearanceController(CharacterAppearanceService appearanceService) {
    this.appearanceService = appearanceService;
  }

  @GetMapping
  public ResponseEntity<List<CharacterAppearance>> findAll() {
    return ResponseEntity.ok(appearanceService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<CharacterAppearance> findById(@PathVariable String id) {
    return ResponseEntity.ok(appearanceService.findById(id));
  }

  @PostMapping
  public ResponseEntity<CharacterAppearance> create(@RequestBody CharacterAppearanceRequest request) {
    CharacterAppearance created = appearanceService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    appearanceService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
