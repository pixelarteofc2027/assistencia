package br.com.techflow.controller;

import br.com.techflow.model.Customer;
import br.com.techflow.repository.CustomerRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    @GetMapping("/customers")
    @PreAuthorize("hasAnyRole('ADMIN', 'TECHNICIAN')")
    public List<Customer> findAll() {
        return customerRepository.findAll();
    }

    @PostMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Customer> create(@Valid @RequestBody CustomerRequest request) {
        Customer customer = new Customer(request.name(), request.phone(), request.email());
        Customer saved = customerRepository.save(customer);
        return ResponseEntity.ok(saved);
    }

    public record CustomerRequest(
            @NotBlank String name,
            String phone,
            String email
    ) {
    }
}
