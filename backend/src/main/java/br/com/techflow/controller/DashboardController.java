package br.com.techflow.controller;

import br.com.techflow.repository.CustomerRepository;
import br.com.techflow.repository.EquipmentRepository;
import br.com.techflow.repository.ServiceOrderRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final CustomerRepository customerRepository;
    private final EquipmentRepository equipmentRepository;
    private final ServiceOrderRepository serviceOrderRepository;

    public DashboardController(CustomerRepository customerRepository,
                              EquipmentRepository equipmentRepository,
                              ServiceOrderRepository serviceOrderRepository) {
        this.customerRepository = customerRepository;
        this.equipmentRepository = equipmentRepository;
        this.serviceOrderRepository = serviceOrderRepository;
    }

    @GetMapping("/dashboard")
    public Map<String, Long> dashboard() {
        return Map.of(
                "customers", customerRepository.count(),
                "equipment", equipmentRepository.count(),
                "serviceOrders", serviceOrderRepository.count()
        );
    }
}
