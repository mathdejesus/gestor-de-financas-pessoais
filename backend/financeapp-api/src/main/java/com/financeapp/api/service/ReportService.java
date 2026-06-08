package com.financeapp.api.service;

import com.financeapp.core.dto.*;
import com.financeapp.core.enums.TransactionType;
import com.financeapp.core.service.DashboardService;
import com.financeapp.core.service.GoalService;
import com.financeapp.core.service.TransactionService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionService transactionService;
    private final DashboardService dashboardService;
    private final GoalService goalService;

    public byte[] generatePdf(Long userId, LocalDate startDate, LocalDate endDate) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 36, 36, 54, 36);

        try {
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18, new Color(31, 41, 55));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(31, 41, 55));
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
            Font smallFont = FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY);

            Paragraph title = new Paragraph("Financial Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(6);
            document.add(title);

            String period = startDate != null
                    ? startDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) + " - " +
                      endDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))
                    : "All Time";
            Paragraph subtitle = new Paragraph("Period: " + period, FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY));
            subtitle.setAlignment(Element.ALIGN_CENTER);
            subtitle.setSpacingAfter(20);
            document.add(subtitle);

            document.add(new Paragraph("Summary", headerFont));
            document.add(Chunk.NEWLINE);

            DashboardSummary summary = dashboardService.getSummary(userId, startDate, endDate);
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidths(new float[]{60, 40});
            summaryTable.setWidthPercentage(100);

            addSummaryRow(summaryTable, "Total Income", formatCurrency(summary.getTotalIncome()), new Color(34, 197, 94));
            addSummaryRow(summaryTable, "Total Expenses", formatCurrency(summary.getTotalExpenses()), new Color(239, 68, 68));
            addSummaryRow(summaryTable, "Net Balance", formatCurrency(summary.getTotalBalance()),
                    summary.getTotalBalance().compareTo(BigDecimal.ZERO) >= 0 ? new Color(34, 197, 94) : new Color(239, 68, 68));
            addSummaryRow(summaryTable, "Savings Rate", summary.getSavingsRate() + "%", new Color(59, 130, 246));
            addSummaryRow(summaryTable, "Transactions", String.valueOf(summary.getTransactionCount()), Color.DARK_GRAY);

            document.add(summaryTable);
            document.add(Chunk.NEWLINE);

            List<TransactionDTO> transactions = startDate != null
                    ? transactionService.findByFilters(userId, startDate, endDate, null)
                    : transactionService.findByUserId(userId);

            document.add(new Paragraph("Transactions", headerFont));
            document.add(Chunk.NEWLINE);

            PdfPTable txTable = new PdfPTable(5);
            txTable.setWidths(new float[]{15, 30, 20, 15, 20});
            txTable.setWidthPercentage(100);
            txTable.setHeaderRows(1);

            addTableHeader(txTable, "Date", headerFont);
            addTableHeader(txTable, "Description", headerFont);
            addTableHeader(txTable, "Category", headerFont);
            addTableHeader(txTable, "Type", headerFont);
            addTableHeader(txTable, "Amount", headerFont);

            for (TransactionDTO t : transactions) {
                txTable.addCell(createCell(t.getTransactionDate().toString(), smallFont));
                txTable.addCell(createCell(t.getDescription() != null ? t.getDescription() : "-", smallFont));
                txTable.addCell(createCell(t.getCategoryName() != null ? t.getCategoryName() : "-", smallFont));

                PdfPCell typeCell = createCell(t.getTransactionType().toString(), smallFont);
                if (t.getTransactionType() == TransactionType.INCOME) {
                    typeCell.setPhrase(new Phrase(t.getTransactionType().toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(34, 197, 94))));
                } else {
                    typeCell.setPhrase(new Phrase(t.getTransactionType().toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(239, 68, 68))));
                }
                txTable.addCell(typeCell);

                PdfPCell amountCell = createCell(formatCurrency(t.getAmount()), smallFont);
                if (t.getTransactionType() == TransactionType.EXPENSE) {
                    amountCell.setPhrase(new Phrase(formatCurrency(t.getAmount()), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(239, 68, 68))));
                } else {
                    amountCell.setPhrase(new Phrase(formatCurrency(t.getAmount()), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(34, 197, 94))));
                }
                txTable.addCell(amountCell);
            }

            document.add(txTable);
            document.add(Chunk.NEWLINE);

            List<GoalDTO> goals = goalService.findByUserId(userId);
            if (!goals.isEmpty()) {
                document.add(new Paragraph("Financial Goals", headerFont));
                document.add(Chunk.NEWLINE);

                PdfPTable goalTable = new PdfPTable(4);
                goalTable.setWidths(new float[]{35, 20, 25, 20});
                goalTable.setWidthPercentage(100);
                goalTable.setHeaderRows(1);

                addTableHeader(goalTable, "Goal", headerFont);
                addTableHeader(goalTable, "Progress", headerFont);
                addTableHeader(goalTable, "Target", headerFont);
                addTableHeader(goalTable, "Status", headerFont);

                for (GoalDTO g : goals) {
                    goalTable.addCell(createCell(g.getDescription(), smallFont));
                    goalTable.addCell(createCell(g.getProgressPercentage() + "%", smallFont));
                    goalTable.addCell(createCell(formatCurrency(g.getTargetValue()), smallFont));

                    PdfPCell statusCell = createCell(g.getStatus().toString(), smallFont);
                    switch (g.getStatus()) {
                        case COMPLETED -> statusCell.setPhrase(new Phrase(g.getStatus().toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(34, 197, 94))));
                        case ABANDONED -> statusCell.setPhrase(new Phrase(g.getStatus().toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(239, 68, 68))));
                        default -> statusCell.setPhrase(new Phrase(g.getStatus().toString(), FontFactory.getFont(FontFactory.HELVETICA, 8, new Color(59, 130, 246))));
                    }
                    goalTable.addCell(statusCell);
                }

                document.add(goalTable);
            }

            Paragraph footer = new Paragraph(
                    "\nGenerated on " + LocalDate.now().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")),
                    FontFactory.getFont(FontFactory.HELVETICA, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_RIGHT);
            document.add(footer);

            document.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF report", e);
        }

        return baos.toByteArray();
    }

    private void addSummaryRow(PdfPTable table, String label, String value, Color valueColor) {
        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.DARK_GRAY);
        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, valueColor);

        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(PdfPCell.NO_BORDER);
        labelCell.setPaddingBottom(4);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(PdfPCell.NO_BORDER);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        valueCell.setPaddingBottom(4);
        table.addCell(valueCell);
    }

    private void addTableHeader(PdfPTable table, String text, Font headerFont) {
        PdfPCell cell = new PdfPCell(new Phrase(text, headerFont));
        cell.setBackgroundColor(new Color(243, 244, 246));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private PdfPCell createCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(4);
        cell.setBorder(PdfPCell.NO_BORDER);
        cell.setBorderWidthBottom(0.5f);
        cell.setBorderColorBottom(new Color(229, 231, 235));
        return cell;
    }

    private String formatCurrency(BigDecimal value) {
        return new java.text.DecimalFormat("$#,##0.00").format(value);
    }
}
