package com.bookmyplay.controller;

import com.bookmyplay.entity.Notification;
import com.bookmyplay.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Notification> getAllNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @GetMapping("/unread/{userId}")
    public List<Notification> getUnreadNotifications(@PathVariable Long userId) {
        return notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "UNREAD");
    }

    @PutMapping("/read/{id}")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setStatus("READ");
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);
        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all/{userId}")
    public ResponseEntity<?> markAllAsRead(@PathVariable Long userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndStatusOrderByCreatedAtDesc(userId, "UNREAD");
        for (Notification n : unread) {
            n.setStatus("READ");
            n.setReadAt(LocalDateTime.now());
        }
        notificationRepository.saveAll(unread);
        return ResponseEntity.ok("All notifications marked as read");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        return ResponseEntity.ok("Notification deleted");
    }

    @PostMapping("/send")
    public ResponseEntity<Notification> sendNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
