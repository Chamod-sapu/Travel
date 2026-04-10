package com.travelnest.notificationservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "travelnest.exchange";
    public static final String QUEUE_CONFIRMED = "payment.confirmed";
    public static final String ROUTING_KEY_CONFIRMED = "payment.confirmed";

    public static final String QUEUE_REFUNDED = "payment.refunded";
    public static final String ROUTING_KEY_REFUNDED = "payment.refunded";

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue confirmedQueue() {
        return new Queue(QUEUE_CONFIRMED, true);
    }

    @Bean
    public Binding confirmedBinding(Queue confirmedQueue, DirectExchange exchange) {
        return BindingBuilder.bind(confirmedQueue).to(exchange).with(ROUTING_KEY_CONFIRMED);
    }

    @Bean
    public Queue refundedQueue() {
        return new Queue(QUEUE_REFUNDED, true);
    }

    @Bean
    public Binding refundedBinding(Queue refundedQueue, DirectExchange exchange) {
        return BindingBuilder.bind(refundedQueue).to(exchange).with(ROUTING_KEY_REFUNDED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
