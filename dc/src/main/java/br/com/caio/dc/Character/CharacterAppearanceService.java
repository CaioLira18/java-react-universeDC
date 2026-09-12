package br.com.caio.dc.Character;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import br.com.caio.dc.Content.Content;
import br.com.caio.dc.Content.ContentRepository;

@Service
public class CharacterAppearanceService {

  private final CharacterAppearanceRepository appearanceRepository;
  private final CharacterRepository characterRepository;
  private final ContentRepository contentRepository;

  public CharacterAppearanceService(
      CharacterAppearanceRepository appearanceRepository,
      CharacterRepository characterRepository,
      ContentRepository contentRepository) {
    this.appearanceRepository = appearanceRepository;
    this.characterRepository = characterRepository;
    this.contentRepository = contentRepository;
  }

  public List<CharacterAppearance> findAll() {
    return appearanceRepository.findAll();
  }

  public CharacterAppearance findById(String id) {
    return appearanceRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Appearance not found with id: " + id));
  }

  public CharacterAppearance create(CharacterAppearanceRequest request) {
    Character character = characterRepository.findById(request.getCharacterId())
        .orElseThrow(() -> new NoSuchElementException(
            "Character not found with id: " + request.getCharacterId()));

    Content content = contentRepository.findById(request.getContentId())
        .orElseThrow(() -> new NoSuchElementException(
            "Content not found with id: " + request.getContentId()));

    CharacterAppearance appearance = new CharacterAppearance();
    appearance.setCharacter(character);
    appearance.setContent(content);
    appearance.setCharacterImage(request.getCharacterImage());

    return appearanceRepository.save(appearance);
  }

  public void delete(String id) {
    CharacterAppearance existing = findById(id);
    appearanceRepository.delete(existing);
  }
}
