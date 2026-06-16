package com.financeapp.core.entity;

import com.financeapp.core.enums.GoalStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A user-defined savings or financial target with progress tracking.
 *
 * Status lifecycle: ACTIVE -> (progress reaches target) -> COMPLETED
 *                    ACTIVE -> (user abandons) -> ABANDONED
 *
 * {@code currentValue} defaults to ZERO when a goal is created; it accumulates
 * as the user logs progress. When currentValue >= targetValue the status is
 * automatically set to COMPLETED by the service layer.
 */
@Entity
@Table(name = "financial_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "target_value", nullable = false, precision = 10, scale = 2)
    private BigDecimal targetValue;

    @Column(name = "current_value", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal currentValue = BigDecimal.ZERO;

    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private GoalStatus status = GoalStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
