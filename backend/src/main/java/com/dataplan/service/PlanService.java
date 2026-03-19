package com.dataplan.service;

import com.dataplan.dto.*;
import com.dataplan.model.*;
import com.dataplan.repository.*;
import com.dataplan.scraper.ScraperService;
import com.dataplan.search.*;
import org.springframework.cache.annotation.*;
import org.springframework.stereotype.Service;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class PlanService {

    private final PlanRepository        planRepository;
    private final SearchLogRepository   searchLogRepository;
    private final ScraperService        scraperService;
    private final SpellCheckService     spellCheckService;
    private final WordCompletionService wordCompletionService;
    private final RegexSearchService    regexSearchService;

    public PlanService(PlanRepository planRepository, SearchLogRepository searchLogRepository,
                       ScraperService scraperService, SpellCheckService spellCheckService,
                       WordCompletionService wordCompletionService, RegexSearchService regexSearchService) {
        this.planRepository       = planRepository;
        this.searchLogRepository  = searchLogRepository;
        this.scraperService       = scraperService;
        this.spellCheckService    = spellCheckService;
        this.wordCompletionService = wordCompletionService;
        this.regexSearchService   = regexSearchService;
    }

    @Cacheable("allPlans")
    public List<PlanDTO> getAllPlans() {
        return planRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    @Cacheable(value = "byCarrier", key = "#carrier")
    public List<PlanDTO> getByCarrier(String carrier) {
        List<Plan> plans = planRepository.findByCarrierIgnoreCase(carrier);
        if (plans.isEmpty()) plans = scraperService.scrapeCarrier(carrier.toUpperCase());
        return plans.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public List<PlanDTO> getFeatured() {
        return planRepository.findByIsFeaturedTrue().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PlanDTO getBestPlan(String criteria) {
        Optional<Plan> plan = "data".equalsIgnoreCase(criteria)
            ? planRepository.findTopByOrderByDataGbDesc()
            : planRepository.findTopByOrderByPriceAsc();

        return plan.map(p -> {
            PlanDTO dto = toDTO(p);
            dto.setRecommendationReason("data".equalsIgnoreCase(criteria)
                ? "Highest data: " + (p.getDataGb() == -1 ? "Unlimited" : p.getDataGb() + "GB")
                : "Lowest price: $" + String.format("%.0f", p.getPrice()) + "/mo");
            return dto;
        }).orElse(null);
    }

    public SearchResponse search(SearchRequest req) {
        String query = req.getQuery() == null ? "" : req.getQuery().trim();
        logSearch(query);

        RegexSearchService.ParsedQuery parsed = regexSearchService.parse(query);
        String[] words = query.split("\\s+");

        Optional<String> spell = (words.length > 0 && !words[0].isEmpty())
            ? spellCheckService.suggest(words[0]) : Optional.empty();

        List<String> completions = (words.length > 0 && !words[words.length - 1].isEmpty())
            ? wordCompletionService.complete(words[words.length - 1]) : List.of();

        List<Plan> results;
        String pattern = null;

        if (parsed.carrier() != null && parsed.exactPrice() != null) {
            pattern = parsed.carrier() + " plans at $" + parsed.exactPrice();
            results = planRepository.findByCarrierIgnoreCase(parsed.carrier()).stream()
                .filter(p -> Math.abs(p.getPrice() - parsed.exactPrice()) < 1.0)
                .collect(Collectors.toList());
        } else if (parsed.isUnlimited()) {
            pattern = "Unlimited data plans";
            results = planRepository.findUnlimitedPlans();
        } else if (parsed.exactPrice() != null) {
            pattern = "Plans at $" + parsed.exactPrice();
            results = planRepository.findByMaxPrice(parsed.exactPrice() + 5);
        } else if (parsed.maxPrice() != null) {
            pattern = "Plans under $" + parsed.maxPrice();
            results = planRepository.findByMaxPrice(parsed.maxPrice());
        } else if (parsed.dataGb() != null) {
            pattern = "Plans with " + parsed.dataGb() + "GB+ data";
            results = planRepository.findByMinData(parsed.dataGb());
        } else if (parsed.networkType() != null) {
            pattern = parsed.networkType() + " network plans";
            results = planRepository.findByNetworkType(parsed.networkType());
        } else if (parsed.carrier() != null) {
            results = planRepository.findByCarrierIgnoreCase(parsed.carrier());
        } else {
            String q = parsed.cleanQuery().isEmpty() ? query : parsed.cleanQuery();
            results = planRepository.searchPlans(q);
        }

        return SearchResponse.builder()
            .originalQuery(query)
            .spellSuggestion(spell.orElse(null))
            .completions(completions)
            .detectedPattern(pattern)
            .results(results.stream().map(this::toDTO).collect(Collectors.toList()))
            .totalResults(results.size())
            .build();
    }

    public List<String> getCompletions(String prefix) {
        return wordCompletionService.complete(prefix);
    }

    public List<SearchLog> getTopSearches() {
        return searchLogRepository.findTop10ByOrderBySearchCountDesc();
    }

    @CacheEvict(value = {"allPlans","byCarrier"}, allEntries = true)
    public PlanDTO create(PlanDTO dto) { return toDTO(planRepository.save(fromDTO(dto))); }

    @CacheEvict(value = {"allPlans","byCarrier"}, allEntries = true)
    public PlanDTO update(Long id, PlanDTO dto) {
        Plan p = planRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Plan not found: " + id));
        p.setName(dto.getName()); p.setPrice(dto.getPrice()); p.setDataGb(dto.getDataGb());
        p.setNetworkType(dto.getNetworkType()); p.setFeatures(dto.getFeatures());
        p.setSpeed(dto.getSpeed()); p.setPlanUrl(dto.getPlanUrl());
        p.setIsFeatured(Boolean.TRUE.equals(dto.getIsFeatured()));
        return toDTO(planRepository.save(p));
    }

    @CacheEvict(value = {"allPlans","byCarrier"}, allEntries = true)
    public void delete(Long id) { planRepository.deleteById(id); }

    private void logSearch(String query) {
        if (query.isBlank()) return;
        searchLogRepository.findByQueryIgnoreCase(query).ifPresentOrElse(
            log -> { log.setSearchCount(log.getSearchCount() + 1); searchLogRepository.save(log); },
            () -> { SearchLog log = new SearchLog(); log.setQuery(query); searchLogRepository.save(log); }
        );
    }

    public PlanDTO toDTO(Plan p) {
        return PlanDTO.builder()
            .id(p.getId()).name(p.getName()).carrier(p.getCarrier())
            .price(p.getPrice()).dataGb(p.getDataGb()).speed(p.getSpeed())
            .networkType(p.getNetworkType()).features(p.getFeatures())
            .planUrl(p.getPlanUrl()).isFeatured(p.getIsFeatured())
            .scrapedAt(p.getScrapedAt()).build();
    }

    private Plan fromDTO(PlanDTO dto) {
        Plan p = new Plan();
        p.setName(dto.getName()); p.setCarrier(dto.getCarrier());
        p.setPrice(dto.getPrice()); p.setDataGb(dto.getDataGb());
        p.setSpeed(dto.getSpeed()); p.setNetworkType(dto.getNetworkType());
        p.setFeatures(dto.getFeatures()); p.setPlanUrl(dto.getPlanUrl());
        p.setIsFeatured(Boolean.TRUE.equals(dto.getIsFeatured()));
        return p;
    }
}
