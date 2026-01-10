
export interface Slot {

  label: string;
  start: string;  // required
  end: string;

  // e.g., "9:00 AM - 9:30 AM"
  startLocal: string; 
  endLocal: string;   
  startUTC: string;   
  endUTC: string;     
}
