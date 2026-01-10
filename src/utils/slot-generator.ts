// // // import { DateTime } from 'luxon';
// // // import { Slot } from './slot.interface';

// // // export function generateSlots(
// // //   availability: { start: string; end: string }[],
// // //   duration: number,
// // //   selectedDate: string,
// // // ): Slot[] {
// // //   const slots: Slot[] = [];

// // //   for (const t of availability) {
// // //     let start = DateTime.fromFormat(t.start, 'HH:mm', { zone: 'local' }).set({
// // //       year: Number(selectedDate.split('-')[0]),
// // //       month: Number(selectedDate.split('-')[1]),
// // //       day: Number(selectedDate.split('-')[2]),
// // //     });

// // //     const end = DateTime.fromFormat(t.end, 'HH:mm', { zone: 'local' }).set({
// // //       year: Number(selectedDate.split('-')[0]),
// // //       month: Number(selectedDate.split('-')[1]),
// // //       day: Number(selectedDate.split('-')[2]),
// // //     });

// // //     while (start.plus({ minutes: duration }) <= end) {
// // //       const slotEnd = start.plus({ minutes: duration });

// // //       const label = `${start.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`;

// // //       slots.push({
// // //         label,
// // //         startLocal: start.toISO(),
// // //         endLocal: slotEnd.toISO(),
// // //         startUTC: start.toUTC().toISO(),
// // //         endUTC: slotEnd.toUTC().toISO(),
// // //       });

// // //       start = slotEnd;
// // //     }
// // //   }

// // //   return slots;
// // // }
// // import { DateTime } from 'luxon';
// // import { Slot } from './slot.interface';

// // export function generateSlots(
// //   availability: { start: string; end: string }[],
// //   duration: number,
// //   selectedDate: string,
// //   timezone = 'Asia/Kolkata', // dynamic timezone
// // ): Slot[] {
// //   const slots: Slot[] = [];

// //   for (const t of availability) {
// //     let start = DateTime.fromISO(`${selectedDate}T${t.start}`, { zone: timezone });
// //     const end = DateTime.fromISO(`${selectedDate}T${t.end}`, { zone: timezone });

// //     while (start.plus({ minutes: duration }) <= end) {
// //       const slotEnd = start.plus({ minutes: duration });
// //       const label = `${start.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`;

// //       slots.push({
// //         label,
// //         start: start.toISO(),       // required by Slot interface
// //         end: slotEnd.toISO(),       // required by Slot interface
// //         startLocal: start.toISO(),
// //         endLocal: slotEnd.toISO(),
// //         startUTC: start.toUTC().toISO(),
// //         endUTC: slotEnd.toUTC().toISO(),
// //       });

// //       start = slotEnd;
// //     }
// //   }

// //   return slots;
// // }
// import { DateTime } from 'luxon';

// export function generateSlots(
//   windows: { start: string; end: string }[],
//   duration: number,
//   date: string,
//   timezone: string,
// ) {
//   const slots: { label: string }[] = [];
//   const nowInTZ = DateTime.now().setZone(timezone);

//   for (const w of windows) {
//     let start = DateTime.fromISO(`${date}T${w.start}`, { zone: timezone });
//     const end = DateTime.fromISO(`${date}T${w.end}`, { zone: timezone });

//     while (start.plus({ minutes: duration }) <= end) {

//       // Skip past slots ONLY if same date
//       if (
//         start.toISODate() === nowInTZ.toISODate() &&
//         start <= nowInTZ
//       ) {
//         start = start.plus({ minutes: duration });
//         continue;
//       }

//       const slotEnd = start.plus({ minutes: duration });

//       slots.push({
//         label: `${start.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`,
//       });

//       start = slotEnd;
//     }
//   }

//   return slots;
// }

import { DateTime } from 'luxon';

interface TimeRange {
  start: string;
  end: string;
}

interface Slot {
  start: string;
  end: string;
  label: string;
}

/**
 * Generate time slots for a given date and duration
 */
export function generateSlots(
  ranges: TimeRange[],
  duration: number,
  date: string,
  timezone: string
): Slot[] {
  const slots: Slot[] = [];

  ranges.forEach(({ start, end }) => {
    let startDT = DateTime.fromISO(`${date}T${start}`, { zone: timezone });
    const endDT = DateTime.fromISO(`${date}T${end}`, { zone: timezone });

    while (startDT < endDT) {
      const slotEnd = startDT.plus({ minutes: duration });
      if (slotEnd > endDT) break; // prevent overflow

      slots.push({
        start: startDT.toFormat('HH:mm'),
        end: slotEnd.toFormat('HH:mm'),
        label: `${startDT.toFormat('hh:mm a')} - ${slotEnd.toFormat('hh:mm a')}`,
      });

      startDT = slotEnd;
    }
  });

  return slots;
}
