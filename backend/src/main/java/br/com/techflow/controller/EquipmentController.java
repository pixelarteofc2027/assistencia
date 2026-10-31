package br.com.techflow.controller;

import br.com.techflow.model.Equipment;
import br.com.techflow.repository.EquipmentRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class EquipmentController {

    private final EquipmentRepository equipmentRepository;

    public EquipmentController(EquipmentRepository equipmentRepository) {
        this.equipmentRepository = equipmentRepository;
    }

    @GetMapping("/equipment")
    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    @PostMapping("/equipment")
    public ResponseEntity<Equipment> create(@Valid @RequestBody EquipmentRequest request) {
        Equipment equipment = new Equipment(
                request.brand(),
                request.model(),
                request.serialNumber(),
                request.reportedIssue(),
                request.status() == null ? "PENDENTE" : request.status()
        );
        return ResponseEntity.ok(equipmentRepository.save(equipment));
    }

    public record EquipmentRequest(
            @NotBlank String brand,
            @NotBlank String model,
            String serialNumber,
            @NotBlank String reportedIssue,
            String status
    ) {
    }
}
