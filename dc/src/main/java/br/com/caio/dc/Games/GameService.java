package br.com.caio.dc.Games;

import java.util.List;
import java.util.NoSuchElementException;

import br.com.caio.dc.Character.CharacterRepository;
import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class GameService {

  private final GameRepository gameRepository;
  private final CharacterGameAppearanceRepository appearanceRepository;
  private final CharacterRepository characterRepository;
  private final S3StorageService s3StorageService;

  public GameService(
      GameRepository gameRepository,
      CharacterGameAppearanceRepository appearanceRepository,
      CharacterRepository characterRepository,
      S3StorageService s3StorageService) {
    this.gameRepository = gameRepository;
    this.appearanceRepository = appearanceRepository;
    this.characterRepository = characterRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Game> findAll() {
    return gameRepository.findAll();
  }

  public Game findById(String id) {
    return gameRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Game not found with id: " + id));
  }

  public Game create(Game game) {
    return gameRepository.save(game);
  }

  public Game update(String id, Game game) {
    Game existing = findById(id);
    existing.setTitle(game.getTitle());
    existing.setGameLogo(game.getGameLogo());
    existing.setDescription(game.getDescription());
    existing.setBanner(game.getBanner());
    existing.getImages().clear();
    if (game.getImages() != null) {
      existing.getImages().addAll(game.getImages());
    }
    return gameRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadGameMedia(id, file);
  }

  public String uploadCharacterMedia(String gameId, String characterId, MultipartFile file) {
    findById(gameId);
    if (!characterRepository.existsById(characterId)) {
      throw new NoSuchElementException("Character not found with id: " + characterId);
    }
    return s3StorageService.uploadGameCharacterMedia(gameId, characterId, file);
  }

  public void delete(String id) {
    Game game = findById(id);
    if (appearanceRepository.existsByGame_Id(id)) {
      throw new IllegalArgumentException("Remove the character relationships before deleting this game");
    }
    gameRepository.delete(game);
  }
}
