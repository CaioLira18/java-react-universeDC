package br.com.caio.dc.Games;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import br.com.caio.dc.Character.Character;
import br.com.caio.dc.Character.CharacterRepository;

@Service
public class CharacterGameAppearanceService {

  private final CharacterGameAppearanceRepository appearanceRepository;
  private final CharacterRepository characterRepository;
  private final GameRepository gameRepository;

  public CharacterGameAppearanceService(
      CharacterGameAppearanceRepository appearanceRepository,
      CharacterRepository characterRepository,
      GameRepository gameRepository) {
    this.appearanceRepository = appearanceRepository;
    this.characterRepository = characterRepository;
    this.gameRepository = gameRepository;
  }

  public List<CharacterGameAppearance> findAll() {
    return appearanceRepository.findAll();
  }

  public CharacterGameAppearance create(CharacterGameAppearanceRequest request) {
    Character character = characterRepository.findById(request.getCharacterId())
        .orElseThrow(() -> new NoSuchElementException(
            "Character not found with id: " + request.getCharacterId()));
    Game game = gameRepository.findById(request.getGameId())
        .orElseThrow(() -> new NoSuchElementException("Game not found with id: " + request.getGameId()));

    if (request.getCharacterImage() == null || request.getCharacterImage().isBlank()) {
      throw new IllegalArgumentException("Character image URL is required");
    }
    if (appearanceRepository.existsByCharacter_IdAndGame_Id(character.getId(), game.getId())) {
      throw new IllegalArgumentException("This character is already linked to the selected game");
    }

    CharacterGameAppearance appearance = new CharacterGameAppearance();
    appearance.setCharacter(character);
    appearance.setGame(game);
    appearance.setCharacterImage(request.getCharacterImage().trim());
    return appearanceRepository.save(appearance);
  }

  public void delete(String id) {
    CharacterGameAppearance appearance = appearanceRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Game appearance not found with id: " + id));
    appearanceRepository.delete(appearance);
  }
}
