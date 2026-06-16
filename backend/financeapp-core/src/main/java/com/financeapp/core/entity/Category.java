package com.financeapp.core.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Transaction category owned by a user.
 *
 * {@code icon} and {@code color} are optional display hints used by the frontend
 * to render category chips with consistent visual identification:
 * - icon: Material Design icon name (e.g. "shopping-cart", "restaurant")
 * - color: 6-character hex color string (e.g. "FF5733")
 *
 * The composite unique constraint on (user_id, name) ensures each user's
 * categories have unique names within their scope.
 */
@Entity
@Table(name = "categories", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "name"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String icon;

    @Column(length = 7)
    private String color;
}
