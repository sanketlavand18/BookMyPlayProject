package com.bookmyplay.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "support_tickets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String userRole;

    private String title;

    @Column(length = 2000)
    private String message;

    private String status = "PENDING"; // PENDING, RESOLVED, CLOSED

    @Column(length = 2000)
    private String replyMessage;

    private LocalDateTime createdAt = LocalDateTime.now();
}