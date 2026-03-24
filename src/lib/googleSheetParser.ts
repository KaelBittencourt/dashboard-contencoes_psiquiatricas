import * as XLSX from "xlsx";
import type { RestraintRecord } from "@/types/restraint";

// Google Sheets public spreadsheet ID
const SHEET_ID = "1yP8XVNCX0G_KXoQIxfXSj9gaBGyIyWy-j6rQ3GQnuqI";

// Export as XLSX for full XLSX parsing compatibility
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;

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
    const date = XLSX.SSF.parse_date_code(value);
    if (date) {
      return new Date(date.y, date.m - 1, date.d);
    }
  }

  if (typeof value === "string") {
    const str = value.trim();
    const slashMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (slashMatch) {
      const [, m, d, y] = slashMatch;
      const year = y.length === 2 ? 2000 + parseInt(y) : parseInt(y);
      return new Date(year, parseInt(m) - 1, parseInt(d));
    }
    const brMatch = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (brMatch) {
      const [, d, m, y] = brMatch;
      const year = parseInt(y);
      if (parseInt(d) > 12) {
        return new Date(year, parseInt(m) - 1, parseInt(d));
      }
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
  if (typeof value === "number") {
    return Math.round(value * 24 * 60);
  }
  if (typeof value === "string") {
    const parts = value.split(":").map(Number);
    if (parts.length >= 2) {
      return (parts[0] || 0) * 60 + (parts[1] || 0);
    }
  }
  return 0;
}

function parseWorkbookData(data: ArrayBuffer): RestraintRecord[] {
  const workbook = XLSX.read(new Uint8Array(data), { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

  if (jsonData.length < 2) {
    throw new Error("Planilha vazia ou sem dados");
  }

  // Find header row
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

  return records;
}

export async function fetchGoogleSheetData(): Promise<RestraintRecord[]> {
  const response = await fetch(EXPORT_URL);

  if (!response.ok) {
    throw new Error(`Erro ao acessar a planilha do Google Sheets (HTTP ${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const records = parseWorkbookData(arrayBuffer);

  if (records.length === 0) {
    throw new Error("Nenhum dado encontrado na planilha. Verifique se a planilha contém dados válidos.");
  }

  return records;
}
