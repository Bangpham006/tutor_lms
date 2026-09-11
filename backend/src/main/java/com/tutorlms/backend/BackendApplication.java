package com.tutorlms.backend;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.SpringApplication;

import com.tutorlms.backend.ai.config.AiProperties;

@SpringBootApplication
@EnableConfigurationProperties(AiProperties.class)
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
		System.out.println("BackendApplication is running.......");
	}

}
