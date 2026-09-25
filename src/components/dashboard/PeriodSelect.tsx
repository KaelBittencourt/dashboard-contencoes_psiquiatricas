import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const MONTHS = [
  { value: 1, label: "Janeiro", short: "Jan" },
  { value: 2, label: "Fevereiro", short: "Fev" },
  { value: 3, label: "Março", short: "Mar" },
  { value: 4, label: "Abril", short: "Abr" },
  { value: 5, label: "Maio", short: "Mai" },
  { value: 6, label: "Junho", short: "Jun" },
  { value: 7, label: "Julho", short: "Jul" },
  { value: 8, label: "Agosto", short: "Ago" },
  { value: 9, label: "Setembro", short: "Set" },
  { value: 10, label: "Outubro", short: "Out" },
  { value: 11, label: "Novembro", short: "Nov" },
  { value: 12, label: "Dezembro", short: "Dez" },
];

interface PeriodSelectProps {
  label: string;
  allLabel: string;
  options: { value: number; label: string; short?: string }[];
  selected: number[];
  onChange: (values: number[]) => void;
  className?: string;
}

function selectionLabel(
  selected: number[],
  options: { value: number; label: string; short?: string }[],
  allLabel: string,
) {
  if (selected.length === 0) return allLabel;

  const names = [...selected]
    .sort((a, b) => a - b)
    .map((value) => options.find((option) => option.value === value)?.short ?? String(value));

  if (names.length <= 2) return names.join(", ");
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

function PeriodSelect({ label, allLabel, options, selected, onChange, className }: PeriodSelectProps) {
  const summary = selectionLabel(selected, options, allLabel);

  const toggle = (value: number) => {
    const next = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(next.sort((a, b) => a - b));
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs text-muted-foreground font-medium">{label}</label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 h-[38px] px-3 bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <span className="truncate">{summary}</span>
            <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-52 p-1.5">
          <button
            type="button"
            onClick={() => onChange([])}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-foreground hover:bg-muted"
          >
            <span
              className={cn(
                "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                selected.length === 0
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {selected.length === 0 && <Check className="h-3 w-3" />}
            </span>
            {allLabel}
          </button>
          <div className="my-1 h-px bg-border" />
          <div className="max-h-64 overflow-y-auto">
            {options.map((option) => {
              const checked = selected.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[13px] text-foreground hover:bg-muted"
                >
                  <span
                    className={cn(
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                      checked
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border",
                    )}
                  >
                    {checked && <Check className="h-3 w-3" />}
                  </span>
                  {option.label}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

interface MonthYearFilterProps {
  months: number[];
  years: number[];
  yearOptions: number[];
  onMonthsChange: (months: number[]) => void;
  onYearsChange: (years: number[]) => void;
}

export function MonthYearFilter({
  months,
  years,
  yearOptions,
  onMonthsChange,
  onYearsChange,
}: MonthYearFilterProps) {
  return (
    <>
      <PeriodSelect
        label="Mês"
        allLabel="Todos os meses"
        options={MONTHS}
        selected={months}
        onChange={onMonthsChange}
        className="w-[168px] shrink-0"
      />
      <PeriodSelect
        label="Ano"
        allLabel="Todos os anos"
        options={yearOptions.map((year) => ({ value: year, label: String(year), short: String(year) }))}
        selected={years}
        onChange={onYearsChange}
        className="w-[148px] shrink-0"
      />
    </>
  );
}
