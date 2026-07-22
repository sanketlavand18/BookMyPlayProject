package com.bookmyplay.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.bookmyplay.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {

}