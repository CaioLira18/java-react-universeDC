package br.com.caio.dc.Content;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import br.com.caio.dc.Config.PageResponse;

@Service
public class CatalogService {

  private static final int MAX_PAGE_SIZE = 50;
  private static final Set<String> CATEGORIES = Set.of("all", "movie", "series", "game");

  private final ContentRepository contentRepository;

  public CatalogService(ContentRepository contentRepository) {
    this.contentRepository = contentRepository;
  }

  public PageResponse<CatalogItem> findPage(int page, int size, String search, String category) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    // sem Sort: a ordenação já está na query nativa
    Pageable pageable = PageRequest.of(safePage, safeSize);

    String term = search == null ? "" : search.trim();
    String safeCategory = category != null && CATEGORIES.contains(category) ? category : "all";

    Page<CatalogItem> result = contentRepository
        .findCatalog(term, safeCategory, pageable)
        .map(row -> new CatalogItem(row.getId(), row.getTitle(), row.getKind(), row.getImage()));

    return PageResponse.from(result);
  }
}
