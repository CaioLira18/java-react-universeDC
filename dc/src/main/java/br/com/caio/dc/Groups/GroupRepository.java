package br.com.caio.dc.Groups;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface GroupRepository extends JpaRepository<Group, String> {

  List<Group> findByActiveTrueOrderByDisplayOrderAscNameAsc();

  List<Group> findAllByOrderByDisplayOrderAscNameAsc();
}
