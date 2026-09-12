package br.com.caio.dc.Character;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class CharacterService {

  private final CharacterRepository characterRepository;

  public CharacterService(CharacterRepository characterRepository) {
    this.characterRepository = characterRepository;
  }

  public List<Character> findAll() {
    return characterRepository.findAll();
  }

  public Character findById(String id) {
    return characterRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Character not found with id: " + id));
  }

  public Character create(Character character) {
    return characterRepository.save(character);
  }

  public Character update(String id, Character character) {
    Character existing = findById(id);
    existing.setName(character.getName());
    existing.setDescription(character.getDescription());
    existing.setBackground(character.getBackground());
    return characterRepository.save(existing);
  }

  public void delete(String id) {
    Character existing = findById(id);
    characterRepository.delete(existing);
  }
}
