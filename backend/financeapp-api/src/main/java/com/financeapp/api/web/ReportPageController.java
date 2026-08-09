package com.financeapp.api.web;

import com.financeapp.api.service.ReportService;
import com.financeapp.core.dto.ReportResponse;
import com.financeapp.core.dto.TransactionDTO;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.TransactionService;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Server-rendered financial reports (summary tables) plus CSV/PDF exports. The report itself is
 * generated entirely in the backend (ReportService).
 */
@Controller
@RequiredArgsConstructor
@RateLimiter(name = "api")
public class ReportPageController {

  private final ReportService reportService;
  private final TransactionService transactionService;

  @GetMapping("/reports")
  public String reports(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate endDate,
      Model model) {
    ReportResponse report = reportService.generateJsonReport(user.getId(), startDate, endDate);
    model.addAttribute("report", report);
    model.addAttribute("startDate", startDate != null ? startDate.toString() : "");
    model.addAttribute("endDate", endDate != null ? endDate.toString() : "");
    model.addAttribute("activeNav", "reports");
    model.addAttribute("pageTitle", "Relatórios");
    return "reports/index";
  }

  @GetMapping("/reports/export/csv")
  public ResponseEntity<byte[]> exportCsv(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate endDate) {

    List<TransactionDTO> transactions;
    if (startDate != null && endDate != null) {
      transactions = transactionService.findByFilters(user.getId(), startDate, endDate, null);
    } else {
      transactions = transactionService.findByUserId(user.getId());
    }

    StringBuilder csv = new StringBuilder();
    csv.append("Date,Description,Category,Type,Amount\n");
    for (TransactionDTO t : transactions) {
      csv.append(t.getTransactionDate()).append(",");
      csv.append("\"").append(sanitizeCsvField(t.getDescription())).append("\",");
      csv.append("\"").append(sanitizeCsvField(t.getCategoryName())).append("\",");
      csv.append(t.getTransactionType()).append(",");
      csv.append(t.getAmount()).append("\n");
    }

    byte[] content = csv.toString().getBytes(StandardCharsets.UTF_8);
    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=transactions.csv")
        .contentType(MediaType.parseMediaType("text/csv"))
        .contentLength(content.length)
        .body(content);
  }

  @GetMapping("/reports/pdf")
  public ResponseEntity<byte[]> exportPdf(
      @AuthenticationPrincipal User user,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate startDate,
      @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate endDate) {

    byte[] pdf = reportService.generatePdf(user.getId(), startDate, endDate);
    String filename =
        "financial-report-"
            + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"))
            + ".pdf";

    return ResponseEntity.ok()
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
        .contentType(MediaType.APPLICATION_PDF)
        .contentLength(pdf.length)
        .body(pdf);
  }

  private String sanitizeCsvField(String value) {
    if (value == null) return "";
    String sanitized = value.replace("\"", "\"\"");
    if (!sanitized.isEmpty() && "=+-@\t\n".indexOf(sanitized.charAt(0)) >= 0) {
      sanitized = "'" + sanitized;
    }
    return sanitized;
  }
}
