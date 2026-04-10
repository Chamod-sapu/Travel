package com.travelnest.hotelservice.service;

import com.travelnest.hotelservice.dto.BookHotelRequest;
import com.travelnest.hotelservice.dto.HotelRequest;
import com.travelnest.hotelservice.dto.BookingResponse;
import com.travelnest.hotelservice.dto.HotelResponse;
import com.travelnest.hotelservice.entity.BookingStatus;
import com.travelnest.hotelservice.entity.Hotel;
import com.travelnest.hotelservice.entity.HotelBooking;
import com.travelnest.hotelservice.repository.HotelBookingRepository;
import com.travelnest.hotelservice.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HotelServiceImpl implements HotelService {

    private final HotelRepository hotelRepository;
    private final HotelBookingRepository hotelBookingRepository;

    @Override
    public List<HotelResponse> searchHotels(String location) {
        return hotelRepository.searchHotels(location)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public HotelResponse getHotelById(Long id) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        return mapToResponse(hotel);
    }

    @Override
    @Transactional
    public BookingResponse bookHotel(Long userId, BookHotelRequest request) {
        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        if (hotel.getAvailableRooms() < request.getRooms()) {
            throw new RuntimeException("Not enough rooms available");
        }

        // Decrement available rooms atomically via entity update
        hotel.setAvailableRooms(hotel.getAvailableRooms() - request.getRooms());
        hotelRepository.save(hotel);

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if(nights <= 0) {
            throw new RuntimeException("Check out must be after check in date");
        }

        BigDecimal totalPrice = hotel.getPricePerNight()
                .multiply(new BigDecimal(request.getRooms()))
                .multiply(new BigDecimal(nights));

        HotelBooking booking = HotelBooking.builder()
                .hotelId(hotel.getId())
                .userId(userId)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .rooms(request.getRooms())
                .totalPrice(totalPrice)
                .status(BookingStatus.PENDING)
                .build();

        booking = hotelBookingRepository.save(booking);

        return mapToBookingResponse(booking);
    }

    @Override
    public List<BookingResponse> getMyBookings(Long userId) {
        return hotelBookingRepository.findByUserId(userId).stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(Long userId, Long bookingId) {
        HotelBooking booking = hotelBookingRepository.findByIdAndUserId(bookingId, userId)
                .orElseThrow(() -> new RuntimeException("Booking not found or not owned by user"));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled");
        }

        // Restore rooms
        Hotel hotel = hotelRepository.findById(booking.getHotelId())
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setAvailableRooms(hotel.getAvailableRooms() + booking.getRooms());
        hotelRepository.save(hotel);

        booking.setStatus(BookingStatus.CANCELLED);
        hotelBookingRepository.save(booking);
    }

    @Override
    public HotelResponse createHotel(HotelRequest request) {
        Hotel hotel = Hotel.builder()
                .name(request.getName())
                .location(request.getLocation())
                .rating(request.getRating())
                .pricePerNight(request.getPricePerNight())
                .availableRooms(request.getAvailableRooms())
                .imageUrl(request.getImageUrl())
                .description(request.getDescription())
                .build();
        return mapToResponse(hotelRepository.save(hotel));
    }

    @Override
    public HotelResponse updateHotel(Long id, HotelRequest request) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));
        hotel.setName(request.getName());
        hotel.setLocation(request.getLocation());
        hotel.setRating(request.getRating());
        hotel.setPricePerNight(request.getPricePerNight());
        hotel.setAvailableRooms(request.getAvailableRooms());
        hotel.setImageUrl(request.getImageUrl());
        hotel.setDescription(request.getDescription());
        return mapToResponse(hotelRepository.save(hotel));
    }

    @Override
    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    @Override
    public List<BookingResponse> getAllBookings() {
        return hotelBookingRepository.findAll().stream()
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    private HotelResponse mapToResponse(Hotel hotel) {
        return HotelResponse.builder()
                .id(hotel.getId())
                .name(hotel.getName())
                .location(hotel.getLocation())
                .rating(hotel.getRating())
                .pricePerNight(hotel.getPricePerNight())
                .availableRooms(hotel.getAvailableRooms())
                .imageUrl(hotel.getImageUrl())
                .description(hotel.getDescription())
                .build();
    }

    private BookingResponse mapToBookingResponse(HotelBooking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .hotelId(booking.getHotelId())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .rooms(booking.getRooms())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .bookedAt(booking.getBookedAt())
                .build();
    }
}
