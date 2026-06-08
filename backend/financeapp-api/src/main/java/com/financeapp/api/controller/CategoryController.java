package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.entity.User;
import com.financeapp.core.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Category management")
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    @Operation(summary = "List all categories", description = "Get all categories for the authenticated user")
    public ResponseEntity<List<CategoryDTO>> findAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.findByUserId(user.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Get a specific category by its ID")
    public ResponseEntity<CategoryDTO> findById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.findByIdAndUserId(id, user.getId()));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Create a new category")
    public ResponseEntity<CategoryDTO> create(@Valid @RequestBody CreateCategoryRequest request,
                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.create(user.getId(), request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Update an existing category")
    public ResponseEntity<CategoryDTO> update(@PathVariable Long id,
                                              @Valid @RequestBody UpdateCategoryRequest request,
                                              @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(categoryService.update(id, user.getId(), request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete category", description = "Delete a category by its ID")
    public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal User user) {
        categoryService.delete(id, user.getId());
        return ResponseEntity.noContent().build();
    }
}
