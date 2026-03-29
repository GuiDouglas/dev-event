import { Schema, model, models, Types } from 'mongoose';
import Event from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      validate: {
        validator: (email: string) => {
          const emailRegex =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
          return emailRegex.test(email);
        },
        message: 'Invalid email',
      },
    },
  },
  {
    timestamps: true,
  }
);

//
// 🔥 HOOK MODERNO (SEM next, SEM TIPAGEM ERRADA)
//
BookingSchema.pre('save', async function () {
  const booking = this;

  // só valida se necessário
  if (booking.isModified('eventId') || booking.isNew) {
    const eventExists = await Event.findById(booking.eventId).select('_id');

    if (!eventExists) {
      const error = new Error(
        `Event with ID ${booking.eventId} does not exist`
      );
      error.name = 'ValidationError';
      throw error;
    }
  }
});

//
// 🔥 INDICES
//
BookingSchema.index({ eventId: 1 });
BookingSchema.index({ eventId: 1, createdAt: -1 });
BookingSchema.index({ email: 1 });

// unicidade real
BookingSchema.index(
  { eventId: 1, email: 1 },
  { unique: true, name: 'uniq_event_email' }
);

//
// 🔥 SAFE MODEL (NEXT.JS)
//
const Booking = models.Booking || model<IBooking>('Booking', BookingSchema);

export default Booking;