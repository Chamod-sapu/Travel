package com.travelnest.hotelservice.service;

import com.travelnest.hotelservice.dto.BookHotelRequest;
import com.travelnest.hotelservice.dto.BookingResponse;
import com.travelnest.hotelservice.dto.HotelRequest;
import com.travelnest.hotelservice.dto.HotelResponse;

import java.util.List;

public interface HotelService {
    List<HotelResponse> searchHotels(String location);
    HotelResponse getHotelById(Long id);
    BookingResponse bookHotel(Long userId, BookHotelRequest request);
    List<BookingResponse> getMyBookings(Long userId);
    void cancelBooking(Long userId, Long bookingId);

    // Admin Features
    HotelResponse createHotel(HotelRequest request);
    HotelResponse updateHotel(Long id, HotelRequest request);
    void deleteHotel(Long id);
    List<BookingResponse> getAllBookings();
}
