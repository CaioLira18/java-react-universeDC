package br.com.caio.dc.Planet;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PlanetRepository extends JpaRepository<Planet, String> {
}
