
export type ViewState = 'HOME' | 'ROOMS' | 'EXPERIENCES' | 'ABOUT' | 'ROOM_DETAIL' | 'EXPERIENCE_DETAIL' | 'DASHBOARD' | 'MY_PROFILE' | 'MY_RESERVATIONS';

export interface Slide {
  id: number;
  name: string;
  description: string;
  image: string;
  location: string;
  action: {
    view: ViewState;
    payload: string; // 'hanoi', 'danang', 'hcmc'
  };
}

export enum SlideDirection {
  NEXT = 'NEXT',
  PREV = 'PREV',
}

export type BookingStatus = 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface Booking {
    id: string;
    userId: string;
    type: 'ROOM' | 'EXPERIENCE';
    itemDetails: {
        id: string;
        name: string;
        image: string;
        location: string;
    };
    dates: {
        checkIn: string;
        checkOut?: string; // Optional for Experience
        startTime?: string; // Optional for Room
    };
    guests: {
        adults: number;
        children: number;
    };
    totalPrice: string;
    paymentMethod: 'credit_card' | 'bank_transfer' | 'pay_at_counter'; // Added strict typing for payment
    status: BookingStatus;
    bookedAt: string;
}

export interface ServiceRequest {
  id: string;
  roomNumber: string;
  serviceType: string;
  details: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  requestedAt: string;
}

export interface SystemConfig {
  hotelName: string;
  hotline: string;
  email: string;
  address: string;
  maxGuestsPerRoom: number;
  defaultServiceFee: number; // percentage
  maintenanceMode: boolean;
  homepageNotification: string; // Empty string means no notification
  enableBooking: boolean;
}
