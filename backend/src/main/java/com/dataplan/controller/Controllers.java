package com.dataplan.controller;

import com.dataplan.crawler.*;
import com.dataplan.dto.*;
import com.dataplan.model.SearchLog;
import com.dataplan.search.*;
import com.dataplan.service.*;
import com.dataplan.scraper.ScraperService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

// ── Auth ──────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/auth")
class AuthController {
    private final AuthService authService;
    public AuthController(AuthService authService) { this.authService = authService; }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }
}

// ── Plans ─────────────────────────────────────────────────────
@RestController
@RequestMapping("/api")
class PlanController {
    private final PlanService planService;
    private final ScraperService scraperService;
    private final AVLTreeService avlTreeService;
    private final HeapRankingService heapRankingService;
    private final DijkstraService dijkstraService;
    private final HuffmanService huffmanService;
    private final SpellCheckService spellCheckService;

    public PlanController(PlanService planService, ScraperService scraperService,
                          AVLTreeService avlTreeService, HeapRankingService heapRankingService,
                          DijkstraService dijkstraService, HuffmanService huffmanService,
                          SpellCheckService spellCheckService) {
        this.planService        = planService;
        this.scraperService     = scraperService;
        this.avlTreeService     = avlTreeService;
        this.heapRankingService = heapRankingService;
        this.dijkstraService    = dijkstraService;
        this.huffmanService     = huffmanService;
        this.spellCheckService  = spellCheckService;
    }

    @GetMapping("/plans")
    public ResponseEntity<List<PlanDTO>> all() { return ResponseEntity.ok(planService.getAllPlans()); }

    @GetMapping("/plans/featured")
    public ResponseEntity<List<PlanDTO>> featured() { return ResponseEntity.ok(planService.getFeatured()); }

    @GetMapping("/plans/best")
    public ResponseEntity<?> best(@RequestParam(defaultValue = "price") String criteria) {
        PlanDTO p = planService.getBestPlan(criteria);
        return p != null ? ResponseEntity.ok(p) : ResponseEntity.notFound().build();
    }

    @GetMapping("/carriers/{carrier}/plans")
    public ResponseEntity<List<PlanDTO>> byCarrier(@PathVariable String carrier) {
        return ResponseEntity.ok(planService.getByCarrier(carrier));
    }

    @PostMapping("/search")
    public ResponseEntity<SearchResponse> search(@RequestBody SearchRequest req) {
        return ResponseEntity.ok(planService.search(req));
    }

    @GetMapping("/search/complete")
    public ResponseEntity<List<String>> complete(@RequestParam String prefix) {
        return ResponseEntity.ok(planService.getCompletions(prefix));
    }

    @GetMapping("/search/frequency")
    public ResponseEntity<List<SearchLog>> freq() { return ResponseEntity.ok(planService.getTopSearches()); }

    // ── ACC: Spell check all suggestions ──────────────────────────
    @GetMapping("/search/spell")
    public ResponseEntity<Map<String, Object>> spell(@RequestParam String word) {
        var suggestions = spellCheckService.suggestAll(word, 5);
        return ResponseEntity.ok(Map.of(
            "word", word,
            "suggestions", suggestions,
            "algorithm", "Damerau-Levenshtein Distance — O(n*m)"
        ));
    }

    // ── ACC: AVL Tree sorted retrieval ───────────────────────────
    @GetMapping("/plans/sorted")
    public ResponseEntity<Map<String, Object>> sortedPlans(
            @RequestParam(defaultValue = "price") String by,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        avlTreeService.loadPlans(planService.getAllPlans());
        List<PlanDTO> plans;
        if ("data".equalsIgnoreCase(by)) {
            plans = avlTreeService.getSortedByData();
        } else if (minPrice != null && maxPrice != null) {
            plans = avlTreeService.getPlansByPriceRange(minPrice, maxPrice);
        } else {
            plans = avlTreeService.getSortedByPrice();
        }
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("plans", plans);
        resp.put("sortedBy", by);
        resp.put("treeStats", avlTreeService.getTreeStats());
        return ResponseEntity.ok(resp);
    }

    // ── ACC: Heap-based plan ranking ─────────────────────────────
    @GetMapping("/plans/ranked")
    public ResponseEntity<Map<String, Object>> rankedPlans(
            @RequestParam(defaultValue = "value") String criteria,
            @RequestParam(defaultValue = "10") int top) {
        var ranked = heapRankingService.rankPlans(planService.getAllPlans(), criteria, top);
        return ResponseEntity.ok(Map.of(
            "criteria", criteria,
            "results", ranked,
            "algorithmInfo", heapRankingService.getAlgorithmInfo()
        ));
    }

