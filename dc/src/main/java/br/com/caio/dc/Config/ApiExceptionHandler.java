package br.com.caio.dc.Config;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException exception) {
    return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
  }

  @ExceptionHandler(java.util.NoSuchElementException.class)
  public ResponseEntity<Map<String, String>> handleNotFound(java.util.NoSuchElementException exception) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", exception.getMessage()));
  }
}
