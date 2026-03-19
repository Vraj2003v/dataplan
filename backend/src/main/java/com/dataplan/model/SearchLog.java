package com.dataplan.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_logs")
public class SearchLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true) private String query;
    @Column(name = "search_count") private Integer searchCount = 1;
    @Column(name = "last_searched") private LocalDateTime lastSearched;

    @PrePersist @PreUpdate
    protected void onSave() { lastSearched = LocalDateTime.now(); }

    public SearchLog() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getQuery() { return query; }
    public void setQuery(String query) { this.query = query; }
    public Integer getSearchCount() { return searchCount; }
    public void setSearchCount(Integer searchCount) { this.searchCount = searchCount; }
    public LocalDateTime getLastSearched() { return lastSearched; }
    public void setLastSearched(LocalDateTime lastSearched) { this.lastSearched = lastSearched; }
}
