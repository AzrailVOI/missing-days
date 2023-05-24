import { endOfWeek, startOfWeek } from 'date-fns'
export function getStartOfWeek(date: Date): Date {
  // const startOfWeek = new Date(date.getTime());
  // const dayIndex = (startOfWeek.getDay() + 3) % 7; // Коррекция индекса для начала с понедельника
  // startOfWeek.setDate(startOfWeek.getDate() - dayIndex);
  // startOfWeek.setHours(0, 0, 0, 0);
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getEndOfWeek(date: Date): Date {
  // const endOfWeek = new Date(date.getTime());
  // endOfWeek.setDate(endOfWeek.getDate() + (10 - endOfWeek.getDay()));
  // endOfWeek.setHours(23, 59, 59, 999);
  return endOfWeek(date, { weekStartsOn: 1 });
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth()+1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function formatDateWS(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
export function formatDateEmail(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth()+1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function isSameDay(date1: Date, date2: Date): boolean {
  return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
  );
}