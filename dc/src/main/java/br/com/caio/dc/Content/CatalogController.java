package br.com.caio.dc.Content;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import br.com.caio.dc.Config.PageResponse;

@RestController
@RequestMapping("/catalog")
public class CatalogController {

  private final CatalogService catalogService;

  public CatalogController(CatalogService catalogService) {
    this.catalogService = catalogService;
  }

  // GET /catalog/page?page=0&size=24&search=bat&category=all|movie|series|game
  @GetMapping("/page")
  public ResponseEntity<PageResponse<CatalogItem>> findPage(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "24") int size,
      @RequestParam(defaultValue = "") String search,
      @RequestParam(defaultValue = "all") String category) {
    return ResponseEntity.ok(catalogService.findPage(page, size, search, category));
  }
}
