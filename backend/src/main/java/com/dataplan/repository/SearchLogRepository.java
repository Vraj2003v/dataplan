package com.dataplan.repository;

import com.dataplan.model.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {
    Optional<SearchLog> findByQueryIgnoreCase(String query);

    @Query("SELECT s FROM SearchLog s ORDER BY s.searchCount DESC LIMIT 10")
    List<SearchLog> findTop10ByOrderBySearchCountDesc();
}
