package com.archforge.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.temporal.ChronoField;

@Converter(autoApply = true)
public class InstantStringConverter implements AttributeConverter<Instant, String> {

    private static final DateTimeFormatter SPACE_FORMATTER = new DateTimeFormatterBuilder()
            .appendPattern("yyyy-MM-dd HH:mm:ss")
            .appendFraction(ChronoField.MICRO_OF_SECOND, 0, 6, true)
            .toFormatter();

    @Override
    public String convertToDatabaseColumn(Instant attribute) {
        if (attribute == null) {
            return null;
        }
        // Save in Python SQLAlchemy compatible space format: "yyyy-MM-dd HH:mm:ss.SSSSSS"
        LocalDateTime ldt = LocalDateTime.ofInstant(attribute, ZoneOffset.UTC);
        return SPACE_FORMATTER.format(ldt);
    }

    @Override
    public Instant convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isBlank()) {
            return null;
        }
        try {
            // First try standard ISO-8601
            return Instant.parse(dbData);
        } catch (Exception ignored) {
            try {
                // Try Python space format: "yyyy-MM-dd HH:mm:ss.SSSSSS"
                LocalDateTime ldt = LocalDateTime.parse(dbData, SPACE_FORMATTER);
                return ldt.toInstant(ZoneOffset.UTC);
            } catch (Exception e) {
                // Fallback: replace space with T and parse
                String normalized = dbData.trim().replace(" ", "T");
                if (!normalized.endsWith("Z") && !normalized.contains("+") && normalized.indexOf("-", 10) == -1) {
                    normalized += "Z";
                }
                return Instant.parse(normalized);
            }
        }
    }
}
