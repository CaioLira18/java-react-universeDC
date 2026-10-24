package br.com.caio.dc.Planet;

import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.caio.dc.Config.S3StorageService;

@Service
public class PlanetService {

  private final PlanetRepository planetRepository;
  private final S3StorageService s3StorageService;

  public PlanetService(PlanetRepository planetRepository, S3StorageService s3StorageService) {
    this.planetRepository = planetRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<Planet> findAll() {
    return planetRepository.findAll();
  }

  public Planet findById(String id) {
    return planetRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Planet not found with id: " + id));
  }

  public Planet create(Planet planet) {
    planet.setId(null);
    if (planet.getImages() == null) {
      planet.setImages(new ArrayList<>());
    }
    return planetRepository.save(planet);
  }

  public Planet update(String id, Planet planet) {
    Planet existing = findById(id);
    existing.setName(planet.getName());
    existing.setDescription(planet.getDescription());
    existing.setImage(planet.getImage());
    existing.setColor(planet.getColor());
    existing.setSector(planet.getSector());
    existing.setNotableResidents(planet.getNotableResidents());
    existing.setPositionX(planet.getPositionX());
    existing.setPositionY(planet.getPositionY());
    existing.setPositionZ(planet.getPositionZ());
    existing.setSize(planet.getSize());
    if (planet.getImages() != null) {
      existing.setImages(new ArrayList<>(planet.getImages()));
    }
    return planetRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    Planet planet = findById(id);
    String imageUrl = s3StorageService.uploadPlanetMedia(id, file);
    List<String> images = planet.getImages() == null
        ? new ArrayList<>()
        : new ArrayList<>(planet.getImages());
    images.add(imageUrl);
    planet.setImages(images);
    planetRepository.save(planet);
    return imageUrl;
  }

  public String uploadPrimaryMedia(String id, MultipartFile file) {
    Planet planet = findById(id);
    String imageUrl = s3StorageService.uploadPlanetMedia(id, file);
    planet.setImage(imageUrl);
    planetRepository.save(planet);
    return imageUrl;
  }

  public void delete(String id) {
    planetRepository.delete(findById(id));
  }
}
