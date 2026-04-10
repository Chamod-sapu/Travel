package com.travelnest.userservice.controller;

import com.travelnest.userservice.dto.AuthResponse;
import com.travelnest.userservice.dto.LoginRequest;
import com.travelnest.userservice.dto.RegisterRequest;
import com.travelnest.userservice.dto.UserResponse;
import com.travelnest.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request));
    }
}
