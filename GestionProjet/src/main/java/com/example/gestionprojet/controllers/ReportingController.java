package com.example.gestionprojet.controllers;

import com.example.gestionprojet.services.impl.ReportingServiceImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportingController {
    private final ReportingServiceImpl reportingService;

    public ReportingController(ReportingServiceImpl reportingService) {
        this.reportingService = reportingService;
    }

    @GetMapping("/kpi")
    public ResponseEntity<Map<String, Object>> getKpiSummary() {
        return ResponseEntity.ok(reportingService.getKpiSummary());
    }

    @GetMapping("/weekly-load")
    public ResponseEntity<List<Map<String, Object>>> getWeeklyLoad(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok(reportingService.getWeeklyMemberLoad(startDate, endDate));
    }

    @GetMapping("/effort-summary")
    public ResponseEntity<List<Map<String, Object>>> getEffortSummary() {
        return ResponseEntity.ok(reportingService.getEffortSummaryByMember());
    }

    @GetMapping(value = "/kpi.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportKpiCsv() {
        byte[] body = reportingService.exportKpiCsv().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"kpi-report.csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(body);
    }

    @GetMapping(value = "/kpi.xlsx")
    public ResponseEntity<byte[]> exportKpiXlsx() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"kpi-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(reportingService.exportKpiXlsx());
    }

    @GetMapping(value = "/kpi.pdf")
    public ResponseEntity<byte[]> exportKpiPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"kpi-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportingService.exportKpiPdf());
    }

    @GetMapping(value = "/member-load.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportMemberLoadCsv(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        byte[] body = reportingService.exportMemberLoadCsv(startDate, endDate).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"member-load-report.csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(body);
    }

    @GetMapping(value = "/member-load.xlsx")
    public ResponseEntity<byte[]> exportMemberLoadXlsx(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"member-load-report.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(reportingService.exportMemberLoadXlsx(startDate, endDate));
    }

    @GetMapping(value = "/member-load.pdf")
    public ResponseEntity<byte[]> exportMemberLoadPdf(
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"member-load-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportingService.exportMemberLoadPdf(startDate, endDate));
    }

    @GetMapping(value = "/effort-summary.csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportEffortSummaryCsv() {
        byte[] body = reportingService.exportEffortSummaryCsv().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"effort-summary.csv\"")
                .contentType(new MediaType("text", "csv"))
                .body(body);
    }

    @GetMapping(value = "/effort-summary.xlsx")
    public ResponseEntity<byte[]> exportEffortSummaryXlsx() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"effort-summary.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(reportingService.exportEffortSummaryXlsx());
    }

    @GetMapping(value = "/effort-summary.pdf")
    public ResponseEntity<byte[]> exportEffortSummaryPdf() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"effort-summary.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(reportingService.exportEffortSummaryPdf());
    }
}
