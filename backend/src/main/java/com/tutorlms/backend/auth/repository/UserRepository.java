package com.tutorlms.backend.auth.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tutorlms.backend.auth.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    // 1, tim nguoi dung theo so dien thoai 
    Optional<User> findByPhone(String phone);
    //2, kiem tra so dien thoai da duoc dang ky chua 
    boolean existsByPhone(String phone);
    //3, kiem tra email da duoc dang ky chua
    boolean existsByEmail(String email);
    // tim kiem qua email 
    Optional<User> findByEmail(String email);
    //tim kiem nguoi dung theo sdt hoac email 
    Optional<User> findByPhoneOrEmail(String phone, String email);
    
}


