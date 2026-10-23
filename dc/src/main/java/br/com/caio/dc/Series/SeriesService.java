package br.com.caio.dc.Series;

import java.util.List;
import java.util.NoSuchElementException;

import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SeriesService {

  private final SeriesRepository seriesRepository;
  private final S3StorageService s3StorageService;

  public SeriesService(SeriesRepository seriesRepository, S3StorageService s3StorageService) {
    this.seriesRepository = seriesRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Series> findAll() {
    return seriesRepository.findAll();
  }

  public Series findById(String id) {
    return seriesRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Series not found with id: " + id));
  }

  public Series create(Series series) {
    return seriesRepository.save(series);
  }

  public Series update(String id, Series series) {
    Series existing = findById(id);
    existing.setTitle(series.getTitle());
    existing.setSerieLogo(series.getSerieLogo());
    existing.setDescription(series.getDescription());
    existing.setBanner(series.getBanner());
    existing.getImages().clear();
    if (series.getImages() != null) {
      existing.getImages().addAll(series.getImages());
    }
    return seriesRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadSeriesMedia(id, file);
  }

  public void delete(String id) {
    Series existing = findById(id);
    seriesRepository.delete(existing);
  }
}
