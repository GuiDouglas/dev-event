import { Schema, model, models } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: Date;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: { type: String, required: true, trim: true, maxlength: 1000 },

    overview: { type: String, required: true, trim: true, maxlength: 500 },

    image: { type: String, required: true, trim: true },

    venue: { type: String, required: true, trim: true },

    location: { type: String, required: true, trim: true },

    date: { type: Date, required: true },

    time: {
      type: String,
      required: true,
      validate: {
        validator: (v: string) => /^([01]\d|2[0-3]):([0-5]\d)$/.test(v),
        message: 'Time must be HH:MM',
      },
    },

    mode: {
      type: String,
      required: true,
      enum: ['online', 'offline', 'hybrid'],
    },

    audience: { type: String, required: true, trim: true },

    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one agenda item is required',
      },
    },

    organizer: { type: String, required: true, trim: true },

    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: 'At least one tag is required',
      },
    },
  },
  { timestamps: true }
);

//
// 🔥 HOOK SEM TIPAGEM ERRADA
//
EventSchema.pre('save', function () {
  // deixa o mongoose inferir corretamente
  const event = this;

  if (event.isModified('title') || event.isNew) {
    event.slug = generateSlug(event.title);
  }

  if (!(event.date instanceof Date) || isNaN(event.date.getTime())) {
    throw new Error('Invalid date');
  }

  if (event.time) {
    event.time = normalizeTime(event.time);
  }
});

//
// helpers
//
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeTime(timeString: string): string {
  const timeRegex = /^(\d{1,2}):(\d{2})(\s*(AM|PM))?$/i;
  const match = timeString.trim().match(timeRegex);

  if (!match) throw new Error('Invalid time format');

  let hours = parseInt(match[1]);
  const minutes = match[2];
  const period = match[4]?.toUpperCase();

  if (period) {
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
  }

  if (hours > 23 || parseInt(minutes) > 59) {
    throw new Error('Invalid time values');
  }

  return `${hours.toString().padStart(2, '0')}:${minutes}`;
}

EventSchema.index({ slug: 1 }, { unique: true });
EventSchema.index({ date: 1, mode: 1 });

const Event = models.Event || model<IEvent>('Event', EventSchema);

export default Event;