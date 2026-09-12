package br.com.caio.dc.Character;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/characters")
public class CharacterController {

  private final CharacterService characterService;

  public CharacterController(CharacterService characterService) {
    this.characterService = characterService;
  }

  @GetMapping
  public ResponseEntity<List<Character>> findAll() {
    return ResponseEntity.ok(characterService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Character> findById(@PathVariable String id) {
    return ResponseEntity.ok(characterService.findById(id));
  }

  @PostMapping
  public ResponseEntity<Character> create(@RequestBody Character character) {
    Character created = characterService.create(character);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PutMapping("/{id}")
  public ResponseEntity<Character> update(@PathVariable String id, @RequestBody Character character) {
    return ResponseEntity.ok(characterService.update(id, character));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    characterService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
