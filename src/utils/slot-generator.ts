import { DateTime } from 'luxon';
import { Slot } from './slot.interface';

export function generateSlots(
  availability: { start: string; end: string }[],
  duration: number,
  selectedDate: string,
): Slot[] {
  const slots: Slot[] = [];

  for (const t of availability) {
    let start = DateTime.fromFormat(t.start, 'HH:mm', { zone: 'local' }).set({
      year: Number(selectedDate.split('-')[0]),
      month: Number(selectedDate.split('-')[1]),
      day: Number(selectedDate.split('-')[2]),
    });

    const end = DateTime.fromFormat(t.end, 'HH:mm', { zone: 'local' }).set({
      year: Number(selectedDate.split('-')[0]),
      month: Number(selectedDate.split('-')[1]),
      day: Number(selectedDate.split('-')[2]),
    });

    while (start.plus({ minutes: duration }) <= end) {
      const slotEnd = start.plus({ minutes: duration });

      const label = `${start.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`;

      slots.push({
        label,
        startLocal: start.toISO(),
        endLocal: slotEnd.toISO(),
        startUTC: start.toUTC().toISO(),
        endUTC: slotEnd.toUTC().toISO(),
      });

      start = slotEnd;
    }
  }

  return slots;
}
