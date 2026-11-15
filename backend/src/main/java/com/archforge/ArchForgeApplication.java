package com.archforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ArchForgeApplication {
    public static void main(String[] args) {
        SpringApplication.run(ArchForgeApplication.class, args);
    }
}
