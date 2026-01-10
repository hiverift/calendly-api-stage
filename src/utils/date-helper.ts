
// // import { BadRequestException } from '@nestjs/common';

// // export function getDatesFromOption(
// //   option: string,
// //   timezone = 'Asia/Kolkata',
// // ): string[] {
// //   const today = new Date(
// //     new Date().toLocaleString('en-US', { timeZone: timezone }),
// //   );

// //   const dates: string[] = [];

// //   switch (option) {
// //     case 'next_3_days':
// //       for (let i = 0; i < 3; i++) {
// //         const d = new Date(today);
// //         d.setDate(today.getDate() + i);
// //         dates.push(d.toISOString().split('T')[0]);
// //       }
// //       break;

// //     case 'next_5_days':
// //       for (let i = 0; i < 5; i++) {
// //         const d = new Date(today);
// //         d.setDate(today.getDate() + i);
// //         dates.push(d.toISOString().split('T')[0]);
// //       }
// //       break;

// //     case 'this_week': {
// //       const dayOfWeek = today.getDay(); 
// //       for (let i = 0; i <= 6 - dayOfWeek; i++) {
// //         const d = new Date(today);
// //         d.setDate(today.getDate() + i);
// //         dates.push(d.toISOString().split('T')[0]);
// //       }
// //       break;
// //     }

// //     case 'next_week': {
// //       const startNextWeek = new Date(today);
// //       startNextWeek.setDate(today.getDate() + (7 - today.getDay())); // Sunday
// //       for (let i = 0; i < 7; i++) {
// //         const d = new Date(startNextWeek);
// //         d.setDate(startNextWeek.getDate() + i);
// //         dates.push(d.toISOString().split('T')[0]);
// //       }
// //       break;
// //     }

// //     case 'next_5_weeks':
// //       for (let i = 0; i < 35; i++) { 
// //         const d = new Date(today);
// //         d.setDate(today.getDate() + i);
// //         dates.push(d.toISOString().split('T')[0]);
// //       }
// //       break;

// //     default:
// //       throw new BadRequestException('Invalid dateOption');
// //   }

// //   return dates;
// // }
// import { BadRequestException } from '@nestjs/common';

// /**
//  * Format a Date object to YYYY-MM-DD in the given timezone
//  */
// function formatDateInTZ(date: Date, timezone: string) {
//   return date.toLocaleDateString('en-CA', { timeZone: timezone });
// }

// export function getDatesFromOption(
//   option: string,
//   timezone = 'Asia/Kolkata',
// ): string[] {
//   const today = new Date(
//     new Date().toLocaleString('en-US', { timeZone: timezone }),
//   );

//   const dates: string[] = [];

//   switch (option) {
//     case 'next_3_days':
//       for (let i = 0; i < 3; i++) {
//         const d = new Date(today);
//         d.setDate(today.getDate() + i);
//         dates.push(formatDateInTZ(d, timezone));
//       }
//       break;

//     case 'next_5_days':
//       for (let i = 0; i < 5; i++) {
//         const d = new Date(today);
//         d.setDate(today.getDate() + i);
//         dates.push(formatDateInTZ(d, timezone));
//       }
//       break;

//     case 'this_week': {
//       const dayOfWeek = today.getDay(); 
//       for (let i = 0; i <= 6 - dayOfWeek; i++) {
//         const d = new Date(today);
//         d.setDate(today.getDate() + i);
//         dates.push(formatDateInTZ(d, timezone));
//       }
//       break;
//     }

//     case 'next_week': {
//       const startNextWeek = new Date(today);
//       startNextWeek.setDate(today.getDate() + (7 - today.getDay())); // Sunday
//       for (let i = 0; i < 7; i++) {
//         const d = new Date(startNextWeek);
//         d.setDate(startNextWeek.getDate() + i);
//         dates.push(formatDateInTZ(d, timezone));
//       }
//       break;
//     }

//     case 'next_5_weeks':
//       for (let i = 0; i < 35; i++) { 
//         const d = new Date(today);
//         d.setDate(today.getDate() + i);
//         dates.push(formatDateInTZ(d, timezone));
//       }
//       break;

//     default:
//       throw new BadRequestException('Invalid dateOption');
//   }

//   return dates;
// }
import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

export function getDatesFromOption(

  option: string,
  timezone = 'America/New_York',
): string[] {

  const today = DateTime.now().setZone(timezone).startOf('day'); // Today at 00:00 in timezone
  const dates: string[] = [];

  switch (option) {
    case 'next_3_days':
      for (let i = 0; i < 3; i++) {
        dates.push(today.plus({ days: i }).toISODate()!);
      }
      break;

    case 'next_5_days':
      for (let i = 0; i < 5; i++) {
        dates.push(today.plus({ days: i }).toISODate()!);
      }
      break;

    case 'this_week': {
      const dayOfWeek = today.weekday; // 1 = Monday ... 7 = Sunday
      for (let i = 0; i <= 7 - dayOfWeek; i++) {
        dates.push(today.plus({ days: i }).toISODate()!);
      }
      break;
    }

    case 'next_week': {
      const startNextWeek = today.plus({ days: 7 - today.weekday + 1 }); // Start Monday next week
      for (let i = 0; i < 7; i++) {
        dates.push(startNextWeek.plus({ days: i }).toISODate()!);
      }
      break;
    }

    case 'next_5_weeks':
      for (let i = 0; i < 35; i++) {
        dates.push(today.plus({ days: i }).toISODate()!);
      }
      break;

    default:
      return [];
  }

  return dates;
}
