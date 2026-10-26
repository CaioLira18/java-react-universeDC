package br.com.caio.dc.Timeline;

import java.util.List;
import java.util.NoSuchElementException;

import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TimelineService {

  private final TimelineRepository timelineRepository;
  private final S3StorageService s3StorageService;

  public TimelineService(TimelineRepository timelineRepository, S3StorageService s3StorageService) {
    this.timelineRepository = timelineRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Timeline> findActive() {
    return timelineRepository.findByActiveTrueOrderByDisplayOrderAsc();
  }

  public List<Timeline> findAll() {
    return timelineRepository.findAllByOrderByDisplayOrderAsc();
  }

  public Timeline findByIdForPublic(String id) {
    Timeline timeline = findById(id);
    if (!Boolean.TRUE.equals(timeline.getActive())) {
      throw new NoSuchElementException("Timeline not found with id: " + id);
    }
    return timeline;
  }

  public Timeline create(Timeline timeline) {
    return timelineRepository.save(timeline);
  }

  public Timeline update(String id, Timeline timeline) {
    Timeline existing = findById(id);
    existing.setYear(timeline.getYear());
    existing.setEra(timeline.getEra());
    existing.setTitle(timeline.getTitle());
    existing.setDescription(timeline.getDescription());
    existing.setImage(timeline.getImage());
    existing.setImageAlt(timeline.getImageAlt());
    existing.setAccent(timeline.getAccent());
    if (timeline.getDisplayOrder() != null) {
      existing.setDisplayOrder(timeline.getDisplayOrder());
    }
    if (timeline.getActive() != null) {
      existing.setActive(timeline.getActive());
    }
    return timelineRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadTimelineMedia(id, file);
  }

  public void delete(String id) {
    timelineRepository.delete(findById(id));
  }

  private Timeline findById(String id) {
    return timelineRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Timeline not found with id: " + id));
  }
}
