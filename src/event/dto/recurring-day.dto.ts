export class RecurringDayDto {
  day: string;
  slots: { start: string; end: string }[];
}
