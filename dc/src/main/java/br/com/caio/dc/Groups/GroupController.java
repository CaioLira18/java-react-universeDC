package br.com.caio.dc.Groups;

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
@RequestMapping("/groups")
public class GroupController {

  private final GroupService groupService;

  public GroupController(GroupService groupService) {
    this.groupService = groupService;
  }

  @GetMapping
  public ResponseEntity<List<Group>> findActive() {
    return ResponseEntity.ok(groupService.findActive());
  }

  @GetMapping("/admin")
  public ResponseEntity<List<Group>> findAll() {
    return ResponseEntity.ok(groupService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<Group> findById(@PathVariable String id) {
    return ResponseEntity.ok(groupService.findActiveById(id));
  }

  @PostMapping
  public ResponseEntity<Group> create(@RequestBody Group group) {
    return ResponseEntity.status(HttpStatus.CREATED).body(groupService.create(group));
  }

  @PutMapping("/{id}")
  public ResponseEntity<Group> update(@PathVariable String id, @RequestBody Group group) {
    return ResponseEntity.ok(groupService.update(id, group));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<Map<String, String>> uploadMedia(
      @PathVariable String id,
      @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(Map.of("url", groupService.uploadMedia(id, file)));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    groupService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
