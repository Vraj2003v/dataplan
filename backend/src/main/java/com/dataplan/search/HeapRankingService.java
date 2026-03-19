package com.dataplan.search;

import com.dataplan.dto.PlanDTO;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Min-Heap Priority Queue for plan scoring and ranking.
 * ACC Algorithm: Heap property maintained — O(log n) insert, O(1) peek best plan.
 * Used to retrieve top-K plans by a composite score.
 */
@Service
public class HeapRankingService {

    public record ScoredPlan(PlanDTO plan, double score, String reasoning) implements Comparable<ScoredPlan> {
        @Override
        public int compareTo(ScoredPlan o) {
            return Double.compare(o.score, this.score); // max-heap: higher score = better
        }
    }

    /**
     * Ranks plans using a composite scoring formula and returns top-K via a Max-Heap.
     * Score = w1*(normalizedValue) + w2*(normalizedData) + w3*(networkBonus) + w4*(featuresBonus)
     */
    public List<ScoredPlan> rankPlans(List<PlanDTO> plans, String criteria, int topK) {
        if (plans == null || plans.isEmpty()) return List.of();

        // Normalize ranges
        double maxPrice = plans.stream().mapToDouble(PlanDTO::getPrice).max().orElse(1);
        double minPrice = plans.stream().mapToDouble(PlanDTO::getPrice).min().orElse(0);
        double maxData  = plans.stream()
            .mapToDouble(p -> p.getDataGb() == null || p.getDataGb() == -1 ? 100 : p.getDataGb())
            .max().orElse(1);

        // Weights depending on criteria
        double wValue   = "value".equalsIgnoreCase(criteria) ? 0.50 : 0.25;
        double wData    = "data".equalsIgnoreCase(criteria)  ? 0.50 : 0.30;
        double wNetwork = 0.15;
        double wFeatures= 0.10;

        // Build max-heap
        PriorityQueue<ScoredPlan> heap = new PriorityQueue<>();

        for (PlanDTO p : plans) {
            double priceRange = maxPrice - minPrice;
            double normalizedValue = priceRange > 0
                ? 1.0 - (p.getPrice() - minPrice) / priceRange
                : 0.5;

            double dataGb = (p.getDataGb() == null) ? 0 : (p.getDataGb() == -1 ? 100 : p.getDataGb());
            double normalizedData = maxData > 0 ? dataGb / maxData : 0;

            double networkBonus = 0;
            if (p.getNetworkType() != null) {
                if (p.getNetworkType().contains("5G")) networkBonus = 1.0;
                else if (p.getNetworkType().contains("4G") || p.getNetworkType().contains("LTE")) networkBonus = 0.6;
                else networkBonus = 0.3;
            }

            double featuresBonus = 0;
            if (p.getFeatures() != null) {
                String f = p.getFeatures().toLowerCase();
                if (f.contains("hotspot"))     featuresBonus += 0.25;
                if (f.contains("roaming"))     featuresBonus += 0.25;
                if (f.contains("streaming"))   featuresBonus += 0.25;
                if (f.contains("voicemail"))   featuresBonus += 0.25;
                featuresBonus = Math.min(1.0, featuresBonus);
            }

            double score = wValue * normalizedValue
                         + wData  * normalizedData
                         + wNetwork * networkBonus
                         + wFeatures * featuresBonus;

            score = Math.round(score * 1000.0) / 1000.0;

            String reasoning = buildReasoning(p, normalizedValue, normalizedData, networkBonus, featuresBonus, criteria);
            heap.offer(new ScoredPlan(p, score, reasoning));
        }

        // Extract top-K from heap
        List<ScoredPlan> result = new ArrayList<>();
        int limit = Math.min(topK, heap.size());
        for (int i = 0; i < limit; i++) {
            result.add(heap.poll());
        }
        return result;
    }

    private String buildReasoning(PlanDTO p, double val, double data, double net, double feat, String criteria) {
        List<String> points = new ArrayList<>();
        if ("value".equalsIgnoreCase(criteria) && val > 0.7)  points.add("great value at $" + String.format("%.0f", p.getPrice()));
        if ("data".equalsIgnoreCase(criteria) && data > 0.7)   points.add("high data at " + (p.getDataGb() == -1 ? "unlimited" : p.getDataGb() + "GB"));
        if (net == 1.0)   points.add("5G network");
        if (feat > 0.5)   points.add("rich features");
        if (p.getDataGb() != null && p.getDataGb() == -1) points.add("unlimited data");
        return points.isEmpty() ? "Balanced plan" : String.join(", ", points);
    }

    /** Returns heap metadata for educational display */
    public Map<String, Object> getAlgorithmInfo() {
        return Map.of(
            "algorithm", "Max-Heap Priority Queue",
            "insertComplexity", "O(log n)",
            "peekComplexity", "O(1)",
            "extractMaxComplexity", "O(log n)",
            "useCase", "Top-K plan ranking by composite score"
        );
    }
}
