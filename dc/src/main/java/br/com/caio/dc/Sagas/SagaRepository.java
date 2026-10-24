package br.com.caio.dc.Sagas;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface SagaRepository extends JpaRepository<Saga, String> {

  List<Saga> findByActiveTrueOrderByDisplayOrderAsc();

  List<Saga> findAllByOrderByDisplayOrderAsc();
}
