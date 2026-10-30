package br.com.caio.dc.Content;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ContentRepository extends JpaRepository<Content, String> {

  /** Linha leve do catálogo unificado (filmes + séries + jogos). */
  interface CatalogRow {
    String getId();
    String getTitle();
    String getKind();
    String getImage();
  }

  // Filmes e séries herdam de Content (JOINED); Game é uma tabela separada, por isso o UNION.
  // A ordenação está na própria query, então o Pageable deve chegar SEM Sort.
  // category: 'all' | 'movie' | 'series' | 'game'
  @Query(
      value = """
          select c.id as id, c.title as title, c.kind as kind, c.image as image
          from (
            select m.id as id, ct.title as title, 'movie' as kind, m.vertical_image as image
              from movie m join content ct on ct.id = m.id
            union all
            select s.id as id, ct.title as title, 'series' as kind, s.serie_logo as image
              from series s join content ct on ct.id = s.id
            union all
            select g.id as id, g.title as title, 'game' as kind, g.game_logo as image
              from games g
          ) c
          where (:category = 'all' or c.kind = :category)
            and lower(c.title) like lower(concat('%', :search, '%'))
          order by lower(c.title), c.id
          """,
      countQuery = """
          select count(*)
          from (
            select ct.title as title, 'movie' as kind
              from movie m join content ct on ct.id = m.id
            union all
            select ct.title as title, 'series' as kind
              from series s join content ct on ct.id = s.id
            union all
            select g.title as title, 'game' as kind
              from games g
          ) c
          where (:category = 'all' or c.kind = :category)
            and lower(c.title) like lower(concat('%', :search, '%'))
          """,
      nativeQuery = true)
  Page<CatalogRow> findCatalog(
      @Param("search") String search,
      @Param("category") String category,
      Pageable pageable);
}
