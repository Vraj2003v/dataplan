package com.dataplan.search;

import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class WordCompletionService {

    private final TrieNode root = new TrieNode();

    private static final String[] VOCAB = {
        "bell","rogers","freedom","fido","telus",
        "plan","plans","unlimited","basic","starter","essential","advanced","premium","infinite","core",
        "5g","4g","lte","network","coverage","speed","bandwidth","hotspot","roaming","wifi","calling",
        "data","streaming","video","music","international","texting","voicemail","canada","nationwide",
        "monthly","price","cheap","budget","affordable","deal","cost","rate",
        "android","iphone","smartphone","mobile","gigabyte","megabyte"
    };

    public WordCompletionService() {
        Arrays.stream(VOCAB).forEach(this::insert);
    }

    public void insert(String word) {
        TrieNode node = root;
        for (char c : word.toLowerCase().toCharArray()) {
            node.children.putIfAbsent(c, new TrieNode());
            node = node.children.get(c);
        }
        node.isEnd = true;
        node.word = word;
    }

    public List<String> complete(String prefix) {
        if (prefix == null || prefix.isBlank()) return List.of();
        List<String> results = new ArrayList<>();
        TrieNode node = root;
        for (char c : prefix.toLowerCase().toCharArray()) {
            if (!node.children.containsKey(c)) return results;
            node = node.children.get(c);
        }
        collect(node, results, 8);
        return results;
    }

    private void collect(TrieNode node, List<String> results, int limit) {
        if (results.size() >= limit) return;
        if (node.isEnd) results.add(node.word);
        for (TrieNode child : node.children.values()) collect(child, results, limit);
    }
}
