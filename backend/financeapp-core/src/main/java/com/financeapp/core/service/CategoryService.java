package com.financeapp.core.service;

import com.financeapp.core.dto.CategoryDTO;
import com.financeapp.core.dto.CreateCategoryRequest;
import com.financeapp.core.dto.UpdateCategoryRequest;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for user-owned transaction categories.
 * Enforces unique category names per user via the database constraint
 * and a pre-save existence check.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CategoryDTO> findByUserId(Long userId) {
        return categoryRepository.findByUserIdOrderByUserId(userId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryDTO findByIdAndUserId(Long id, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO create(Long userId, CreateCategoryRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (categoryRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new IllegalArgumentException("Category name already exists for this user");
        }

        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .icon(request.getIcon())
                .color(request.getColor())
                .build();

        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public CategoryDTO update(Long id, Long userId, UpdateCategoryRequest request) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (request.getName() != null) {
            category.setName(request.getName());
        }
        if (request.getIcon() != null) {
            category.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            category.setColor(request.getColor());
        }

        category = categoryRepository.save(category);
        return toDTO(category);
    }

    @Transactional
    public void delete(Long id, Long userId) {
        Category category = categoryRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        categoryRepository.delete(category);
    }

    private CategoryDTO toDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .color(category.getColor())
                .build();
    }
}
