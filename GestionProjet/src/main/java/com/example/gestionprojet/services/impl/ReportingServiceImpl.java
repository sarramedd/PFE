package com.example.gestionprojet.services.impl;

import com.example.gestionprojet.entities.Task;
import com.example.gestionprojet.entities.TaskStatus;
import com.example.gestionprojet.entities.User;
import com.example.gestionprojet.repositories.ProjectRepository;
import com.example.gestionprojet.repositories.TaskRepository;
import com.example.gestionprojet.repositories.TaskWorklogRepository;
import com.example.gestionprojet.repositories.UserRepository;
import com.example.gestionprojet.security.PermissionAction;
import com.example.gestionprojet.security.TenantAccessService;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportingServiceImpl {
    private final TenantAccessService tenantAccessService;
    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final TaskWorklogRepository taskWorklogRepository;

    public ReportingServiceImpl(
            TenantAccessService tenantAccessService,
            ProjectRepository projectRepository,
            TaskRepository taskRepository,
            UserRepository userRepository,
            TaskWorklogRepository taskWorklogRepository
    ) {
        this.tenantAccessService = tenantAccessService;
        this.projectRepository = projectRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
        this.taskWorklogRepository = taskWorklogRepository;
    }

    public Map<String, Object> getKpiSummary() {
        assertReportingAccess();
        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        List<Task> tasks = taskRepository.findByProject_Organization_Id(organizationId);
        long done = tasks.stream().filter(task -> task.getStatus() == TaskStatus.DONE).count();
        long overdue = tasks.stream().filter(this::isOverdue).count();
        int completionRate = tasks.isEmpty() ? 0 : (int) Math.round((done * 100.0) / tasks.size());

        Map<String, Object> summary = new HashMap<>();
        summary.put("organizationId", organizationId);
        summary.put("users", userRepository.findByOrganizationId(organizationId).size());
        summary.put("projects", projectRepository.findByOrganizationId(organizationId).size());
        summary.put("tasks", tasks.size());
        summary.put("doneTasks", done);
        summary.put("overdueTasks", overdue);
        summary.put("completionRate", completionRate);
        return summary;
    }

    public String exportKpiCsv() {
        Map<String, Object> summary = getKpiSummary();
        StringBuilder builder = new StringBuilder();
        builder.append("organizationId,users,projects,tasks,doneTasks,overdueTasks,completionRate\n");
        builder.append(summary.get("organizationId")).append(",")
                .append(summary.get("users")).append(",")
                .append(summary.get("projects")).append(",")
                .append(summary.get("tasks")).append(",")
                .append(summary.get("doneTasks")).append(",")
                .append(summary.get("overdueTasks")).append(",")
                .append(summary.get("completionRate")).append("\n");
        return builder.toString();
    }

    public byte[] exportKpiXlsx() {
        Map<String, Object> summary = getKpiSummary();
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("KPI");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("organizationId");
            header.createCell(1).setCellValue("users");
            header.createCell(2).setCellValue("projects");
            header.createCell(3).setCellValue("tasks");
            header.createCell(4).setCellValue("doneTasks");
            header.createCell(5).setCellValue("overdueTasks");
            header.createCell(6).setCellValue("completionRate");

            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue(String.valueOf(summary.get("organizationId")));
            row.createCell(1).setCellValue(toDouble(summary.get("users")));
            row.createCell(2).setCellValue(toDouble(summary.get("projects")));
            row.createCell(3).setCellValue(toDouble(summary.get("tasks")));
            row.createCell(4).setCellValue(toDouble(summary.get("doneTasks")));
            row.createCell(5).setCellValue(toDouble(summary.get("overdueTasks")));
            row.createCell(6).setCellValue(toDouble(summary.get("completionRate")));

            for (int i = 0; i <= 6; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to export KPI xlsx", ex);
        }
    }

    public byte[] exportKpiPdf() {
        Map<String, Object> summary = getKpiSummary();
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph("TeamFlow KPI Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100f);
            addPdfCell(table, "organizationId");
            addPdfCell(table, String.valueOf(summary.get("organizationId")));
            addPdfCell(table, "users");
            addPdfCell(table, String.valueOf(summary.get("users")));
            addPdfCell(table, "projects");
            addPdfCell(table, String.valueOf(summary.get("projects")));
            addPdfCell(table, "tasks");
            addPdfCell(table, String.valueOf(summary.get("tasks")));
            addPdfCell(table, "doneTasks");
            addPdfCell(table, String.valueOf(summary.get("doneTasks")));
            addPdfCell(table, "overdueTasks");
            addPdfCell(table, String.valueOf(summary.get("overdueTasks")));
            addPdfCell(table, "completionRate");
            addPdfCell(table, String.valueOf(summary.get("completionRate")) + "%");

            document.add(table);
        } catch (DocumentException ex) {
            throw new RuntimeException("Unable to export KPI pdf", ex);
        } finally {
            document.close();
        }
        return output.toByteArray();
    }

    public String exportMemberLoadCsv(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> rows = getWeeklyMemberLoad(startDate, endDate);
        StringBuilder builder = new StringBuilder();
        builder.append("member,loggedHours,estimatedOpenHours,overloaded\n");
        for (Map<String, Object> row : rows) {
            builder.append(row.get("name")).append(",")
                    .append(row.get("loggedHours")).append(",")
                    .append(row.get("estimatedOpenHours")).append(",")
                    .append(row.get("overloaded")).append("\n");
        }
        builder.append("# range,")
                .append(startDate == null ? "" : startDate.format(DateTimeFormatter.ISO_DATE))
                .append(" to ")
                .append(endDate == null ? "" : endDate.format(DateTimeFormatter.ISO_DATE))
                .append("\n");
        return builder.toString();
    }

    public byte[] exportMemberLoadXlsx(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> rows = getWeeklyMemberLoad(startDate, endDate);
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Member Load");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("member");
            header.createCell(1).setCellValue("loggedHours");
            header.createCell(2).setCellValue("estimatedOpenHours");
            header.createCell(3).setCellValue("overloaded");

            int rowIndex = 1;
            for (Map<String, Object> rowData : rows) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(String.valueOf(rowData.get("name")));
                row.createCell(1).setCellValue(toDouble(rowData.get("loggedHours")));
                row.createCell(2).setCellValue(toDouble(rowData.get("estimatedOpenHours")));
                row.createCell(3).setCellValue(Boolean.TRUE.equals(rowData.get("overloaded")) ? "Yes" : "No");
            }

            for (int i = 0; i <= 3; i++) {
                sheet.autoSizeColumn(i);
            }
            workbook.write(output);
            return output.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to export member load xlsx", ex);
        }
    }

    public byte[] exportMemberLoadPdf(LocalDate startDate, LocalDate endDate) {
        List<Map<String, Object>> rows = getWeeklyMemberLoad(startDate, endDate);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph("TeamFlow Member Load Report", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100f);
            addPdfHeaderCell(table, "Member");
            addPdfHeaderCell(table, "Logged Hours");
            addPdfHeaderCell(table, "Estimated Open Hours");
            addPdfHeaderCell(table, "Overloaded");

            for (Map<String, Object> row : rows) {
                addPdfCell(table, String.valueOf(row.get("name")));
                addPdfCell(table, String.valueOf(row.get("loggedHours")));
                addPdfCell(table, String.valueOf(row.get("estimatedOpenHours")));
                addPdfCell(table, Boolean.TRUE.equals(row.get("overloaded")) ? "Yes" : "No");
            }

            document.add(table);
        } catch (DocumentException ex) {
            throw new RuntimeException("Unable to export member load pdf", ex);
        } finally {
            document.close();
        }
        return output.toByteArray();
    }

    public List<Map<String, Object>> getWeeklyMemberLoad(LocalDate startDate, LocalDate endDate) {
        assertReportingAccess();
        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        LocalDate start = startDate == null ? LocalDate.now().minusDays(6) : startDate;
        LocalDate end = endDate == null ? LocalDate.now() : endDate;

        return userRepository.findByOrganizationId(organizationId).stream()
                .map(user -> {
                    int loggedMinutes = taskWorklogRepository
                            .findByUserIdAndTask_Project_Organization_IdAndWorkDateBetweenOrderByWorkDateAsc(
                                    user.getId(), organizationId, start, end
                            ).stream()
                            .mapToInt(item -> item.getMinutesSpent() == null ? 0 : item.getMinutesSpent())
                            .sum();

                    int estimatedOpenHours = taskRepository.findByAssignedToIdAndAssignedTo_Organization_Id(user.getId(), organizationId).stream()
                            .filter(task -> task.getStatus() != TaskStatus.DONE)
                            .map(Task::getEstimatedHours)
                            .filter(hours -> hours != null)
                            .mapToInt(Integer::intValue)
                            .sum();

                    Map<String, Object> row = new HashMap<>();
                    row.put("userId", user.getId());
                    row.put("name", user.getFirstName() + " " + user.getLastName());
                    row.put("loggedHours", roundOneDecimal(loggedMinutes / 60.0));
                    row.put("estimatedOpenHours", estimatedOpenHours);
                    row.put("overloaded", estimatedOpenHours >= 40);
                    return row;
                })
                .toList();
    }

    public List<Map<String, Object>> getEffortSummaryByMember() {
        assertReportingAccess();
        Long organizationId = tenantAccessService.getCurrentOrganizationId();
        List<User> users = userRepository.findByOrganizationId(organizationId);
        List<Task> tasks = taskRepository.findByProject_Organization_Id(organizationId);

        return users.stream().map(user -> {
            List<Task> memberTasks = tasks.stream()
                    .filter(task -> task.getAssignedTo() != null && user.getId().equals(task.getAssignedTo().getId()))
                    .toList();
            int estimatedHours = memberTasks.stream()
                    .map(Task::getEstimatedHours)
                    .filter(hours -> hours != null)
                    .mapToInt(Integer::intValue)
                    .sum();

            int loggedMinutes = taskWorklogRepository
                    .findByUserIdAndTask_Project_Organization_IdAndWorkDateBetweenOrderByWorkDateAsc(
                            user.getId(), organizationId, LocalDate.of(2000, 1, 1), LocalDate.now().plusYears(5))
                    .stream()
                    .mapToInt(item -> item.getMinutesSpent() == null ? 0 : item.getMinutesSpent())
                    .sum();

            double loggedHours = roundOneDecimal(loggedMinutes / 60.0);
            double variance = roundOneDecimal(loggedHours - estimatedHours);
            double completionPerf = estimatedHours <= 0 ? 0 : roundOneDecimal((loggedHours / estimatedHours) * 100.0);

            Map<String, Object> row = new HashMap<>();
            row.put("userId", user.getId());
            row.put("member", user.getFirstName() + " " + user.getLastName());
            row.put("estimatedHours", estimatedHours);
            row.put("loggedHours", loggedHours);
            row.put("varianceHours", variance);
            row.put("performancePercent", completionPerf);
            return row;
        }).toList();
    }

    public String exportEffortSummaryCsv() {
        List<Map<String, Object>> rows = getEffortSummaryByMember();
        StringBuilder builder = new StringBuilder();
        builder.append("member,estimatedHours,loggedHours,varianceHours,performancePercent\n");
        for (Map<String, Object> row : rows) {
            builder.append(row.get("member")).append(",")
                    .append(row.get("estimatedHours")).append(",")
                    .append(row.get("loggedHours")).append(",")
                    .append(row.get("varianceHours")).append(",")
                    .append(row.get("performancePercent")).append("\n");
        }
        return builder.toString();
    }

    public byte[] exportEffortSummaryXlsx() {
        List<Map<String, Object>> rows = getEffortSummaryByMember();
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Effort Summary");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("member");
            header.createCell(1).setCellValue("estimatedHours");
            header.createCell(2).setCellValue("loggedHours");
            header.createCell(3).setCellValue("varianceHours");
            header.createCell(4).setCellValue("performancePercent");

            int rowIndex = 1;
            for (Map<String, Object> data : rows) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(String.valueOf(data.get("member")));
                row.createCell(1).setCellValue(toDouble(data.get("estimatedHours")));
                row.createCell(2).setCellValue(toDouble(data.get("loggedHours")));
                row.createCell(3).setCellValue(toDouble(data.get("varianceHours")));
                row.createCell(4).setCellValue(toDouble(data.get("performancePercent")));
            }

            for (int i = 0; i <= 4; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(output);
            return output.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to export effort summary xlsx", ex);
        }
    }

    public byte[] exportEffortSummaryPdf() {
        List<Map<String, Object>> rows = getEffortSummaryByMember();
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        Document document = new Document();
        try {
            PdfWriter.getInstance(document, output);
            document.open();
            document.add(new Paragraph("TeamFlow Effort Summary", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16)));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(5);
            table.setWidthPercentage(100f);
            addPdfHeaderCell(table, "Member");
            addPdfHeaderCell(table, "Estimated H");
            addPdfHeaderCell(table, "Logged H");
            addPdfHeaderCell(table, "Variance H");
            addPdfHeaderCell(table, "Performance %");

            for (Map<String, Object> row : rows) {
                addPdfCell(table, String.valueOf(row.get("member")));
                addPdfCell(table, String.valueOf(row.get("estimatedHours")));
                addPdfCell(table, String.valueOf(row.get("loggedHours")));
                addPdfCell(table, String.valueOf(row.get("varianceHours")));
                addPdfCell(table, String.valueOf(row.get("performancePercent")));
            }

            document.add(table);
        } catch (DocumentException ex) {
            throw new RuntimeException("Unable to export effort summary pdf", ex);
        } finally {
            document.close();
        }
        return output.toByteArray();
    }

    private void assertReportingAccess() {
        tenantAccessService.assertPermission(PermissionAction.VIEW_REPORTING, "You are not allowed to view reporting.");
    }

    private boolean isOverdue(Task task) {
        return task.getDueDate() != null
                && task.getStatus() != TaskStatus.DONE
                && task.getDueDate().isBefore(LocalDate.now());
    }

    private double roundOneDecimal(double value) {
        return Math.round(value * 10.0) / 10.0;
    }

    private double toDouble(Object value) {
        if (value == null) {
            return 0.0;
        }
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        try {
            return Double.parseDouble(String.valueOf(value));
        } catch (Exception ex) {
            return 0.0;
        }
    }

    private void addPdfHeaderCell(PdfPTable table, String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        table.addCell(cell);
    }

    private void addPdfCell(PdfPTable table, String text) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 9);
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        table.addCell(cell);
    }
}
