
import { BadRequestException } from '@nestjs/common';

export function getDatesFromOption(
  option: string,
  timezone = 'Asia/Kolkata',
): string[] {
  const today = new Date(
    new Date().toLocaleString('en-US', { timeZone: timezone }),
  );

  const dates: string[] = [];

  switch (option) {
    case 'next_3_days':
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      break;

    case 'next_5_days':
      for (let i = 0; i < 5; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      break;

    case 'this_week': {
      const dayOfWeek = today.getDay(); 
      for (let i = 0; i <= 6 - dayOfWeek; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      break;
    }

    case 'next_week': {
      const startNextWeek = new Date(today);
      startNextWeek.setDate(today.getDate() + (7 - today.getDay())); // Sunday
      for (let i = 0; i < 7; i++) {
        const d = new Date(startNextWeek);
        d.setDate(startNextWeek.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      break;
    }

    case 'next_5_weeks':
      for (let i = 0; i < 35; i++) { 
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split('T')[0]);
      }
      break;

    default:
      throw new BadRequestException('Invalid dateOption');
  }

  return dates;
}
