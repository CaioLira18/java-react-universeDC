package br.com.caio.dc.Character;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CharacterRepository extends JpaRepository<Character, String> {

  // projeção em DTO: o banco seleciona apenas id, name e background
  Page<CharacterSummary> findAllBy(Pageable pageable);

  Page<CharacterSummary> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
