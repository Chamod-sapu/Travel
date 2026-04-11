package com.travelnest.apigateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import jakarta.annotation.PostConstruct;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

@Component
public class JwtAuthFilter extends AbstractGatewayFilterFactory<JwtAuthFilter.Config> {

    @Value("${jwt.public-key}")
    private String publicKeyStr;

    private PublicKey publicKey;

    public JwtAuthFilter() {
        super(Config.class);
    }

    @PostConstruct
    public void init() throws Exception {
        String key = publicKeyStr.replace("-----BEGIN PUBLIC KEY-----", "")
                .replace("-----END PUBLIC KEY-----", "")
                .replaceAll("\\s", "");
        byte[] keyBytes = Base64.getDecoder().decode(key);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        this.publicKey = keyFactory.generatePublic(keySpec);
    }

    public static class Config {
        // configuration properties if any
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange.getResponse(), "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange.getResponse(), "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(publicKey)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();
                
                // Add userId as header downstream if needed
                request = exchange.getRequest()
                        .mutate()
                        .header("X-UserId", String.valueOf(claims.get("userId")))
                        .header("X-Role", String.valueOf(claims.get("role")))
                        .build();

            } catch (JwtException e) {
                return onError(exchange.getResponse(), "Invalid JWT Token", HttpStatus.UNAUTHORIZED);
            }

            return chain.filter(exchange.mutate().request(request).build());
        };
    }

    private Mono<Void> onError(ServerHttpResponse response, String errCode, HttpStatus httpStatus) {
        response.setStatusCode(httpStatus);
        DataBuffer buffer = response.bufferFactory().wrap(errCode.getBytes());
        return response.writeWith(Mono.just(buffer));
    }
}
