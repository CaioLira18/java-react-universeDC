package br.com.caio.dc.HomeSlide;

import java.util.List;
import java.util.NoSuchElementException;

import br.com.caio.dc.Config.S3StorageService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class HomeSlideService {

  private final HomeSlideRepository homeSlideRepository;
  private final S3StorageService s3StorageService;

  public HomeSlideService(HomeSlideRepository homeSlideRepository, S3StorageService s3StorageService) {
    this.homeSlideRepository = homeSlideRepository;
    this.s3StorageService = s3StorageService;
  }

  public List<HomeSlide> findActive() {
    return homeSlideRepository.findByActiveTrueOrderByDisplayOrderAsc();
  }

  public List<HomeSlide> findAll() {
    return homeSlideRepository.findAllByOrderByDisplayOrderAsc();
  }

  public HomeSlide create(HomeSlide homeSlide) {
    return homeSlideRepository.save(homeSlide);
  }

  public HomeSlide update(String id, HomeSlide homeSlide) {
    HomeSlide existing = findById(id);
    existing.setTitle(homeSlide.getTitle());
    existing.setSubtitle(homeSlide.getSubtitle());
    existing.setDescription(homeSlide.getDescription());
    existing.setImage(homeSlide.getImage());
    existing.setButtonText(homeSlide.getButtonText());
    existing.setButtonLink(homeSlide.getButtonLink());
    if (homeSlide.getDisplayOrder() != null) {
      existing.setDisplayOrder(homeSlide.getDisplayOrder());
    }
    if (homeSlide.getActive() != null) {
      existing.setActive(homeSlide.getActive());
    }
    return homeSlideRepository.save(existing);
  }

  public String uploadMedia(String id, MultipartFile file) {
    findById(id);
    return s3StorageService.uploadHomeSlideMedia(id, file);
  }

  public void delete(String id) {
    homeSlideRepository.delete(findById(id));
  }

  private HomeSlide findById(String id) {
    return homeSlideRepository.findById(id)
        .orElseThrow(() -> new NoSuchElementException("Home slide not found with id: " + id));
  }
}
