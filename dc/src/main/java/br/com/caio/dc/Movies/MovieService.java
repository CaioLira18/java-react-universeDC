package br.com.caio.dc.Movies;

import java.util.List;
import java.util.NoSuchElementException;

import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class MovieService {

  private final MovieRepository movieRepository;
  private final S3StorageService s3StorageService;

  public MovieService(MovieRepository movieRepository, S3StorageService s3StorageService) {
    this.movieRepository = movieRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Movie> findAll() {
    return movieRepository.findAll();
  }

  public Movie findById(String id) {
    return movieRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Movie not found with id: " + id));
  }

  public Movie create(Movie movie) {
    return movieRepository.save(movie);
  }

  public Movie update(String id, Movie movie) {
    Movie existing = findById(id);
    existing.setTitle(movie.getTitle());
    existing.setMovieLogo(movie.getMovieLogo());
    existing.setVerticalImage(movie.getVerticalImage());
    existing.setBanner(movie.getBanner());
    existing.getImages().clear();
    if (movie.getImages() != null) {
      existing.getImages().addAll(movie.getImages());
    }
    existing.setYear(movie.getYear());
    existing.setDuration(movie.getDuration());
    existing.setDescription(movie.getDescription());
    return movieRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadMovieMedia(id, file);
  }

  public void delete(String id) {
    Movie existing = findById(id);
    movieRepository.delete(existing);
  }
}
