package br.com.caio.dc.Sagas;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.caio.dc.Config.S3StorageService;

@Service
public class SagaService {

  private final SagaRepository sagaRepository;
  private final S3StorageService s3StorageService;

  public SagaService(SagaRepository sagaRepository, S3StorageService s3StorageService) {
    this.sagaRepository = sagaRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Saga> findActive() {
    return sagaRepository.findByActiveTrueOrderByDisplayOrderAsc();
  }

  public List<Saga> findAll() {
    return sagaRepository.findAllByOrderByDisplayOrderAsc();
  }

  public Saga findById(String id) {
    return sagaRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Saga not found with id: " + id));
  }

  public Saga findActiveById(String id) {
    Saga saga = findById(id);
    if (!Boolean.TRUE.equals(saga.getActive())) {
      throw new NoSuchElementException("Saga not found with id: " + id);
    }
    return saga;
  }

  public Saga create(Saga saga) {
    if (saga.getComics() != null) {
      saga.getComics().forEach(comic -> comic.setSaga(saga));
    }
    return sagaRepository.save(saga);
  }

  public Saga update(String id, Saga saga) {
    Saga existing = findById(id);
    existing.setName(saga.getName());
    existing.setDescription(saga.getDescription());
    existing.setStartYear(saga.getStartYear());
    existing.setEndYear(saga.getEndYear());
    existing.setBanner(saga.getBanner());
    if (saga.getComics() != null) {
      Map<String, SagaComic> comicsById = new HashMap<>();
      existing.getComics().forEach(comic -> comicsById.put(comic.getId(), comic));
      List<SagaComic> retainedComics = new ArrayList<>();

      for (SagaComic comicRequest : saga.getComics()) {
        SagaComic comic;
        if (comicRequest.getId() == null) {
          comic = new SagaComic();
        } else {
          comic = comicsById.get(comicRequest.getId());
          if (comic == null) {
            throw new IllegalArgumentException("Comic does not belong to saga: " + comicRequest.getId());
          }
        }
        comic.setSaga(existing);
        comic.setName(comicRequest.getName());
        comic.setReleaseYear(comicRequest.getReleaseYear());
        comic.setDescription(comicRequest.getDescription());
        comic.setCoverImage(comicRequest.getCoverImage());
        comic.setReadingOrder(comicRequest.getReadingOrder());
        retainedComics.add(comic);
      }

      existing.getComics().removeIf(comic -> !retainedComics.contains(comic));
      retainedComics.stream()
          .filter(comic -> !existing.getComics().contains(comic))
          .forEach(existing.getComics()::add);
    }
    if (saga.getDisplayOrder() != null) {
      existing.setDisplayOrder(saga.getDisplayOrder());
    }
    if (saga.getActive() != null) {
      existing.setActive(saga.getActive());
    }
    return sagaRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadSagaMedia(id, file);
  }

  public String uploadComicMedia(String sagaId, String comicId, MultipartFile file) {
    Saga saga = findById(sagaId);
    SagaComic comic = saga.getComics().stream()
        .filter(item -> item.getId().equals(comicId))
        .findFirst()
        .orElseThrow(() -> new NoSuchElementException("Comic not found in saga: " + comicId));
    String imageUrl = s3StorageService.uploadSagaComicMedia(sagaId, comicId, file);
    comic.setCoverImage(imageUrl);
    sagaRepository.save(saga);
    return imageUrl;
  }

  public void delete(String id) {
    sagaRepository.delete(findById(id));
  }
}
