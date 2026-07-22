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
        return categoryRepository.save(category);
    }

    @Override
    public Category updateCategory(Long id, Category category) {

        Category existing = categoryRepository.findById(id).orElse(null);

        if (existing != null) {
            existing.setCategoryName(category.getCategoryName());
            existing.setDescription(category.getDescription());

            return categoryRepository.save(existing);
        }

        return null;
    }

    @Override
    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}