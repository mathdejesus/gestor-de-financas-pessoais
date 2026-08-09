package com.financeapp.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ConfigurationPropertiesScan
@ComponentScan(basePackages = {"com.financeapp.api", "com.financeapp.core"})
@EntityScan(basePackages = "com.financeapp.core.entity")
public class FinanceAppApplication {

  public static void main(String[] args) {
    SpringApplication.run(FinanceAppApplication.class, args);
  }
}
