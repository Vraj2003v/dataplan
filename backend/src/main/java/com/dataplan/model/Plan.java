package com.dataplan.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "plans")
public class Plan {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String carrier;
    @Column(nullable = false) private Double price;
    @Column(name = "data_gb") private Double dataGb;
    @Column(name = "network_type") private String networkType;
    private String speed;
    @Column(columnDefinition = "TEXT") private String features;
    @Column(name = "plan_url") private String planUrl;
    @Column(name = "is_featured") private Boolean isFeatured = false;
    @Column(name = "scraped_at") private LocalDateTime scrapedAt;
    @Column(name = "created_at") private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (scrapedAt == null) scrapedAt = LocalDateTime.now();
    }

    public Plan() {}

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
    public String getNetworkType() { return networkType; }
    public void setNetworkType(String networkType) { this.networkType = networkType; }
    public String getSpeed() { return speed; }
    public void setSpeed(String speed) { this.speed = speed; }
    public String getFeatures() { return features; }
    public void setFeatures(String features) { this.features = features; }
    public String getPlanUrl() { return planUrl; }
    public void setPlanUrl(String planUrl) { this.planUrl = planUrl; }
    public Boolean getIsFeatured() { return isFeatured; }
    public void setIsFeatured(Boolean isFeatured) { this.isFeatured = isFeatured; }
    public LocalDateTime getScrapedAt() { return scrapedAt; }
    public void setScrapedAt(LocalDateTime scrapedAt) { this.scrapedAt = scrapedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
