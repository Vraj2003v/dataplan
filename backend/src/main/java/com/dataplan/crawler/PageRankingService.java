package com.dataplan.crawler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

/**
 * Improved PageRankingService using TF-IDF-style scoring.
 * ACC Algorithm: Heap-based top-K extraction — O(n log k).
 * Score = TF * IDF where:
 *   TF  = term_frequency_in_doc / total_words_in_doc
 *   IDF = log(total_docs / docs_containing_term + 1)
 */
@Service
public class PageRankingService {

    @Value("${crawler.output-dir:./crawled-data}")
    private String outputDir;

    public static class PageRank {
        public final String filename;
        public final int frequency;
        public final double score;
        public final String snippet;
        public final double tf;
        public final double idf;
        public final int totalWords;

        public PageRank(String filename, int frequency, double score, String snippet, double tf, double idf, int totalWords) {
            this.filename = filename; this.frequency = frequency;
            this.score = score; this.snippet = snippet;
            this.tf = tf; this.idf = idf; this.totalWords = totalWords;
        }
        public String getFilename()  { return filename; }
        public int getFrequency()    { return frequency; }
        public double getScore()     { return score; }
        public String getSnippet()   { return snippet; }
        public double getTf()        { return tf; }
        public double getIdf()       { return idf; }
        public int getTotalWords()   { return totalWords; }
    }

    public List<PageRank> rankPages(String keyword) throws IOException {
        Path dir = Paths.get(outputDir);
        if (!Files.exists(dir)) return List.of();

        List<Path> files;
        try (var stream = Files.list(dir)) {
            files = stream.filter(p -> p.toString().endsWith(".txt")).collect(Collectors.toList());
        }
        if (files.isEmpty()) return List.of();

        int totalDocs = files.size();
        String kw = keyword.toLowerCase().trim();

        // Step 1: Compute per-document stats and IDF numerator
        List<PageRank> candidates = new ArrayList<>();
        int docsWithTerm = 0;

        for (Path f : files) {
            String content = Files.readString(f).toLowerCase();
            String[] words = content.split("\\W+");
            int totalWords = words.length;
            if (totalWords == 0) continue;

            long count = Arrays.stream(words).filter(w -> w.equals(kw)).count();
            if (count > 0) docsWithTerm++;

            // TF = term frequency / doc length (normalized)
            double tf = (double) count / totalWords;
            candidates.add(new PageRank(
                f.getFileName().toString(),
                (int) count,
                0, // score computed after IDF
                extractSnippet(Files.readString(f), keyword),
                Math.round(tf * 10000.0) / 10000.0,
                0, totalWords
            ));
        }

        if (docsWithTerm == 0) return List.of();

        // Step 2: IDF = log(totalDocs / docsWithTerm + 1)
        double idf = Math.log((double) totalDocs / (docsWithTerm + 1)) + 1.0;
        idf = Math.round(idf * 10000.0) / 10000.0;

        // Step 3: Compute TF-IDF scores and use a Max-Heap (PriorityQueue) for top-K
        final double finalIdf = idf;
        PriorityQueue<PageRank> heap = new PriorityQueue<>(
            Comparator.comparingDouble((PageRank pr) -> pr.score).reversed()
        );

        for (PageRank pr : candidates) {
            if (pr.frequency > 0) {
                double tfidf = Math.round(pr.tf * finalIdf * 10000.0) / 10000.0;
                heap.offer(new PageRank(
                    pr.filename, pr.frequency, tfidf,
                    pr.snippet, pr.tf, finalIdf, pr.totalWords
                ));
            }
        }

        // Extract all from heap in sorted order
        List<PageRank> results = new ArrayList<>();
        while (!heap.isEmpty()) results.add(heap.poll());
        return results;
    }

    private String extractSnippet(String content, String kw) {
        int idx = content.toLowerCase().indexOf(kw.toLowerCase());
        if (idx < 0) return "";
        int s = Math.max(0, idx - 60), e = Math.min(content.length(), idx + kw.length() + 60);
        return "..." + content.substring(s, e).replaceAll("\\s+", " ").trim() + "...";
    }
}

