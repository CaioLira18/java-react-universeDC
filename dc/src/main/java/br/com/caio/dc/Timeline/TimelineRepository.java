package br.com.caio.dc.Timeline;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TimelineRepository extends JpaRepository<Timeline, String> {
  List<Timeline> findByActiveTrueOrderByDisplayOrderAsc();

  List<Timeline> findAllByOrderByDisplayOrderAsc();
}
