// Types for hospital restraint data

export interface RawRestraintRow {
  timestamp?: string;
  patientName: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: string;
  reason: string;
  cid: string;
  cidOther?: string;
  chemicalRestraint: string;
  medication?: string;
  notes?: string;
}

export interface RestraintRecord {
  id: string;
  patientName: string;
  startDate: Date | null;
  endDate: Date | null;
  durationMinutes: number;
  reason: string;
  cid: string;
  isChemical: boolean;
  medication: string;
  notes: string;
  month: string; // "YYYY-MM"
}

export interface DashboardFilters {
  dateStart: string;
  dateEnd: string;
  cid: string;
  type: "all" | "mechanical" | "chemical";
}

export interface KPIData {
  totalRestraints: number;
  distinctPatients: number;
  chemicalRestraints: number;
  avgDuration: { days: number; hours: number; minutes: number };
}

export interface MonthlyData {
  month: string;
  label: string;
  count: number;
}

export interface CIDData {
  cid: string;
  count: number;
}
