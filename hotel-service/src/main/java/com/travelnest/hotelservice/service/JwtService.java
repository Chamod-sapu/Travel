package com.travelnest.hotelservice.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Service
public class JwtService {

    @Value("${jwt.public-key}")
    private String publicKeyStr;

    private PublicKey publicKey;

    @PostConstruct
    public void init() throws Exception {
        String key = publicKeyStr.replaceAll("-----[A-Z ]+-----", "")
                .replaceAll("\\s", "");
        try {
            byte[] keyBytes = Base64.getDecoder().decode(key);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            this.publicKey = keyFactory.generatePublic(keySpec);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Failed to decode Base64 public key. Ensure the Kubernetes jwt-secret is a valid PEM format without extra hyphens.", e);
        }
    }

    public Long extractUserId(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(publicKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            return Long.valueOf(claims.get("userId").toString());
        }
        throw new RuntimeException("Unauthorized: Missing or invalid token");
    }
}
