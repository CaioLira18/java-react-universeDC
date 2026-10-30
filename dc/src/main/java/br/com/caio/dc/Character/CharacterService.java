package br.com.caio.dc.Character;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import br.com.caio.dc.Config.PageResponse;

import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class CharacterService {

  private static final int MAX_PAGE_SIZE = 50;

  private final CharacterRepository characterRepository;
  private final S3StorageService s3StorageService;

  public CharacterService(CharacterRepository characterRepository, S3StorageService s3StorageService) {
    this.characterRepository = characterRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Character> findAll() {
    return characterRepository.findAll();
  }

  public PageResponse<CharacterSummary> findPage(int page, int size, String search) {
    int safePage = Math.max(page, 0);
    int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
    // ordena por nome sem diferenciar maiúsculas de minúsculas
    Pageable pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Order.asc("name").ignoreCase()));

    String term = search == null ? "" : search.trim();
    Page<CharacterSummary> result = term.isEmpty()
        ? characterRepository.findAllBy(pageable)
        : characterRepository.findByNameContainingIgnoreCase(term, pageable);

    return PageResponse.from(result);
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
    existing.setLogo(character.getLogo());
    existing.setTrue_name(character.getTrue_name());
    existing.setPowers(character.getPowers());
    existing.setPlanet(character.getPlanet());
    existing.setFirst_appearance(character.getFirst_appearance());
    existing.setFirst_appearance_year(character.getFirst_appearance_year());
    existing.setVerticalmage(character.getVerticalmage());
    return characterRepository.save(existing);
  }

  public Character uploadMedia(String id, String field, MultipartFile file) {
    Character character = findById(id);
    if (!"background".equals(field) && !"verticalmage".equals(field)) {
      throw new IllegalArgumentException("Unsupported character media field: " + field);
    }

    String mediaUrl = s3StorageService.uploadCharacterMedia(character.getName(), file);
    if ("background".equals(field)) {
      character.setBackground(mediaUrl);
    } else {
      character.setVerticalmage(mediaUrl);
    }

    return characterRepository.save(character);
  }

  public void delete(String id) {
    Character existing = findById(id);
    characterRepository.delete(existing);
  }
}
