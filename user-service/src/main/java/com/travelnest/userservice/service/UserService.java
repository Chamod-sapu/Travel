package com.travelnest.userservice.service;

import com.travelnest.userservice.dto.AuthResponse;
import com.travelnest.userservice.dto.LoginRequest;
import com.travelnest.userservice.dto.RegisterRequest;
import com.travelnest.userservice.dto.UpdateProfileRequest;
import com.travelnest.userservice.dto.UserResponse;

public interface UserService {
    UserResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    UserResponse getProfile(Long userId);
    UserResponse updateProfile(Long userId, UpdateProfileRequest request);

    // Admin Features
    java.util.List<UserResponse> getAllUsers();
    void updateUserStatus(Long userId, boolean enabled);
}