    // ── ACC: Dijkstra upgrade path ───────────────────────────────
    @GetMapping("/plans/upgrade-path")
    public ResponseEntity<Map<String, Object>> upgradePath(
            @RequestParam String fromId,
            @RequestParam String toId) {
        List<PlanDTO> allPlans = planService.getAllPlans();
        List<DijkstraService.PlanNode> nodes = allPlans.stream()
            .map(p -> new DijkstraService.PlanNode(
                String.valueOf(p.getId()), p.getName(), p.getCarrier(),
                p.getPrice(), p.getDataGb() == null ? 0 : (p.getDataGb() == -1 ? 100 : p.getDataGb())
            )).toList();
        var result = dijkstraService.findCheapestUpgradePath(nodes, fromId, toId);
        return ResponseEntity.ok(Map.of(
            "from", fromId,
            "to", toId,
            "path", result.path(),
            "totalCost", result.totalCost(),
            "steps", result.steps(),
            "algorithm", result.algorithm()
        ));
    }

    // ── ACC: Huffman compression ─────────────────────────────────
    @PostMapping("/plans/compress")
    public ResponseEntity<HuffmanService.HuffmanResult> compress(@RequestBody Map<String, String> body) {
        String text = body.getOrDefault("text", "");
        return ResponseEntity.ok(huffmanService.encode(text));
    }

    @PostMapping("/scrape/{carrier}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> scrape(@PathVariable String carrier) {
        var plans = scraperService.scrapeCarrier(carrier.toUpperCase())
            .stream().map(planService::toDTO).toList();
        return ResponseEntity.ok(Map.of("carrier", carrier, "plansSaved", plans.size()));
    }

    @PostMapping("/scrape/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> scrapeAll() {
        List.of("BELL","ROGERS","FREEDOM","FIDO","TELUS").forEach(scraperService::scrapeCarrier);
        return ResponseEntity.ok(Map.of("message", "All 5 carriers scraped"));
    }

    @PostMapping("/admin/plans")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanDTO> create(@RequestBody PlanDTO dto) {
        return ResponseEntity.ok(planService.create(dto));
    }

    @PutMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlanDTO> update(@PathVariable Long id, @RequestBody PlanDTO dto) {
        return ResponseEntity.ok(planService.update(id, dto));
    }

    @DeleteMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        planService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> stats() {
        var all = planService.getAllPlans();
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPlans", all.size());
        stats.put("byCarrier", Map.of(
            "BELL",    all.stream().filter(p -> "BELL".equals(p.getCarrier())).count(),
            "ROGERS",  all.stream().filter(p -> "ROGERS".equals(p.getCarrier())).count(),
            "FREEDOM", all.stream().filter(p -> "FREEDOM".equals(p.getCarrier())).count(),
            "FIDO",    all.stream().filter(p -> "FIDO".equals(p.getCarrier())).count(),
            "TELUS",   all.stream().filter(p -> "TELUS".equals(p.getCarrier())).count()
        ));
        return ResponseEntity.ok(stats);
    }
}

// ── Crawler ───────────────────────────────────────────────────
@RestController
@RequestMapping("/api/crawler")
class CrawlerController {
    private final WebCrawlerService    crawlerService;
    private final FrequencyService     frequencyService;
    private final PageRankingService   pageRankingService;
    private final InvertedIndexService invertedIndexService;

    public CrawlerController(WebCrawlerService crawlerService, FrequencyService frequencyService,
                              PageRankingService pageRankingService, InvertedIndexService invertedIndexService) {
        this.crawlerService       = crawlerService;
        this.frequencyService     = frequencyService;
        this.pageRankingService   = pageRankingService;
        this.invertedIndexService = invertedIndexService;
    }

    @PostMapping("/crawl")
    public ResponseEntity<?> crawl(@RequestBody CrawlRequest req) {
        try { return ResponseEntity.ok(crawlerService.crawl(req)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/frequency")
    public ResponseEntity<?> frequency(@RequestParam String word) {
        try { return ResponseEntity.ok(frequencyService.getWordFrequency(word)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/frequency/top")
    public ResponseEntity<?> topWords(@RequestParam(defaultValue = "20") int limit) {
        try { return ResponseEntity.ok(frequencyService.getTopWords(limit)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/rank")
    public ResponseEntity<?> rank(@RequestParam String keyword) {
        try { return ResponseEntity.ok(pageRankingService.rankPages(keyword)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @PostMapping("/index/build")
    public ResponseEntity<?> buildIndex() {
        try {
            invertedIndexService.build();
            return ResponseEntity.ok(Map.of("message", "Index built", "uniqueWords", invertedIndexService.getIndexSize()));
        } catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }

    @GetMapping("/index")
    public ResponseEntity<?> lookup(@RequestParam String word) {
        try { return ResponseEntity.ok(invertedIndexService.lookup(word)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(Map.of("error", e.getMessage())); }
    }
}

