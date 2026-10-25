package br.com.caio.dc.Groups;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import br.com.caio.dc.Character.Character;
import br.com.caio.dc.Character.CharacterRepository;
import br.com.caio.dc.Config.S3StorageService;

@Service
public class GroupService {

  private final GroupRepository groupRepository;
  private final CharacterRepository characterRepository;
  private final S3StorageService s3StorageService;

  public GroupService(
      GroupRepository groupRepository,
      CharacterRepository characterRepository,
      S3StorageService s3StorageService) {
    this.groupRepository = groupRepository;
    this.characterRepository = characterRepository;
    this.s3StorageService = s3StorageService;
  }

  @Transactional(readOnly = true)
  public List<Group> findActive() {
    return groupRepository.findByActiveTrueOrderByDisplayOrderAscNameAsc();
  }

  @Transactional(readOnly = true)
  public List<Group> findAll() {
    return groupRepository.findAllByOrderByDisplayOrderAscNameAsc();
  }

  @Transactional(readOnly = true)
  public Group findById(String id) {
    return groupRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Group not found with id: " + id));
  }

  @Transactional(readOnly = true)
  public Group findActiveById(String id) {
    Group group = findById(id);
    if (!Boolean.TRUE.equals(group.getActive())) {
      throw new NoSuchElementException("Group not found with id: " + id);
    }
    return group;
  }

  @Transactional
  public Group create(Group group) {
    validateName(group.getName());
    group.setName(group.getName().trim());
    group.setCharacters(resolveCharacters(group.getCharacters()));
    if (group.getDisplayOrder() == null) group.setDisplayOrder(0);
    if (group.getActive() == null) group.setActive(true);
    return groupRepository.save(group);
  }

  @Transactional
  public Group update(String id, Group request) {
    validateName(request.getName());
    Group existing = findById(id);
    existing.setName(request.getName().trim());
    existing.setDescription(request.getDescription());
    existing.setGroupType(request.getGroupType());
    existing.setUniverse(request.getUniverse());
    existing.setBase(request.getBase());
    existing.setFoundedYear(request.getFoundedYear());
    existing.setFirstAppearance(request.getFirstAppearance());
    existing.setBanner(request.getBanner());
    if (request.getCharacters() != null) {
      existing.setCharacters(resolveCharacters(request.getCharacters()));
    }
    if (request.getDisplayOrder() != null) existing.setDisplayOrder(request.getDisplayOrder());
    if (request.getActive() != null) existing.setActive(request.getActive());
    return groupRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadGroupMedia(id, file);
  }

  @Transactional
  public void delete(String id) {
    groupRepository.delete(findById(id));
  }

  private Set<Character> resolveCharacters(Set<Character> requestedCharacters) {
    if (requestedCharacters == null || requestedCharacters.isEmpty()) return new LinkedHashSet<>();
    if (requestedCharacters.stream().anyMatch(Objects::isNull)) {
      throw new IllegalArgumentException("Group members cannot be null");
    }

    Set<String> characterIds = requestedCharacters.stream()
        .map(Character::getId)
        .filter(id -> id != null && !id.isBlank())
        .collect(Collectors.toCollection(LinkedHashSet::new));
    if (characterIds.size() != requestedCharacters.size()) {
      throw new IllegalArgumentException("Every group member must reference a saved character");
    }

    List<Character> foundCharacters = characterRepository.findAllById(characterIds);
    if (foundCharacters.size() != characterIds.size()) {
      Set<String> foundIds = foundCharacters.stream()
          .map(Character::getId)
          .collect(Collectors.toSet());
      characterIds.removeAll(foundIds);
      throw new NoSuchElementException("Characters not found: " + String.join(", ", characterIds));
    }
    return new LinkedHashSet<>(foundCharacters);
  }

  private void validateName(String name) {
    if (name == null || name.isBlank()) {
      throw new IllegalArgumentException("Group name is required");
    }
  }
}
