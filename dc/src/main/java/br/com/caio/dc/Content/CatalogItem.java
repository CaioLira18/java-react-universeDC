package br.com.caio.dc.Content;

/** Item do catálogo: type = "movie" | "series" | "game"; image = capa vertical/logo. */
public record CatalogItem(String id, String title, String type, String image) {
}
