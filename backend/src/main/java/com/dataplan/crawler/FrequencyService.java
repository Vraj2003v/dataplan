package com.dataplan.crawler;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.stream.*;

@Service
public class FrequencyService {

    @Value("${crawler.output-dir:./crawled-data}")
    private String outputDir;

    private static final Set<String> STOP = Set.of(
        "the","a","an","and","or","but","in","on","at","to","for","of","with",
        "by","from","is","are","was","were","be","been","this","that","it","as",
        "url","title","http","https","www","com","ca"
    );

    public Map<String, Integer> getWordFrequency(String word) throws IOException {
        Map<String, Integer> result = new LinkedHashMap<>();
        Path dir = Paths.get(outputDir);
        if (!Files.exists(dir)) return result;
        try (var stream = Files.list(dir)) {
            for (Path f : stream.filter(p -> p.toString().endsWith(".txt")).collect(Collectors.toList())) {
                String content = Files.readString(f).toLowerCase();
                int count = (int) Arrays.stream(content.split("\\W+"))
                    .filter(w -> w.equals(word.toLowerCase())).count();
                if (count > 0) result.put(f.getFileName().toString(), count);
            }
        }
        return result.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                (a, b) -> a, LinkedHashMap::new));
    }

    public Map<String, Integer> getTopWords(int limit) throws IOException {
        Map<String, Integer> freq = new HashMap<>();
        Path dir = Paths.get(outputDir);
        if (!Files.exists(dir)) return freq;
        try (var stream = Files.list(dir)) {
            for (Path f : stream.filter(p -> p.toString().endsWith(".txt")).collect(Collectors.toList())) {
                for (String w : Files.readString(f).toLowerCase().split("\\W+")) {
                    if (w.length() > 2 && !STOP.contains(w) && w.matches("[a-z]+"))
                        freq.merge(w, 1, Integer::sum);
                }
            }
        }
        return freq.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(limit)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                (a, b) -> a, LinkedHashMap::new));
    }
}
