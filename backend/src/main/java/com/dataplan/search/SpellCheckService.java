package com.dataplan.search;

import org.springframework.stereotype.Service;
import java.util.*;

/**
 * Improved SpellCheckService using Damerau-Levenshtein distance.
 * ACC Algorithm: DP with transposition support — O(n*m) time, O(n*m) space.
 * Handles: insertions, deletions, substitutions, AND adjacent transpositions.
 */
@Service
public class SpellCheckService {

    private static final List<String> DICTIONARY = Arrays.asList(
        // Carriers
        "bell","rogers","freedom","fido","telus","virgin","koodo","lucky","public",
        // Plan types
        "plan","plans","unlimited","basic","starter","essential","advanced","premium",
        "infinite","core","connect","plus","pro","elite","value","smart","flex",
        // Network
        "5g","4g","lte","network","coverage","speed","bandwidth","hotspot","wifi",
        "roaming","international","nationwide",
        // Features
        "data","streaming","calling","texting","voicemail","canada","mobile",
        // Devices
        "android","iphone","smartphone","gigabyte","megabyte","tablet",
        // Price terms
        "monthly","price","cheap","budget","affordable","deal","cost","rate","discount"
    );

    public Optional<String> suggest(String word) {
        if (word == null || word.isBlank()) return Optional.empty();
        String lower = word.toLowerCase().trim();
        if (DICTIONARY.contains(lower)) return Optional.empty();

        return DICTIONARY.stream()
            .filter(d -> damerauLevenshtein(lower, d) <= 2)
            .min(Comparator.comparingInt(d -> damerauLevenshtein(lower, d)));
    }

    /** All suggestions with distance <= threshold, sorted by distance. */
    public List<String> suggestAll(String word, int maxSuggestions) {
        if (word == null || word.isBlank()) return List.of();
        String lower = word.toLowerCase().trim();
        return DICTIONARY.stream()
            .filter(d -> !d.equals(lower) && damerauLevenshtein(lower, d) <= 2)
            .sorted(Comparator.comparingInt(d -> damerauLevenshtein(lower, d)))
            .limit(maxSuggestions)
            .toList();
    }

    /**
     * Damerau-Levenshtein distance: handles transpositions (e.g. "androd" → "android").
     * Standard Levenshtein misses transpositions — this catches common typos.
     */
    public int damerauLevenshtein(String a, String b) {
        int la = a.length(), lb = b.length();
        int[][] dp = new int[la + 1][lb + 1];
        for (int i = 0; i <= la; i++) dp[i][0] = i;
        for (int j = 0; j <= lb; j++) dp[0][j] = j;

        for (int i = 1; i <= la; i++) {
            for (int j = 1; j <= lb; j++) {
                int cost = a.charAt(i - 1) == b.charAt(j - 1) ? 0 : 1;
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,                 // deletion
                    Math.min(
                        dp[i][j - 1] + 1,             // insertion
                        dp[i - 1][j - 1] + cost        // substitution
                    )
                );
                // Transposition: swap adjacent chars
                if (i > 1 && j > 1 && a.charAt(i-1) == b.charAt(j-2) && a.charAt(i-2) == b.charAt(j-1)) {
                    dp[i][j] = Math.min(dp[i][j], dp[i-2][j-2] + cost);
                }
            }
        }
        return dp[la][lb];
    }

    /** Legacy method name kept for compatibility */
    public int editDistance(String a, String b) {
        return damerauLevenshtein(a, b);
    }
}
