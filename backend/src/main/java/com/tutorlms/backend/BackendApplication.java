package com.tutorlms.backend;

import com.tutorlms.backend.payment.config.VnPayConfig;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import com.tutorlms.backend.ai.config.AiProperties;

@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties({ AiProperties.class, VnPayConfig.class })

public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("BackendApplication is running.......");
	}

}
