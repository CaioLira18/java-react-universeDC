package br.com.caio.dc.Character;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.caio.dc.Config.S3StorageService;
import br.com.caio.dc.Content.Content;
import br.com.caio.dc.Content.ContentRepository;
import br.com.caio.dc.Movies.Movie;
import br.com.caio.dc.Series.Series;

@Service
public class CharacterAppearanceService {

  private final CharacterAppearanceRepository appearanceRepository;
  private final CharacterRepository characterRepository;
  private final ContentRepository contentRepository;
  private final S3StorageService s3StorageService;

  public CharacterAppearanceService(
      CharacterAppearanceRepository appearanceRepository,
      CharacterRepository characterRepository,
      ContentRepository contentRepository,
      S3StorageService s3StorageService) {
    this.appearanceRepository = appearanceRepository;
    this.characterRepository = characterRepository;
    this.contentRepository = contentRepository;
    this.s3StorageService = s3StorageService;
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

    if (appearanceRepository.existsByCharacter_IdAndContent_Id(character.getId(), content.getId())) {
      throw new IllegalArgumentException("This character is already related to this content");
    }
    if (request.getCharacterImage() == null || request.getCharacterImage().isBlank()) {
      throw new IllegalArgumentException("Character image is required");
    }

    CharacterAppearance appearance = new CharacterAppearance();
    appearance.setCharacter(character);
    appearance.setContent(content);
    appearance.setCharacterImage(request.getCharacterImage());

    return appearanceRepository.save(appearance);
  }

  public String uploadCharacterMedia(String characterId, String contentId, MultipartFile file) {
    characterRepository.findById(characterId)
        .orElseThrow(() -> new NoSuchElementException("Character not found with id: " + characterId));
    Content content = contentRepository.findById(contentId)
        .orElseThrow(() -> new NoSuchElementException("Content not found with id: " + contentId));

    String folder = content instanceof Movie ? "movies"
        : content instanceof Series ? "series"
            : null;
    if (folder == null) {
      throw new IllegalArgumentException("Character appearances can only be uploaded for movies or series");
    }

    return s3StorageService.uploadContentCharacterMedia(folder, contentId, characterId, file);
  }

  public void delete(String id) {
    CharacterAppearance existing = findById(id);
    appearanceRepository.delete(existing);
  }
}
