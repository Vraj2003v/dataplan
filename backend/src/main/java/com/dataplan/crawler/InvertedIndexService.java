package com.dataplan.crawler;

import com.dataplan.dto.IndexEntry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

@Service
public class InvertedIndexService {

    @Value("${crawler.output-dir:./crawled-data}")
    private String outputDir;

    private final Map<String, List<IndexEntry>> index = new HashMap<>();
    private boolean built = false;

    public synchronized void build() throws IOException {
        index.clear();
        Path dir = Paths.get(outputDir);
        if (!Files.exists(dir)) { built = true; return; }

        List<Path> files;
        try (var stream = Files.list(dir)) {
            files = stream.filter(p -> p.toString().endsWith(".txt")).collect(Collectors.toList());
        }
        for (Path f : files) {
            String name = f.getFileName().toString();
            List<String> lines = Files.readAllLines(f);
            for (int ln = 0; ln < lines.size(); ln++) {
                String line = lines.get(ln);
                String[] words = line.toLowerCase().split("\\W+");
                int pos = 0;
                for (String word : words) {
                    if (!word.isBlank()) {
                        String snippet = line.length() > 80 ? line.substring(0, 80) + "..." : line;
                        index.computeIfAbsent(word, k -> new ArrayList<>())
                            .add(new IndexEntry(name, ln + 1, pos, snippet));
                    }
                    pos += word.length() + 1;
                }
            }
        }
        built = true;
        System.out.println("Inverted index built: " + index.size() + " unique words");
    }

    public List<IndexEntry> lookup(String word) throws IOException {
        if (!built) build();
        return index.getOrDefault(word.toLowerCase(), Collections.emptyList());
    }

    public boolean isBuilt() { return built; }
    public int getIndexSize() { return index.size(); }
}
