export function getDayFromDate(
 date: string | Date,
  timezone = 'Asia/Kolkata',
): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: timezone,
  });
}
