package br.com.caio.dc.Users;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
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
@RequestMapping("/users")
public class UserController {

  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @GetMapping
  public ResponseEntity<List<User>> findAll() {
    return ResponseEntity.ok(userService.findAll());
  }

  @GetMapping("/{id}")
  public ResponseEntity<User> findById(@PathVariable String id) {
    return ResponseEntity.ok(userService.findById(id));
  }

  @GetMapping("/me")
  public ResponseEntity<UserProfileResponse> findCurrentProfile(
      @AuthenticationPrincipal UserDetails userDetails) {
    return ResponseEntity.ok(userService.findProfileByEmail(userDetails.getUsername()));
  }

  @PostMapping("/register")
  public ResponseEntity<User> register(@RequestBody RegisterRequest request) {
    User created = userService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
    return ResponseEntity.ok(userService.login(request));
  }

  @PostMapping("/{id}/media")
  public ResponseEntity<User> uploadMedia(@PathVariable String id, @RequestParam("file") MultipartFile file) {
    return ResponseEntity.ok(userService.uploadMedia(id, file));
  }

  @PutMapping("/{id}")
  public ResponseEntity<User> update(@PathVariable String id, @RequestBody RegisterRequest request) {
    return ResponseEntity.ok(userService.update(id, request));
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    userService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
