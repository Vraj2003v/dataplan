package com.dataplan.dto;

import java.util.List;

public class SearchResponse {
    private String originalQuery;
    private String spellSuggestion;
    private List<String> completions;
    private String detectedPattern;
    private List<PlanDTO> results;
    private long totalResults;

    public SearchResponse() {}

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final SearchResponse r = new SearchResponse();
        public Builder originalQuery(String v) { r.originalQuery = v; return this; }
        public Builder spellSuggestion(String v) { r.spellSuggestion = v; return this; }
        public Builder completions(List<String> v) { r.completions = v; return this; }
        public Builder detectedPattern(String v) { r.detectedPattern = v; return this; }
        public Builder results(List<PlanDTO> v) { r.results = v; return this; }
        public Builder totalResults(long v) { r.totalResults = v; return this; }
        public SearchResponse build() { return r; }
    }

    public String getOriginalQuery() { return originalQuery; }
    public void setOriginalQuery(String v) { this.originalQuery = v; }
    public String getSpellSuggestion() { return spellSuggestion; }
    public void setSpellSuggestion(String v) { this.spellSuggestion = v; }
    public List<String> getCompletions() { return completions; }
    public void setCompletions(List<String> v) { this.completions = v; }
    public String getDetectedPattern() { return detectedPattern; }
    public void setDetectedPattern(String v) { this.detectedPattern = v; }
    public List<PlanDTO> getResults() { return results; }
    public void setResults(List<PlanDTO> v) { this.results = v; }
    public long getTotalResults() { return totalResults; }
    public void setTotalResults(long v) { this.totalResults = v; }
}
