
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, ServiceRequest } from '../types';
import { useAuth } from './AuthContext';

interface BookingContextType {
  bookings: Booking[];
  serviceRequests: ServiceRequest[];
  addBooking: (booking: Omit<Booking, 'id' | 'status' | 'bookedAt' | 'userId'>, guestEmail?: string) => Booking;
  cancelBooking: (bookingId: string) => Promise<boolean>;
  modifyBooking: (bookingId: string, newDates: { checkIn: string; checkOut?: string; startTime?: string }) => Promise<boolean>;
  updateBookingStatus: (bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED') => Promise<boolean>;
  addServiceRequest: (request: Omit<ServiceRequest, 'id' | 'status' | 'requestedAt'>) => ServiceRequest;
  updateServiceRequestStatus: (requestId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => Promise<boolean>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);

  // Load from Local Storage on mount
  useEffect(() => {
    const storedBookings = localStorage.getItem('datvaloir_bookings');
    if (storedBookings) {
        try {
            setBookings(JSON.parse(storedBookings));
        } catch (e) {
            console.error("Failed to parse bookings from storage", e);
            setBookings([]);
        }
    }

    const storedRequests = localStorage.getItem('datvaloir_service_requests');
    if (storedRequests) {
        try {
            setServiceRequests(JSON.parse(storedRequests));
        } catch (e) {
            console.error("Failed to parse service requests from storage", e);
            setServiceRequests([]);
        }
    }
  }, []);

  // Sync to local storage whenever bookings change
  useEffect(() => {
    if (bookings.length > 0) {
        localStorage.setItem('datvaloir_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (serviceRequests.length > 0) {
        localStorage.setItem('datvaloir_service_requests', JSON.stringify(serviceRequests));
    }
  }, [serviceRequests]);

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'status' | 'bookedAt' | 'userId'>, guestEmail?: string): Booking => {
      // Determine User ID: Logged in user email OR Guest email provided
      const ownerId = user ? user.email : (guestEmail || 'guest');
      
      const newBooking: Booking = {
          ...newBookingData,
          id: 'RES-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          userId: ownerId,
          status: 'CONFIRMED',
          bookedAt: new Date().toISOString()
      };

      setBookings(prev => [newBooking, ...prev]);
      return newBooking; // Return the full object so we can get ID in UI
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
      console.log("BookingContext: Cancelling booking ID", bookingId);
      return new Promise((resolve) => {
          setTimeout(() => {
              setBookings(prevBookings => {
                  const updatedBookings = prevBookings.map(b => {
                      if (b.id === bookingId) {
                          console.log("BookingContext: Found booking, updating status to CANCELLED");
                          return { ...b, status: 'CANCELLED' as const };
                      }
                      return b;
                  });
                  
                  // Force sync to storage immediately for safety
                  localStorage.setItem('datvaloir_bookings', JSON.stringify(updatedBookings));
                  
                  return updatedBookings;
              });
              resolve(true);
          }, 500); // 0.5s delay for realism
      });
  };

  const modifyBooking = async (bookingId: string, newDates: { checkIn: string; checkOut?: string; startTime?: string }): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              setBookings(prevBookings => {
                  const updatedBookings = prevBookings.map(b => {
                      if (b.id === bookingId) {
                          return { ...b, dates: newDates };
                      }
                      return b;
                  });
                  localStorage.setItem('datvaloir_bookings', JSON.stringify(updatedBookings));
                  return updatedBookings;
              });
              resolve(true);
          }, 500);
      });
  };

  const updateBookingStatus = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              setBookings(prevBookings => {
                  const updatedBookings = prevBookings.map(b => {
                      if (b.id === bookingId) {
                          return { ...b, status };
                      }
                      return b;
                  });
                  localStorage.setItem('datvaloir_bookings', JSON.stringify(updatedBookings));
                  return updatedBookings;
              });
              resolve(true);
          }, 500);
      });
  };

  const addServiceRequest = (requestData: Omit<ServiceRequest, 'id' | 'status' | 'requestedAt'>): ServiceRequest => {
      const newRequest: ServiceRequest = {
          ...requestData,
          id: 'SRV-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          status: 'PENDING',
          requestedAt: new Date().toISOString()
      };

      setServiceRequests(prev => [newRequest, ...prev]);
      return newRequest;
  };

  const updateServiceRequestStatus = async (requestId: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<boolean> => {
      return new Promise((resolve) => {
          setTimeout(() => {
              setServiceRequests(prevRequests => {
                  const updatedRequests = prevRequests.map(r => {
                      if (r.id === requestId) {
                          return { ...r, status };
                      }
                      return r;
                  });
                  localStorage.setItem('datvaloir_service_requests', JSON.stringify(updatedRequests));
                  return updatedRequests;
              });
              resolve(true);
          }, 500);
      });
  };

  return (
    <BookingContext.Provider value={{ bookings, serviceRequests, addBooking, cancelBooking, modifyBooking, updateBookingStatus, addServiceRequest, updateServiceRequestStatus }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
