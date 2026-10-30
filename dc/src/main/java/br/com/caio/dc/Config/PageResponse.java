package br.com.caio.dc.Config;

import java.util.List;

import org.springframework.data.domain.Page;

/** Resposta paginada com um formato estável para o frontend. */
public record PageResponse<T>(
    List<T> content,
    int page,          // página atual (começa em 0)
    int size,
    long totalElements,
    int totalPages,
    boolean last) {

  public static <T> PageResponse<T> from(Page<T> page) {
    return new PageResponse<>(
        page.getContent(),
        page.getNumber(),
        page.getSize(),
        page.getTotalElements(),
        page.getTotalPages(),
        page.isLast());
  }
}
