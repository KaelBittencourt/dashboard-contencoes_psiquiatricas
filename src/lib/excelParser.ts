import * as XLSX from "xlsx";
import type { RawRestraintRow, RestraintRecord } from "@/types/restraint";

// Column name mappings (handles variations)
const COL_MAP = {
  patientName: ["nome do paciente"],
  startDate: ["data do inicio da contenção:", "data do inicio da contenção", "data de início"],
  startTime: ["hora do inicio da contenção:", "hora do inicio da contenção", "hora de início"],
  endDate: ["data da descontenção:", "data da descontenção", "data de término"],
  endTime: ["hora da descontenção", "hora de término"],
  duration: ["tempo de contenção"],
  reason: ["motivo da contenção:", "motivo da contenção"],
  cid: ["cid do paciente"],
  cidOther: ["se outros"],
  chemicalRestraint: ["realizado contenção quimica?", "realizado contenção química?"],
  medication: ["se sim, qual medicamento utilizado?"],
  notes: ["se outros:"],
};

function normalizeKey(key: string): string {
  return key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function findColumn(headers: string[], aliases: string[]): number {
  const normalizedHeaders = headers.map(normalizeKey);
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    const idx = normalizedHeaders.findIndex((h) => h.includes(normalizedAlias) || normalizedAlias.includes(h));
    if (idx !== -1) return idx;
  }
  return -1;
}

function parseExcelDate(value: unknown): Date | null {
  if (!value) return null;

  if (typeof value === "number") {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d);
    }
  }

  if (typeof value === "string") {
    // Try various formats
    const str = value.trim();
    // MM/DD/YY or MM/DD/YYYY
    const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slashMatch) {
      const [, m, d, y] = slashMatch;
      const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
      return new Date(year, parseInt(m) - 1, parseInt(d));
    }
    // DD/MM/YYYY
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, d, m, y] = brMatch;
      const year = parseInt(y);
      // Heuristic: if day > 12, it's DD/MM, else ambiguous - try context
      if (parseInt(d) > 12) {
        return new Date(year, parseInt(m) - 1, parseInt(d));
      }
      // For ambiguous, assume MM/DD/YYYY format from US Excel
      return new Date(year, parseInt(m) - 1, parseInt(d));
    }
    const d = new Date(str);
    if (!isNaN(d.getTime())) return d;
  }

  if (value instanceof Date) return value;

  return null;
}

function parseTimeString(value: unknown): { hours: number; minutes: number } {
  if (!value) return { hours: 0, minutes: 0 };

  if (typeof value === "number") {
    // Excel time fraction
    const totalMinutes = Math.round(value * 24 * 60);
    return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
  }

  if (typeof value === "string") {
    const match = value.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      return { hours: parseInt(match[1]), minutes: parseInt(match[2]) };
    }
  }

  return { hours: 0, minutes: 0 };
}

function combineDateAndTime(date: Date | null, timeStr: unknown): Date | null {
  if (!date) return null;
  const { hours, minutes } = parseTimeString(timeStr);
  const combined = new Date(date);
  combined.setHours(hours, minutes, 0, 0);
  return combined;
}

