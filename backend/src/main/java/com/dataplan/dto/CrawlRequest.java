package com.dataplan.dto;

public class CrawlRequest {
    private String url;
    private int maxPages = 15;
    private int maxDepth = 2;

    public CrawlRequest() {}
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public int getMaxPages() { return maxPages; }
    public void setMaxPages(int maxPages) { this.maxPages = maxPages; }
    public int getMaxDepth() { return maxDepth; }
    public void setMaxDepth(int maxDepth) { this.maxDepth = maxDepth; }
}
