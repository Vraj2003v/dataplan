package com.dataplan.search;

import com.dataplan.dto.PlanDTO;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AVL Self-Balancing BST for efficient sorted plan retrieval.
 * ACC Algorithm: Tree rotations ensure O(log n) insert/search/delete.
 */
@Service
public class AVLTreeService {

    private static class AVLNode {
        PlanDTO plan;
        double key;
        int height;
        AVLNode left, right;

        AVLNode(PlanDTO plan, double key) {
            this.plan = plan;
            this.key = key;
            this.height = 1;
        }
    }

    // Two separate trees: one keyed by price, one by data
    private AVLNode priceRoot = null;
    private AVLNode dataRoot  = null;

    private int height(AVLNode n) { return n == null ? 0 : n.height; }
    private int balanceFactor(AVLNode n) { return n == null ? 0 : height(n.left) - height(n.right); }
    private void updateHeight(AVLNode n) { if (n != null) n.height = 1 + Math.max(height(n.left), height(n.right)); }

    private AVLNode rotateRight(AVLNode y) {
        AVLNode x = y.left, T2 = x.right;
        x.right = y; y.left = T2;
        updateHeight(y); updateHeight(x);
        return x;
    }

    private AVLNode rotateLeft(AVLNode x) {
        AVLNode y = x.right, T2 = y.left;
        y.left = x; x.right = T2;
        updateHeight(x); updateHeight(y);
        return y;
    }

    private AVLNode balance(AVLNode n) {
        updateHeight(n);
        int bf = balanceFactor(n);
        if (bf > 1) {
            if (balanceFactor(n.left) < 0) n.left = rotateLeft(n.left);
            return rotateRight(n);
        }
        if (bf < -1) {
            if (balanceFactor(n.right) > 0) n.right = rotateRight(n.right);
            return rotateLeft(n);
        }
        return n;
    }

    private AVLNode insert(AVLNode node, PlanDTO plan, double key) {
        if (node == null) return new AVLNode(plan, key);
        if (key < node.key)       node.left  = insert(node.left, plan, key);
        else if (key > node.key)  node.right = insert(node.right, plan, key);
        else {
            // Duplicate keys: use id as tiebreaker — insert to right
            if (plan.getId() != null && node.plan.getId() != null && plan.getId() < node.plan.getId())
                node.left = insert(node.left, plan, key - 0.0001);
            else
                node.right = insert(node.right, plan, key + 0.0001);
        }
        return balance(node);
    }

    /** Load all plans into both AVL trees. */
    public synchronized void loadPlans(List<PlanDTO> plans) {
        priceRoot = null;
        dataRoot  = null;
        for (PlanDTO p : plans) {
            priceRoot = insert(priceRoot, p, p.getPrice());
            double dataKey = p.getDataGb() == null ? 0 : (p.getDataGb() == -1 ? 9999 : p.getDataGb());
            dataRoot = insert(dataRoot, p, dataKey);
        }
    }

    /** In-order traversal: returns plans sorted by price ascending. */
    public List<PlanDTO> getSortedByPrice() {
        List<PlanDTO> result = new ArrayList<>();
        inorder(priceRoot, result);
        return result;
    }

    /** In-order traversal: returns plans sorted by data descending. */
    public List<PlanDTO> getSortedByData() {
        List<PlanDTO> result = new ArrayList<>();
        inorder(dataRoot, result);
        Collections.reverse(result);
        return result;
    }

    /** Range search: returns plans in price range [min, max]. */
    public List<PlanDTO> getPlansByPriceRange(double min, double max) {
        List<PlanDTO> result = new ArrayList<>();
        rangeSearch(priceRoot, min, max, result);
        return result;
    }

    /** Returns AVL tree structure for visualization (height, balance factors). */
    public Map<String, Object> getTreeStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("priceTreeHeight", height(priceRoot));
        stats.put("dataTreeHeight", height(dataRoot));
        stats.put("priceTreeBalanceFactor", balanceFactor(priceRoot));
        stats.put("dataTreeBalanceFactor", balanceFactor(dataRoot));
        stats.put("algorithm", "AVL Self-Balancing BST — O(log n) operations");
        return stats;
    }

    private void inorder(AVLNode node, List<PlanDTO> result) {
        if (node == null) return;
        inorder(node.left, result);
        result.add(node.plan);
        inorder(node.right, result);
    }

    private void rangeSearch(AVLNode node, double min, double max, List<PlanDTO> result) {
        if (node == null) return;
        if (node.key > min) rangeSearch(node.left, min, max, result);
        if (node.key >= min && node.key <= max) result.add(node.plan);
        if (node.key < max) rangeSearch(node.right, min, max, result);
    }
}
