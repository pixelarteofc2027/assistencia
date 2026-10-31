package br.com.techflow.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 140)
    private String brand;

    @Column(nullable = false, length = 140)
    private String model;

    @Column(length = 120)
    private String serialNumber;

    @Column(nullable = false, length = 500)
    private String reportedIssue;

    @Column(length = 60)
    private String status = "PENDENTE";

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    public Equipment() {
        this.createdAt = OffsetDateTime.now();
    }

    public Equipment(String brand, String model, String serialNumber, String reportedIssue, String status) {
        this.brand = brand;
        this.model = model;
        this.serialNumber = serialNumber;
        this.reportedIssue = reportedIssue;
        this.status = status;
        this.createdAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public String getReportedIssue() {
        return reportedIssue;
    }

    public void setReportedIssue(String reportedIssue) {
        this.reportedIssue = reportedIssue;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
