package com.dataplan.search;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Dijkstra's Shortest Path Algorithm applied to carrier plan comparison.
 * ACC Algorithm: Models carriers as graph nodes, plan "transitions" as edges.
 * Finds the cheapest/best upgrade path between plan tiers.
 *
 * Use-case: "What's the cheapest way to upgrade from $30 to unlimited data?"
 */
@Service
public class DijkstraService {

    public record Edge(String to, double cost, String label) {}

    public record PathResult(
        List<String> path,
        double totalCost,
        List<String> steps,
        String algorithm
    ) {}

    /**
     * Builds a weighted directed graph from plan nodes and finds shortest upgrade path.
     * Nodes = plan IDs (as strings), edges = price difference between adjacent plans.
     */
    public PathResult findCheapestUpgradePath(List<PlanNode> plans, String fromId, String toId) {
        if (plans == null || plans.isEmpty()) return emptyResult();

        // Build adjacency list
        Map<String, List<Edge>> graph = new HashMap<>();
        for (PlanNode p : plans) {
            graph.put(p.id(), new ArrayList<>());
        }

        // Connect plans as directed edges: cheaper → expensive (upgrades)
        // Edge weight = price difference + data penalty (lower data = higher penalty)
        for (PlanNode a : plans) {
            for (PlanNode b : plans) {
                if (a.id().equals(b.id())) continue;
                if (b.price() > a.price() || b.dataGb() > a.dataGb()) {
                    double priceDiff = Math.abs(b.price() - a.price());
                    double dataBonus = b.dataGb() > a.dataGb() ? -5 : 0; // bonus for more data
                    double cost = Math.max(0, priceDiff + dataBonus);
                    graph.get(a.id()).add(new Edge(b.id(), cost,
                        a.carrier() + " " + a.name() + " → " + b.carrier() + " " + b.name()));
                }
            }
        }

        // Dijkstra's algorithm
        Map<String, Double> dist = new HashMap<>();
        Map<String, String> prev = new HashMap<>();
        Map<String, String> edgeLabel = new HashMap<>();
        Set<String> visited = new HashSet<>();
        PriorityQueue<String> pq = new PriorityQueue<>(Comparator.comparingDouble(id -> dist.getOrDefault(id, Double.MAX_VALUE)));

        for (PlanNode p : plans) dist.put(p.id(), Double.MAX_VALUE);
        dist.put(fromId, 0.0);
        pq.add(fromId);

        while (!pq.isEmpty()) {
            String u = pq.poll();
            if (visited.contains(u)) continue;
            visited.add(u);
            if (u.equals(toId)) break;

            List<Edge> edges = graph.getOrDefault(u, List.of());
            for (Edge e : edges) {
                double newDist = dist.get(u) + e.cost();
                if (newDist < dist.getOrDefault(e.to(), Double.MAX_VALUE)) {
                    dist.put(e.to(), newDist);
                    prev.put(e.to(), u);
                    edgeLabel.put(e.to(), e.label());
                    pq.add(e.to());
                }
            }
        }

        // Reconstruct path
        List<String> path = new ArrayList<>();
        List<String> steps = new ArrayList<>();
        String cur = toId;
        while (cur != null) {
            path.add(0, cur);
            if (edgeLabel.containsKey(cur)) steps.add(0, edgeLabel.get(cur));
            cur = prev.get(cur);
        }

        if (path.isEmpty() || !path.get(0).equals(fromId)) return emptyResult();

        double totalCost = dist.getOrDefault(toId, Double.MAX_VALUE);
        return new PathResult(path, Math.round(totalCost * 100.0) / 100.0, steps,
            "Dijkstra's Shortest Path — O((V+E) log V)");
    }

    private PathResult emptyResult() {
        return new PathResult(List.of(), -1, List.of(), "Dijkstra's Shortest Path — no path found");
    }

    public record PlanNode(String id, String name, String carrier, double price, double dataGb) {}
}
