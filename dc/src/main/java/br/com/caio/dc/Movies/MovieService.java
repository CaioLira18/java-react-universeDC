package br.com.caio.dc.Movies;

import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

@Service
public class MovieService {

  private final MovieRepository movieRepository;

  public MovieService(MovieRepository movieRepository) {
    this.movieRepository = movieRepository;
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
    existing.setYear(movie.getYear());
    existing.setDuration(movie.getDuration());
    existing.setDescription(movie.getDescription());
    return movieRepository.save(existing);
  }

  public void delete(String id) {
    Movie existing = findById(id);
    movieRepository.delete(existing);
  }
}
