package com.jobportal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app.matching")
public class ScoringWeights {

    /** Weight for skill Jaccard overlap (0–1, default 0.60) */
    private double skillWeight = 0.60;

    /** Weight for experience fit (0–1, default 0.25) */
    private double experienceWeight = 0.25;

    /** Weight for job-title keyword overlap (0–1, default 0.15) */
    private double titleWeight = 0.15;

    /**
     * Penalty per year of experience gap below the required minimum (0–1).
     * e.g. 0.10 means each missing year costs 10 points on the experience component.
     */
    private double experienceGapPenalty = 0.10;
}