function parseDuration(value: unknown): number {
  // Returns minutes
  if (typeof value === "number") {
    // Excel time fraction (e.g., 0.5 = 12h)
    return Math.round(value * 24 * 60);
  }
  if (typeof value === "string") {
    // HH:MM:SS or HH:MM
    const parts = value.split(":").map(Number);
    if (parts.length >= 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
  }
  return 0;
}

function getMonthLabel(date: Date): string {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[date.getMonth()]}/${date.getFullYear().toString().slice(2)}`;
}

export function parseExcelFile(file: File): Promise<RestraintRecord[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array", cellDates: false });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        if (jsonData.length < 2) {
          reject(new Error("Planilha vazia ou sem dados"));
          return;
        }

        // Find header row (skip rows until we find the one with patient name)
        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(5, jsonData.length); i++) {
          const row = jsonData[i] as string[];
          const hasPatient = row.some(
            (cell) => typeof cell === "string" && normalizeKey(cell).includes("nome do paciente")
          );
          if (hasPatient) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = (jsonData[headerRowIdx] as string[]).map((h) => (h ? String(h) : ""));

        // Find column indices
        const colIdx = {
          patientName: findColumn(headers, COL_MAP.patientName),
          startDate: findColumn(headers, COL_MAP.startDate),
          startTime: findColumn(headers, COL_MAP.startTime),
          endDate: findColumn(headers, COL_MAP.endDate),
          endTime: findColumn(headers, COL_MAP.endTime),
          duration: findColumn(headers, COL_MAP.duration),
          reason: findColumn(headers, COL_MAP.reason),
          cid: findColumn(headers, COL_MAP.cid),
          cidOther: findColumn(headers, COL_MAP.cidOther),
          chemicalRestraint: findColumn(headers, COL_MAP.chemicalRestraint),
          medication: findColumn(headers, COL_MAP.medication),
          notes: findColumn(headers, COL_MAP.notes),
        };

        const records: RestraintRecord[] = [];

        for (let i = headerRowIdx + 1; i < jsonData.length; i++) {
          const row = jsonData[i] as unknown[];
          if (!row || row.length === 0) continue;

          const patientName = colIdx.patientName >= 0 ? String(row[colIdx.patientName] || "").trim() : "";
          if (!patientName) continue;

          const startDateRaw = colIdx.startDate >= 0 ? row[colIdx.startDate] : null;
          const startTimeRaw = colIdx.startTime >= 0 ? row[colIdx.startTime] : null;
          const endDateRaw = colIdx.endDate >= 0 ? row[colIdx.endDate] : null;
          const endTimeRaw = colIdx.endTime >= 0 ? row[colIdx.endTime] : null;
          const durationRaw = colIdx.duration >= 0 ? row[colIdx.duration] : null;

          const startDateParsed = parseExcelDate(startDateRaw);
          const endDateParsed = parseExcelDate(endDateRaw);

          const startDateTime = combineDateAndTime(startDateParsed, startTimeRaw);
          const endDateTime = combineDateAndTime(endDateParsed, endTimeRaw);

          // Calculate duration
          let durationMinutes = 0;
          if (startDateTime && endDateTime && endDateTime > startDateTime) {
            durationMinutes = Math.round((endDateTime.getTime() - startDateTime.getTime()) / 60000);
          } else if (durationRaw) {
            durationMinutes = parseDuration(durationRaw);
          }

          const cidValue = colIdx.cid >= 0 ? String(row[colIdx.cid] || "").trim() : "";
          const cidOther = colIdx.cidOther >= 0 ? String(row[colIdx.cidOther] || "").trim() : "";
          const cid = cidValue || cidOther || "N/I";

          const chemicalRaw = colIdx.chemicalRestraint >= 0 ? String(row[colIdx.chemicalRestraint] || "").trim() : "";
          const isChemical = chemicalRaw.toLowerCase().startsWith("sim");

          const medication = colIdx.medication >= 0 ? String(row[colIdx.medication] || "").trim() : "";
          const reason = colIdx.reason >= 0 ? String(row[colIdx.reason] || "").trim() : "";
          const notes = colIdx.notes >= 0 ? String(row[colIdx.notes] || "").trim() : "";

          const monthKey = startDateTime
            ? `${startDateTime.getFullYear()}-${String(startDateTime.getMonth() + 1).padStart(2, "0")}`
            : "unknown";

          records.push({
            id: `${i}-${patientName}`,
            patientName,
            startDate: startDateTime,
            endDate: endDateTime,
            durationMinutes,
            reason,
            cid: cid.toUpperCase(),
            isChemical,
            medication,
            notes,
            month: monthKey,
          });
        }

        resolve(records);
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("Erro ao ler o arquivo"));
    reader.readAsArrayBuffer(file);
  });
}

export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return "—";
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}min`);
  return parts.join(" ") || "< 1min";
}

export function formatDurationFull(totalMinutes: number): string {
  if (totalMinutes <= 0) return "—";
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);
  if (hours > 0) parts.push(`${hours}h`);
  parts.push(`${minutes}min`);
  return parts.join(" ");
}

export function formatDate(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleDateString("pt-BR");
}

export function getMonthlyData(records: RestraintRecord[]) {
  const monthMap = new Map<string, { label: string; count: number }>();

  records.forEach((r) => {
    if (!r.startDate) return;
    const key = r.month;
    const label = getMonthLabel(r.startDate);
    if (!monthMap.has(key)) {
      monthMap.set(key, { label, count: 0 });
    }
    monthMap.get(key)!.count++;
  });

  return Array.from(monthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, { label, count }]) => ({ month, label, count }));
}

export function getCIDData(records: RestraintRecord[]) {
  const cidMap = new Map<string, number>();

  records.forEach((r) => {
    const cid = r.cid || "N/I";
    cidMap.set(cid, (cidMap.get(cid) || 0) + 1);
  });

  return Array.from(cidMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 12)
    .map(([cid, count]) => ({ cid, count }));
}

export function getKPIs(records: RestraintRecord[]) {
  const totalRestraints = records.length;
  const distinctPatients = new Set(records.map((r) => r.patientName.toLowerCase().trim())).size;
  const chemicalRestraints = records.filter((r) => r.isChemical).length;

  const validDurations = records.filter((r) => r.durationMinutes > 0);
  const avgMinutes =
    validDurations.length > 0
      ? Math.round(validDurations.reduce((sum, r) => sum + r.durationMinutes, 0) / validDurations.length)
      : 0;

  const days = Math.floor(avgMinutes / (60 * 24));
  const hours = Math.floor((avgMinutes % (60 * 24)) / 60);
  const minutes = avgMinutes % 60;

  return {
    totalRestraints,
    distinctPatients,
    chemicalRestraints,
    avgDuration: { days, hours, minutes },
  };
}

export function filterRecords(
  records: RestraintRecord[],
  filters: { dateStart: string; dateEnd: string; cid: string; type: string }
): RestraintRecord[] {
  return records.filter((r) => {
    // Date filter
    if (filters.dateStart && r.startDate) {
      const start = new Date(filters.dateStart);
      if (r.startDate < start) return false;
    }
    if (filters.dateEnd && r.startDate) {
      const end = new Date(filters.dateEnd);
      end.setHours(23, 59, 59);
      if (r.startDate > end) return false;
    }

    // CID filter
    if (filters.cid && filters.cid !== "all") {
      if (r.cid !== filters.cid) return false;
    }

    // Type filter
    if (filters.type === "chemical" && !r.isChemical) return false;
    if (filters.type === "mechanical" && r.isChemical) return false;

    return true;
  });
}
