package com.dataplan.search;

import org.springframework.stereotype.Service;
import java.util.regex.*;

@Service
public class RegexSearchService {

    private static final Pattern PRICE_PAT    = Pattern.compile("\\$([0-9]+(?:\\.[0-9]{1,2})?)");
    private static final Pattern DATA_PAT     = Pattern.compile("([0-9]+(?:\\.[0-9]+)?)\\s*[Gg][Bb]");
    private static final Pattern NETWORK_PAT  = Pattern.compile("\\b(5G|4G|LTE)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern CARRIER_PAT  = Pattern.compile("\\b(bell|rogers|freedom|fido|telus)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern UNLIMITED_PAT= Pattern.compile("\\bunlimited\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern UNDER_PAT    = Pattern.compile("under\\s*\\$?([0-9]+)", Pattern.CASE_INSENSITIVE);

    public record ParsedQuery(
        Double exactPrice, Double maxPrice, Double dataGb,
        String networkType, String carrier,
        boolean isUnlimited, String cleanQuery
    ) {}

    public ParsedQuery parse(String raw) {
        if (raw == null) return new ParsedQuery(null,null,null,null,null,false,"");
        String q = raw.trim();
        Double exactPrice = null, maxPrice = null, dataGb = null;
        String network = null, carrier = null;
        boolean unlimited = false;
        Matcher m;

        m = PRICE_PAT.matcher(q);
        if (m.find()) exactPrice = Double.parseDouble(m.group(1));

        m = UNDER_PAT.matcher(q);
        if (m.find()) maxPrice = Double.parseDouble(m.group(1));

        m = DATA_PAT.matcher(q);
        if (m.find()) dataGb = Double.parseDouble(m.group(1));

        m = NETWORK_PAT.matcher(q);
        if (m.find()) network = m.group(1).toUpperCase();

        m = CARRIER_PAT.matcher(q);
        if (m.find()) carrier = m.group(1).toUpperCase();

        if (UNLIMITED_PAT.matcher(q).find()) unlimited = true;

        String clean = q
            .replaceAll("\\$[0-9]+(?:\\.[0-9]+)?", "")
            .replaceAll("under\\s*\\$?[0-9]+", "")
            .replaceAll("[0-9]+(?:\\.[0-9]+)?\\s*[Gg][Bb]", "")
            .replaceAll("(?i)\\b(5G|4G|LTE)\\b", "")
            .replaceAll("(?i)\\b(bell|rogers|freedom|fido|telus|unlimited)\\b", "")
            .trim().replaceAll("\\s+", " ");

        return new ParsedQuery(exactPrice, maxPrice, dataGb, network, carrier, unlimited, clean);
    }
}
