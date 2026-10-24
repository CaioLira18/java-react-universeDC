package br.com.caio.dc.HomeSlide;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeSlideRepository extends JpaRepository<HomeSlide, String> {

  List<HomeSlide> findByActiveTrueOrderByDisplayOrderAsc();

  List<HomeSlide> findAllByOrderByDisplayOrderAsc();
}
