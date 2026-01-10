// // export function getDayFromDate(
// //  date: string | Date,
// //   timezone = 'Asia/Kolkata',
// // ): string {
// //   return new Date(date).toLocaleDateString('en-US', {
// //     weekday: 'long',
// //     timeZone: timezone,
// //   });
// // }
// // import { DateTime } from 'luxon';

// // export function getDayFromDate(
// //   date: string | Date,
// //   timezone = 'Asia/Kolkata',
// // ): string {
// //   return DateTime.fromJSDate(new Date(date))
// //     .setZone(timezone)
// //     .toFormat('cccc'); // 'Monday', 'Tuesday', etc.
// // }
// import { DateTime } from 'luxon';

// export function getDayFromDate(
//   date: string | Date,
//   timezone = 'Asia/Kolkata',
// ): string {
//   let dt: DateTime;

//   if (typeof date === 'string') {
//     dt = DateTime.fromISO(date, { zone: timezone });
//   } else {
//     dt = DateTime.fromJSDate(date).setZone(timezone);
//   }

//   return dt.toFormat('cccc'); // Returns 'Monday', 'Tuesday', etc.
// }

import { DateTime } from 'luxon';

/**
 * Returns the day of the week for a date in a given timezone
 * Example: 'Monday', 'Tuesday', etc.
 */
export function getDayFromDate(
  date: string | Date,
  timezone = 'Asia/Kolkata',
): string {
  let dt: DateTime;

  if (typeof date === 'string') {
    dt = DateTime.fromISO(date, { zone: timezone });
  } else {
    dt = DateTime.fromJSDate(date).setZone(timezone);
  }

  return dt.toFormat('cccc'); // 'Monday', 'Tuesday', etc.
}
