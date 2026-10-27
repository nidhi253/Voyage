import { todayISO } from './dates';
import type { Trip, TripStatus } from '../types';

/**
 * The status the traveller should see, worked out from the trip's dates so it stays right without any
 * background job: a trip that has ended is completed, and a confirmed trip is active while it's running.
 * Unconfirmed trips (still "planning") stay planning until they're over.
 */
export function effectiveStatus(
  trip: Pick<Trip, 'status' | 'start_date' | 'end_date'>,
  today: string = todayISO(),
): TripStatus {
  if (trip.end_date < today) return 'completed';
  if (trip.status === 'ready' && trip.start_date <= today) return 'active';
  return trip.status;
}
