package com.dataplan.crawler;

import com.dataplan.dto.CrawlRequest;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.util.*;

@Service
public class WebCrawlerService {

    @Value("${crawler.output-dir:./crawled-data}")
    private String outputDir;

    public Map<String, Object> crawl(CrawlRequest req) throws IOException {
        Path dir = Paths.get(outputDir);
        Files.createDirectories(dir);
        try (var s = Files.list(dir)) {
            s.filter(f -> f.toString().endsWith(".txt")).forEach(f -> {
                try { Files.delete(f); } catch (IOException ignored) {}
            });
        }

        Queue<String> queue   = new LinkedList<>();
        Set<String>   visited = new LinkedHashSet<>();
        List<String>  saved   = new ArrayList<>();
        int pageCount = 0, depth = 0;
        String baseDomain = extractDomain(req.getUrl());

        queue.add(req.getUrl());

        while (!queue.isEmpty() && pageCount < req.getMaxPages() && depth < req.getMaxDepth()) {
            int levelSize = queue.size();
            for (int i = 0; i < levelSize && pageCount < req.getMaxPages(); i++) {
                String url = queue.poll();
                if (url == null || visited.contains(url)) continue;
                visited.add(url);
                try {
                    Document doc = Jsoup.connect(url)
                        .userAgent("Mozilla/5.0 DataPlanCrawler/1.0")
                        .timeout(10000).ignoreHttpErrors(true).get();

                    String filename = "page_" + (++pageCount) + ".txt";
                    Path file = dir.resolve(filename);
                    try (BufferedWriter w = new BufferedWriter(new FileWriter(file.toFile()))) {
                        w.write("URL: " + url + "\n");
                        w.write("TITLE: " + doc.title() + "\n");
                        w.write("---\n");
                        w.write(doc.body() != null ? doc.body().text() : "");
                    }
                    saved.add(filename);
                    System.out.println("Crawled page " + pageCount + ": " + url);

                    for (Element link : doc.select("a[href]")) {
                        String href = link.absUrl("href");
                        if (!href.isEmpty() && !visited.contains(href)
                            && href.startsWith("http") && href.contains(baseDomain)) {
                            queue.add(href);
                        }
                    }
                } catch (Exception e) {
                    System.out.println("Could not crawl " + url + ": " + e.getMessage());
                }
            }
            depth++;
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("pagesCount", saved.size());
        result.put("files", saved);
        result.put("outputDir", dir.toAbsolutePath().toString());
        return result;
    }

    private String extractDomain(String url) {
        try { return new java.net.URI(url).getHost(); }
        catch (Exception e) { return url; }
    }
}
