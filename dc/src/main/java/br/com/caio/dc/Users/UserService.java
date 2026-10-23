package br.com.caio.dc.Users;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.caio.dc.Config.JwtService;
import br.com.caio.dc.Config.S3StorageService;
import br.com.caio.dc.Users.enums.UserRole;

@Service
public class UserService implements UserDetailsService {

  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final S3StorageService s3StorageService;

  public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,
      S3StorageService s3StorageService) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
    this.s3StorageService = s3StorageService;
  }

  public List<User> findAll() {
    return userRepository.findAll();
  }

  public User findById(String id) {
    return userRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
  }

  public UserProfileResponse findProfileByEmail(String email) {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new NoSuchElementException("User not found with email: " + email));
    return UserProfileResponse.from(user);
  }

  public User create(RegisterRequest request) {
    if (request.getName() == null || request.getName().isBlank()) {
      throw new IllegalArgumentException("Name is required");
    }

    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }

    if (request.getPassword() == null || request.getPassword().length() < 6) {
      throw new IllegalArgumentException("Password must have at least 6 characters");
    }

    if (userRepository.existsByEmail(request.getEmail().trim())) {
      throw new IllegalArgumentException("Email already registered");
    }

    User user = new User();
    user.setName(request.getName().trim());
    user.setEmail(request.getEmail().trim());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setImageUrl(request.getImageUrl());
    user.setRole(UserRole.USER);
    return userRepository.save(user);
  }

  public AuthResponse login(LoginRequest request) {
    if (request.getEmail() == null || request.getEmail().isBlank()) {
      throw new IllegalArgumentException("Email is required");
    }

    if (request.getPassword() == null || request.getPassword().isBlank()) {
      throw new IllegalArgumentException("Password is required");
    }

    User user = userRepository.findByEmail(request.getEmail().trim())
        .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
      throw new IllegalArgumentException("Invalid credentials");
    }

    String token = jwtService.generateToken(user.getEmail());
    return new AuthResponse(token, user.getId(), user.getEmail(), user.getName(), user.getRole().name(),
        user.getImageUrl());
  }

  public User update(String id, RegisterRequest request) {
    User existing = findById(id);
    if (request.getName() != null && !request.getName().isBlank()) {
      existing.setName(request.getName().trim());
    }

    if (request.getEmail() != null && !request.getEmail().isBlank()) {
      existing.setEmail(request.getEmail().trim());
    }

    if (request.getImageUrl() != null) {
      existing.setImageUrl(request.getImageUrl());
    }

    if (request.getPassword() != null && !request.getPassword().isBlank()) {
      existing.setPassword(passwordEncoder.encode(request.getPassword()));
    }

    return userRepository.save(existing);
  }

  public User uploadMedia(String userId, MultipartFile file) {
    User user = findById(userId);
    String mediaUrl = s3StorageService.uploadUserMedia(userId, file);
    user.setImageUrl(mediaUrl);
    return userRepository.save(user);
  }

  public void delete(String id) {
    User existing = findById(id);
    userRepository.delete(existing);
  }

  @Override
  public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
    User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

    return org.springframework.security.core.userdetails.User.builder()
        .username(user.getEmail())
        .password(user.getPassword())
        .roles(user.getRole().name())
        .build();
  }
}
