package com.dataplan.dto;

public class IndexEntry {
    private String filename;
    private int lineNumber;
    private int charPosition;
    private String snippet;

    public IndexEntry() {}
    public IndexEntry(String filename, int lineNumber, int charPosition, String snippet) {
        this.filename = filename;
        this.lineNumber = lineNumber;
        this.charPosition = charPosition;
        this.snippet = snippet;
    }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public int getLineNumber() { return lineNumber; }
    public void setLineNumber(int lineNumber) { this.lineNumber = lineNumber; }
    public int getCharPosition() { return charPosition; }
    public void setCharPosition(int charPosition) { this.charPosition = charPosition; }
    public String getSnippet() { return snippet; }
    public void setSnippet(String snippet) { this.snippet = snippet; }
}
