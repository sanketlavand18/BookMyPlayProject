package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String action;

    private String actor; // Email or name

    private String actorRole;

    @Column(length = 1000)
    private String details;

    private LocalDateTime timestamp = LocalDateTime.now();
}