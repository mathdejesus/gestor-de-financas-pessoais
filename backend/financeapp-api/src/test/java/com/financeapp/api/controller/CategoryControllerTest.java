package com.financeapp.api.controller;

import com.financeapp.core.dto.*;
import com.financeapp.core.service.CategoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CategoryController.class, properties = {"app.jpa.enabled=false"})
@AutoConfigureMockMvc(addFilters = false)
class CategoryControllerTest extends ControllerTestBase {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void findAll_shouldReturnCategoryList() throws Exception {
        List<CategoryDTO> categories = List.of(
                CategoryDTO.builder().id(1L).name("Food").icon("🍕").color("#FF0000").build(),
                CategoryDTO.builder().id(2L).name("Transport").icon("🚗").color("#00FF00").build()
        );

        when(categoryService.findByUserId(1L)).thenReturn(categories);

        mockMvc.perform(get("/api/v1/categories")
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Food"));
    }

    @Test
    void findById_shouldReturnCategory() throws Exception {
        CategoryDTO category = CategoryDTO.builder().id(1L).name("Food").icon("🍕").color("#FF0000").build();

        when(categoryService.findByIdAndUserId(1L, 1L)).thenReturn(category);

        mockMvc.perform(get("/api/v1/categories/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Food"));
    }

    @Test
    void create_shouldReturn201() throws Exception {
        CreateCategoryRequest request = new CreateCategoryRequest("New Cat", "📦", "#333");
        CategoryDTO created = CategoryDTO.builder().id(10L).name("New Cat").icon("📦").color("#333").build();

        when(categoryService.create(anyLong(), any(CreateCategoryRequest.class))).thenReturn(created);

        mockMvc.perform(post("/api/v1/categories")
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("New Cat"));
    }

    @Test
    void update_shouldReturnUpdatedCategory() throws Exception {
        UpdateCategoryRequest request = new UpdateCategoryRequest("Updated", "🔄", "#999");
        CategoryDTO updated = CategoryDTO.builder().id(1L).name("Updated").icon("🔄").color("#999").build();

        when(categoryService.update(anyLong(), anyLong(), any(UpdateCategoryRequest.class))).thenReturn(updated);

        mockMvc.perform(put("/api/v1/categories/{id}", 1L)
                        .with(withAuthenticatedUser())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated"));
    }

    @Test
    void delete_shouldReturn204() throws Exception {
        doNothing().when(categoryService).delete(1L, 1L);

        mockMvc.perform(delete("/api/v1/categories/{id}", 1L)
                        .with(withAuthenticatedUser()))
                .andExpect(status().isNoContent());
    }
}
