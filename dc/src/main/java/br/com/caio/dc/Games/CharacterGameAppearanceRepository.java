package br.com.caio.dc.Games;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CharacterGameAppearanceRepository extends JpaRepository<CharacterGameAppearance, String> {

  boolean existsByCharacter_IdAndGame_Id(String characterId, String gameId);

  boolean existsByGame_Id(String gameId);
}
