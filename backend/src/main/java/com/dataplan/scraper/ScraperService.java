package com.dataplan.scraper;

import com.dataplan.model.Plan;
import com.dataplan.repository.PlanRepository;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.*;

@Service
public class ScraperService {

    private final PlanRepository planRepository;

    public ScraperService(PlanRepository planRepository) {
        this.planRepository = planRepository;
    }

    private static final Map<String, String> CARRIER_URLS = Map.of(
        "BELL",    "https://www.bell.ca/Mobility/Smartphones/Plans",
        "ROGERS",  "https://www.rogers.com/mobility/shop/plans",
        "FREEDOM", "https://www.freedommobile.ca/en-CA/plans",
        "FIDO",    "https://www.fido.ca/consumer/plans",
        "TELUS",   "https://www.telus.com/en/mobility/phones/plans"
    );

    @Scheduled(cron = "0 0 3 * * *")
    public void scheduledScrapeAll() {
        System.out.println("Starting scheduled scrape for all 5 carriers");
        CARRIER_URLS.keySet().forEach(this::scrapeCarrier);
    }

    public List<Plan> scrapeCarrier(String carrier) {
        System.out.println("Scraping carrier: " + carrier);
        List<Plan> plans;
        try {
            String url = CARRIER_URLS.get(carrier.toUpperCase());
            if (url == null) throw new IllegalArgumentException("Unknown carrier: " + carrier);
            Document doc = Jsoup.connect(url)
                .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                .timeout(12000).ignoreHttpErrors(true).get();
            plans = parseDocument(doc, carrier.toUpperCase(), url);
            if (plans.isEmpty()) throw new Exception("No plans parsed");
        } catch (Exception e) {
            System.out.println("Live scrape failed for " + carrier + " (" + e.getMessage() + "), using mock data");
            plans = getMockPlans(carrier.toUpperCase());
        }
        planRepository.deleteAll(planRepository.findByCarrierIgnoreCase(carrier));
        plans.forEach(p -> p.setScrapedAt(LocalDateTime.now()));
        planRepository.saveAll(plans);
        System.out.println("Saved " + plans.size() + " plans for " + carrier);
        return plans;
    }

    private List<Plan> parseDocument(Document doc, String carrier, String url) {
        List<Plan> plans = new ArrayList<>();
        Elements cards = doc.select(".plan-card, [class*=plan-item], [class*=PlanCard], [class*=plan-container]");
        for (Element card : cards) {
            try {
                Plan p = new Plan();
                p.setCarrier(carrier);
                String name = card.select("h2,h3,h4,[class*=title]").text().trim();
                if (name.isEmpty()) continue;
                p.setName(name);
                String priceText = card.select("[class*=price],[class*=amount]").text();
                double price = extractPrice(priceText);
                if (price <= 0) continue;
                p.setPrice(price);
                String bodyText = card.text();
                p.setDataGb(extractData(bodyText));
                p.setNetworkType(bodyText.contains("5G") ? "5G" : "4G LTE");
                p.setFeatures(card.select("ul,li").text());
                p.setPlanUrl(url);
                plans.add(p);
            } catch (Exception ignored) {}
        }
        return plans;
    }

    private double extractPrice(String text) {
        if (text == null || text.isBlank()) return 0;
        Matcher m = Pattern.compile("\\$?([0-9]+(?:\\.[0-9]{1,2})?)").matcher(text);
        if (m.find()) { try { return Double.parseDouble(m.group(1)); } catch (Exception ignored) {} }
        return 0;
    }

