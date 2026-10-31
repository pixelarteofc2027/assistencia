package br.com.techflow.controller;

import br.com.techflow.model.ServiceOrder;
import br.com.techflow.repository.ServiceOrderRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ServiceOrderController {

    private final ServiceOrderRepository serviceOrderRepository;

    public ServiceOrderController(ServiceOrderRepository serviceOrderRepository) {
        this.serviceOrderRepository = serviceOrderRepository;
    }

    @GetMapping("/service-orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public List<ServiceOrder> findAll() {
        return serviceOrderRepository.findAll();
    }

    @PostMapping("/service-orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public ResponseEntity<ServiceOrder> create(@Valid @RequestBody ServiceOrderRequest request) {
        ServiceOrder order = new ServiceOrder(
                request.code(),
                request.reportedIssue(),
                request.status() == null ? "ABERTA" : request.status(),
                request.estimatedValue() == null ? BigDecimal.ZERO : request.estimatedValue()
        );
        return ResponseEntity.ok(serviceOrderRepository.save(order));
    }

    public record ServiceOrderRequest(
            @NotBlank String code,
            @NotBlank String reportedIssue,
            String status,
            BigDecimal estimatedValue
    ) {
    }
}
