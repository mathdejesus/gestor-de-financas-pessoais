package com.financeapp.core.service;

import com.financeapp.core.dto.CategoryDTO;
import com.financeapp.core.dto.CreateCategoryRequest;
import com.financeapp.core.dto.UpdateCategoryRequest;
import com.financeapp.core.entity.Category;
import com.financeapp.core.entity.User;
import com.financeapp.core.exception.ResourceNotFoundException;
import com.financeapp.core.repository.CategoryRepository;
import com.financeapp.core.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CategoryService categoryService;

    private User createUser() {
        return User.builder().id(1L).name("John").email("john@email.com").build();
    }

    private Category createCategory() {
        return Category.builder().id(1L).user(createUser()).name("Food").icon("utensils").color("#FF0000").build();
    }

    @Test
    void findByUserId_shouldReturnListOfCategories() {
        when(categoryRepository.findByUserIdOrderByUserId(1L)).thenReturn(List.of(createCategory()));

        List<CategoryDTO> result = categoryService.findByUserId(1L);

        assertEquals(1, result.size());
        assertEquals("Food", result.get(0).getName());
    }

    @Test
    void create_withValidData_shouldReturnCategoryDTO() {
        CreateCategoryRequest request = new CreateCategoryRequest("Food", "utensils", "#FF0000");
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(categoryRepository.existsByUserIdAndName(1L, "Food")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category cat = invocation.getArgument(0);
            cat.setId(1L);
            return cat;
        });

        CategoryDTO result = categoryService.create(1L, request);

        assertNotNull(result);
        assertEquals("Food", result.getName());
    }

    @Test
    void create_withDuplicateName_shouldThrowIllegalArgumentException() {
        CreateCategoryRequest request = new CreateCategoryRequest("Food", "utensils", "#FF0000");
        when(userRepository.findById(1L)).thenReturn(Optional.of(createUser()));
        when(categoryRepository.existsByUserIdAndName(1L, "Food")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> categoryService.create(1L, request));
    }

    @Test
    void delete_withValidId_shouldDeleteCategory() {
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createCategory()));

        assertDoesNotThrow(() -> categoryService.delete(1L, 1L));
        verify(categoryRepository).delete(any(Category.class));
    }

    @Test
    void delete_withInvalidId_shouldThrowResourceNotFoundException() {
        when(categoryRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.delete(99L, 1L));
    }

    @Test
    void update_withValidData_shouldReturnUpdatedCategory() {
        UpdateCategoryRequest request = new UpdateCategoryRequest("Groceries", "cart", "#00FF00");
        when(categoryRepository.findByIdAndUserId(1L, 1L)).thenReturn(Optional.of(createCategory()));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryDTO result = categoryService.update(1L, 1L, request);

        assertEquals("Groceries", result.getName());
        assertEquals("cart", result.getIcon());
        assertEquals("#00FF00", result.getColor());
    }
}
