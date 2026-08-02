package com.bookmyplay.service;

import com.bookmyplay.entity.Notification;
import com.bookmyplay.entity.VendorSubscription;
import com.bookmyplay.repository.NotificationRepository;
import com.bookmyplay.repository.VendorSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SubscriptionScheduler {

    private final VendorSubscriptionRepository subscriptionRepository;
    private final NotificationRepository notificationRepository;

    @Scheduled(cron = "0 0 1 * * ?") // 1:00 AM daily check
    public void checkSubscriptionExpirations() {
        List<VendorSubscription> activeSubscriptions = subscriptionRepository.findAll().stream()
                .filter(s -> "ACTIVE".equalsIgnoreCase(s.getStatus()))
                .filter(s -> s.getExpiryDate() != null)
                .toList();

        LocalDate today = LocalDate.now();

        for (VendorSubscription sub : activeSubscriptions) {
            long daysRemaining = ChronoUnit.DAYS.between(today, sub.getExpiryDate());

            if (daysRemaining <= 0) {
                sub.setStatus("EXPIRED");
                sub.setPaymentStatus("EXPIRED");
                subscriptionRepository.save(sub);

                createSystemNotification(
                        sub.getVendorId(),
                        "Subscription Expired",
                        "Your free trial / subscription plan has expired. Please purchase a new plan to resume publishing and managing your venues."
                );
            } else if (daysRemaining == 7) {
                createSystemNotification(
                        sub.getVendorId(),
                        "Subscription Expiry Reminder (7 Days)",
                        "Your current plan (" + sub.getPlanName() + ") has only 7 days remaining. Purchase a paid subscription plan soon to continue without interruption!"
                );
            } else if (daysRemaining == 3) {
                createSystemNotification(
                        sub.getVendorId(),
                        "Subscription Expiry Reminder (3 Days)",
                        "Your current plan (" + sub.getPlanName() + ") has only 3 days remaining. Please purchase a subscription plan."
                );
            }
        }
    }

    private void createSystemNotification(Long userId, String title, String message) {
        boolean exists = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(n -> title.equalsIgnoreCase(n.getTitle()))
                .anyMatch(n -> n.getCreatedAt() != null && n.getCreatedAt().toLocalDate().isEqual(LocalDate.now()));

        if (!exists) {
            Notification notif = Notification.builder()
                    .userId(userId)
                    .title(title)
                    .message(message)
                    .type("SYSTEM")
                    .status("UNREAD")
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notif);
        }
    }
}
