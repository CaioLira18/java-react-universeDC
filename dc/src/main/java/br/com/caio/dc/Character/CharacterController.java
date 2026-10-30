package br.com.caio.dc.Character;

import java.util.List;

import br.com.caio.dc.Config.PageResponse;
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

  // GET /characters/page?page=0&size=24&search=bat
  // Listagem paginada e leve (id, name, background). A rota literal tem prioridade sobre /{id}.
  @GetMapping("/page")
  public ResponseEntity<PageResponse<CharacterSummary>> findPage(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "18") int size,
      @RequestParam(defaultValue = "") String search) {
    return ResponseEntity.ok(characterService.findPage(page, size, search));
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

  @PostMapping("/{id}/media")
  public ResponseEntity<Character> uploadMedia(
      @PathVariable String id,
      @RequestParam("field") String field,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(characterService.uploadMedia(id, field, file));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    characterService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
