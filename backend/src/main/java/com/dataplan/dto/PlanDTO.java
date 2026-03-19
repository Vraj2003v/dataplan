package com.dataplan.dto;

import java.time.LocalDateTime;

public class PlanDTO {
    private Long id;
    private String name;
    private String carrier;
    private Double price;
    private Double dataGb;
    private String speed;
    private String networkType;
    private String features;
    private String planUrl;
    private Boolean isFeatured;
    private LocalDateTime scrapedAt;
    private String recommendationReason;

    public PlanDTO() {}

    // Builder pattern without Lombok
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final PlanDTO dto = new PlanDTO();
        public Builder id(Long v) { dto.id = v; return this; }
        public Builder name(String v) { dto.name = v; return this; }
        public Builder carrier(String v) { dto.carrier = v; return this; }
        public Builder price(Double v) { dto.price = v; return this; }
        public Builder dataGb(Double v) { dto.dataGb = v; return this; }
        public Builder speed(String v) { dto.speed = v; return this; }
        public Builder networkType(String v) { dto.networkType = v; return this; }
        public Builder features(String v) { dto.features = v; return this; }
        public Builder planUrl(String v) { dto.planUrl = v; return this; }
        public Builder isFeatured(Boolean v) { dto.isFeatured = v; return this; }
        public Builder scrapedAt(LocalDateTime v) { dto.scrapedAt = v; return this; }
        public Builder recommendationReason(String v) { dto.recommendationReason = v; return this; }
        public PlanDTO build() { return dto; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCarrier() { return carrier; }
    public void setCarrier(String carrier) { this.carrier = carrier; }
    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }
    public Double getDataGb() { return dataGb; }
    public void setDataGb(Double dataGb) { this.dataGb = dataGb; }
    public String getSpeed() { return speed; }
    public void setSpeed(String speed) { this.speed = speed; }
    public String getNetworkType() { return networkType; }
    public void setNetworkType(String networkType) { this.networkType = networkType; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public String getPlanUrl() { return planUrl; }
    public void setPlanUrl(String planUrl) { this.planUrl = planUrl; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public LocalDateTime getScrapedAt() { return scrapedAt; }
    public void setScrapedAt(LocalDateTime scrapedAt) { this.scrapedAt = scrapedAt; }
    public String getRecommendationReason() { return recommendationReason; }
    public void setRecommendationReason(String recommendationReason) { this.recommendationReason = recommendationReason; }
}
