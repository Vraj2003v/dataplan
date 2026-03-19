package com.dataplan.search;

import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Huffman Encoding for compressing plan feature text.
 * ACC Algorithm: Greedy algorithm builds optimal prefix-free code tree.
 * Time: O(n log n) — n = unique characters.
 *
 * Use-case: Shows how much plan description text can be compressed,
 * and demonstrates frequency-based encoding in the UI.
 */
@Service
public class HuffmanService {

    public record HuffmanNode(char ch, int freq, HuffmanNode left, HuffmanNode right) {
        boolean isLeaf() { return left == null && right == null; }
    }

    public record HuffmanResult(
        String originalText,
        int originalBits,
        int encodedBits,
        double compressionRatio,
        Map<Character, String> codes,
        Map<Character, Integer> frequencies,
        String algorithm
    ) {}

    /** Encode input text using Huffman and return result with stats. */
    public HuffmanResult encode(String text) {
        if (text == null || text.isEmpty()) return emptyResult(text);

        // Step 1: Count character frequencies
        Map<Character, Integer> freq = new LinkedHashMap<>();
        for (char c : text.toCharArray()) freq.merge(c, 1, Integer::sum);

        if (freq.size() == 1) {
            char only = freq.keySet().iterator().next();
            Map<Character, String> codes = Map.of(only, "0");
            return new HuffmanResult(text, text.length() * 8, text.length(),
                Math.round((1.0 / 8.0) * 1000) / 1000.0, codes, freq,
                "Huffman Encoding — single-character case");
        }

        // Step 2: Build min-heap (priority queue)
        PriorityQueue<HuffmanNode> pq = new PriorityQueue<>(
            Comparator.comparingInt(HuffmanNode::freq)
        );
        for (var e : freq.entrySet()) {
            pq.offer(new HuffmanNode(e.getKey(), e.getValue(), null, null));
        }

        // Step 3: Build Huffman tree by merging two lowest-frequency nodes
        while (pq.size() > 1) {
            HuffmanNode left  = pq.poll();
            HuffmanNode right = pq.poll();
            HuffmanNode merged = new HuffmanNode('\0', left.freq() + right.freq(), left, right);
            pq.offer(merged);
        }

        HuffmanNode root = pq.poll();

        // Step 4: Generate codes via DFS
        Map<Character, String> codes = new TreeMap<>();
        generateCodes(root, "", codes);

        // Step 5: Compute compressed bit length
        int encodedBits = 0;
        for (char c : text.toCharArray()) encodedBits += codes.get(c).length();
        int originalBits = text.length() * 8;
        double ratio = Math.round((1.0 - (double) encodedBits / originalBits) * 1000.0) / 10.0;

        return new HuffmanResult(
            text.length() > 120 ? text.substring(0, 120) + "..." : text,
            originalBits,
            encodedBits,
            ratio,
            codes,
            freq,
            "Huffman Encoding — O(n log n) greedy algorithm"
        );
    }

    private void generateCodes(HuffmanNode node, String prefix, Map<Character, String> codes) {
        if (node == null) return;
        if (node.isLeaf()) { codes.put(node.ch(), prefix.isEmpty() ? "0" : prefix); return; }
        generateCodes(node.left(),  prefix + "0", codes);
        generateCodes(node.right(), prefix + "1", codes);
    }

    private HuffmanResult emptyResult(String text) {
        return new HuffmanResult(text, 0, 0, 0, Map.of(), Map.of(), "Huffman Encoding — empty input");
    }
}
