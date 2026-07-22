package com.bookmyplay.service;

import java.util.List;

import com.bookmyplay.entity.Category;

public interface CategoryService {

    List<Category> getAllCategories();

    Category getCategoryById(Long id);

    Category addCategory(Category category);

    Category updateCategory(Long id, Category category);

    void deleteCategory(Long id);
}