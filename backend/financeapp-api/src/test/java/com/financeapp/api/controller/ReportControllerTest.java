package com.financeapp.api.controller;

import com.financeapp.api.service.ReportService;
import com.financeapp.core.dto.ReportResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = ReportController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class ReportControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void generateFinancialReport_shouldReturnReport() throws Exception {
        ReportResponse report = ReportResponse.builder()
                .totalIncome(java.math.BigDecimal.valueOf(15000))
                .totalExpense(java.math.BigDecimal.valueOf(8000))
                .build();

        when(reportService.generateJsonReport(anyLong(), any(), any())).thenReturn(report);

        mockMvc.perform(get("/api/v1/reports/financial")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalIncome").value(15000))
                .andExpect(jsonPath("$.totalExpense").value(8000));
    }

    @Test
    void generatePdf_shouldReturnPdfFile() throws Exception {
        byte[] pdfContent = "fake-pdf-content".getBytes();

        when(reportService.generatePdf(anyLong(), any(), any())).thenReturn(pdfContent);

        mockMvc.perform(get("/api/v1/reports/pdf")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", org.hamcrest.Matchers.containsString("financial-report")))
                .andExpect(content().bytes(pdfContent));
    }
}
