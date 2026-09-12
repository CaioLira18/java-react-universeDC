package br.com.caio.dc.Series;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class SeriesService {

  private final SeriesRepository seriesRepository;

  public SeriesService(SeriesRepository seriesRepository) {
    this.seriesRepository = seriesRepository;
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
    return seriesRepository.save(existing);
  }

  public void delete(String id) {
    Series existing = findById(id);
    seriesRepository.delete(existing);
  }
}
