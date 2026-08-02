package com.bookmyplay.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.bookmyplay.entity.Category;
import com.bookmyplay.repository.CategoryRepository;
import com.bookmyplay.service.CategoryService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category addCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Category Name is required.");
        }
        categoryRepository.findByCategoryNameIgnoreCase(category.getCategoryName().trim())
            .ifPresent(existing -> {
                throw new RuntimeException("Category already exists.");
            });
        
        category.setCategoryName(category.getCategoryName().trim());
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().trim().isEmpty()) {
            throw new RuntimeException("Category Name is required.");
        }
        
        Category existing = categoryRepository.findById(id).orElse(null);

        if (existing != null) {
            // Check if name is changing and duplicate name already exists
            if (!existing.getCategoryName().equalsIgnoreCase(category.getCategoryName().trim())) {
                categoryRepository.findByCategoryNameIgnoreCase(category.getCategoryName().trim())
                    .ifPresent(dup -> {
                        throw new RuntimeException("Category name already exists.");
                    });
            }
            
            existing.setCategoryName(category.getCategoryName().trim());
            existing.setDescription(category.getDescription());
            existing.setIcon(category.getIcon());

            return categoryRepository.save(existing);
        }

        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}