    private double extractData(String text) {
        if (text == null) return 0;
        if (text.toLowerCase().contains("unlimited")) return -1.0;
        Matcher m = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)\\s*[Gg][Bb]").matcher(text);
        if (m.find()) { try { return Double.parseDouble(m.group(1)); } catch (Exception ignored) {} }
        return 0;
    }

    public List<Plan> getMockPlans(String carrier) {
        List<Plan> plans = new ArrayList<>();
        switch (carrier.toUpperCase()) {
            case "BELL" -> {
                plans.add(buildPlan("BELL", "Bell Entry 4G",      35.0,  5.0, "4G LTE", "5GB data, unlimited talk & text, voicemail",          "https://bell.ca/plans"));
                plans.add(buildPlan("BELL", "Bell Essential 5G",  50.0, 20.0, "5G",     "20GB 5G data, unlimited talk & text, Wi-Fi calling",   "https://bell.ca/plans"));
                plans.add(buildPlan("BELL", "Bell Advanced 5G",   65.0, 50.0, "5G",     "50GB 5G, HD streaming, international texting",          "https://bell.ca/plans"));
                plans.add(buildPlan("BELL", "Bell Unlimited 5G+", 85.0, -1.0, "5G",     "Unlimited data, 5G+, 4K streaming, US/MX roaming",     "https://bell.ca/plans"));
                plans.add(buildPlan("BELL", "Bell Premium 5G+",  100.0, -1.0, "5G",     "Unlimited data, hotspot 50GB, Apple One included",     "https://bell.ca/plans"));
            }
            case "ROGERS" -> {
                plans.add(buildPlan("ROGERS", "Rogers Starter 4G",   38.0,  5.0, "4G LTE", "5GB data, unlimited Canada-wide calling",             "https://rogers.com/plans"));
                plans.add(buildPlan("ROGERS", "Rogers Core 5G",      55.0, 25.0, "5G",     "25GB 5G data, unlimited talk & text",                 "https://rogers.com/plans"));
                plans.add(buildPlan("ROGERS", "Rogers Infinite 5G",  75.0, -1.0, "5G",     "Unlimited data, 5G, HD video, 20GB hotspot",          "https://rogers.com/plans"));
                plans.add(buildPlan("ROGERS", "Rogers Infinite+ 5G", 90.0, -1.0, "5G",     "Unlimited data, 50GB hotspot, US roaming included",   "https://rogers.com/plans"));
                plans.add(buildPlan("ROGERS", "Rogers Share",       110.0, -1.0, "5G",     "Unlimited shareable data, multi-line discount",       "https://rogers.com/plans"));
            }
            case "FREEDOM" -> {
                plans.add(buildPlan("FREEDOM", "Freedom 2GB",          20.0,  2.0, "4G LTE", "2GB data, unlimited talk & text, budget pick",       "https://freedommobile.ca/plans"));
                plans.add(buildPlan("FREEDOM", "Freedom 12GB",         34.0, 12.0, "4G LTE", "12GB data, unlimited talk & text Canada",            "https://freedommobile.ca/plans"));
                plans.add(buildPlan("FREEDOM", "Freedom 30GB 5G",      49.0, 30.0, "5G",     "30GB 5G data, unlimited calls, voicemail",           "https://freedommobile.ca/plans"));
                plans.add(buildPlan("FREEDOM", "Freedom Unlimited 5G", 60.0, -1.0, "5G",     "Unlimited 5G data, Canada-wide unlimited calling",   "https://freedommobile.ca/plans"));
                plans.add(buildPlan("FREEDOM", "Freedom Premium 5G",   75.0, -1.0, "5G",     "Unlimited 5G, hotspot 30GB, international minutes",  "https://freedommobile.ca/plans"));
            }
            case "FIDO" -> {
                plans.add(buildPlan("FIDO", "Fido Starter 4G",    30.0,  4.0, "4G LTE", "4GB data, unlimited talk & text, Fido Points",       "https://fido.ca/plans"));
                plans.add(buildPlan("FIDO", "Fido 15GB",          45.0, 15.0, "4G LTE", "15GB data, Fido Points rewards, call display",       "https://fido.ca/plans"));
                plans.add(buildPlan("FIDO", "Fido 5G 30GB",       58.0, 30.0, "5G",     "30GB 5G data, unlimited talk & text, Wi-Fi calling", "https://fido.ca/plans"));
                plans.add(buildPlan("FIDO", "Fido Unlimited 5G",  70.0, -1.0, "5G",     "Unlimited 5G data, 20GB hotspot, Fido Roam",         "https://fido.ca/plans"));
                plans.add(buildPlan("FIDO", "Fido Infinite 5G+",  85.0, -1.0, "5G",     "Unlimited 5G+, 50GB hotspot, US/MX roaming",         "https://fido.ca/plans"));
            }
            case "TELUS" -> {
                plans.add(buildPlan("TELUS", "Telus Basic 4G",        40.0,  8.0, "4G LTE", "8GB data, unlimited nationwide calling, voicemail",  "https://telus.com/plans"));
                plans.add(buildPlan("TELUS", "Telus 5G 20GB",         60.0, 20.0, "5G",     "20GB 5G data, unlimited talk & text",                "https://telus.com/plans"));
                plans.add(buildPlan("TELUS", "Telus 5G 50GB",         75.0, 50.0, "5G",     "50GB 5G, HD video, Wi-Fi calling",                   "https://telus.com/plans"));
                plans.add(buildPlan("TELUS", "Telus Unlimited 5G",    90.0, -1.0, "5G",     "Unlimited 5G, 40GB hotspot, US/MX data roaming",     "https://telus.com/plans"));
                plans.add(buildPlan("TELUS", "Telus Peace of Mind",  110.0, -1.0, "5G",     "Unlimited 5G+, 80GB hotspot, global roaming",        "https://telus.com/plans"));
            }
        }
        plans.forEach(p -> p.setScrapedAt(LocalDateTime.now()));
        return plans;
    }

    private Plan buildPlan(String carrier, String name, double price, double dataGb,
                           String network, String features, String url) {
        Plan p = new Plan();
        p.setCarrier(carrier); p.setName(name); p.setPrice(price);
        p.setDataGb(dataGb);  p.setNetworkType(network);
        p.setFeatures(features); p.setPlanUrl(url);
        return p;
    }
}
