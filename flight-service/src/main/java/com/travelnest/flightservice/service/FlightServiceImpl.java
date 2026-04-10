package com.travelnest.flightservice.service;

import com.travelnest.flightservice.dto.BookFlightRequest;
import com.travelnest.flightservice.dto.FlightRequest;
import com.travelnest.flightservice.dto.BookingResponse;
import com.travelnest.flightservice.dto.FlightResponse;
import com.travelnest.flightservice.entity.BookingStatus;
import com.travelnest.flightservice.entity.Flight;
import com.travelnest.flightservice.entity.FlightBooking;
import com.travelnest.flightservice.repository.FlightBookingRepository;
import com.travelnest.flightservice.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlightServiceImpl implements FlightService {

    private final FlightRepository flightRepository;
    private final FlightBookingRepository flightBookingRepository;

    @Override
    public List<FlightResponse> searchFlights(String origin, String destination, LocalDateTime dateStart, LocalDateTime dateEnd) {
        return flightRepository.searchFlights(origin, destination, dateStart, dateEnd)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public FlightResponse getFlightById(Long id) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        return mapToResponse(flight);
    }

    @Override
    @Transactional
    public BookingResponse bookFlight(Long userId, BookFlightRequest request) {
        Flight flight = flightRepository.findById(request.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        if (flight.getAvailableSeats() < request.getSeats()) {
            throw new RuntimeException("Not enough seats available");
        }

        // Decrement available seats atomically via entity update
        flight.setAvailableSeats(flight.getAvailableSeats() - request.getSeats());
        flightRepository.save(flight);

        BigDecimal totalPrice = flight.getPrice().multiply(new BigDecimal(request.getSeats()));

        FlightBooking booking = FlightBooking.builder()
                .flightId(flight.getId())
                .userId(userId)
                .seats(request.getSeats())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .build();

        booking = flightBookingRepository.save(booking);

        return mapToBookingResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(Long userId) {
        return flightBookingRepository.findByUserId(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(Long userId, Long bookingId) {
        FlightBooking booking = flightBookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new RuntimeException("Booking not found or not owned by user"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Restore seats
        Flight flight = flightRepository.findById(booking.getFlightId())
                .orElseThrow(() -> new RuntimeException("Flight not found"));

        flight.setAvailableSeats(flight.getAvailableSeats() + booking.getSeats());
        flightRepository.save(flight);

        booking.setStatus(BookingStatus.CANCELLED);
        flightBookingRepository.save(booking);
    }

    @Override
    public FlightResponse createFlight(FlightRequest request) {
        Flight flight = Flight.builder()
                .flightNumber(request.getFlightNumber())
                .origin(request.getOrigin())
                .destination(request.getDestination())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .price(request.getPrice())
                .availableSeats(request.getAvailableSeats())
                .build();
        return mapToResponse(flightRepository.save(flight));
    }

    @Override
    public FlightResponse updateFlight(Long id, FlightRequest request) {
        Flight flight = flightRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Flight not found"));
        flight.setFlightNumber(request.getFlightNumber());
        flight.setOrigin(request.getOrigin());
        flight.setDestination(request.getDestination());
        flight.setDepartureTime(request.getDepartureTime());
        flight.setArrivalTime(request.getArrivalTime());
        flight.setPrice(request.getPrice());
        flight.setAvailableSeats(request.getAvailableSeats());
        return mapToResponse(flightRepository.save(flight));
    }

    @Override
    public void deleteFlight(Long id) {
        flightRepository.deleteById(id);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return flightBookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private FlightResponse mapToResponse(Flight flight) {
        return FlightResponse.builder()
                .id(flight.getId())
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getOrigin())
                .destination(flight.getDestination())
                .departureTime(flight.getDepartureTime())
                .arrivalTime(flight.getArrivalTime())
                .price(flight.getPrice())
                .availableSeats(flight.getAvailableSeats())
                .build();
    }

    private BookingResponse mapToBookingResponse(FlightBooking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .flightId(booking.getFlightId())
                .seats(booking.getSeats())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .bookedAt(booking.getBookedAt())
                .build();
    }
}
