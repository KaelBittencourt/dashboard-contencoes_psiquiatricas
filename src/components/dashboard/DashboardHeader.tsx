import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Calendar, Filter, RotateCcw, RefreshCw, ChevronDown, FileText, Image as ImageIcon, Printer, Download, Moon, Sun } from "lucide-react";
import type { DashboardFilters } from "@/types/restraint";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MonthYearFilter } from "./PeriodSelect";


interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  cidOptions: string[];
  yearOptions: number[];
  totalRecords: number;
  onReset: () => void;
  onExport: (type: 'pdf' | 'img') => void;
  isExporting?: boolean;
}

export function DashboardHeader({
  filters,
  onFilterChange,
  cidOptions,
  yearOptions,
  totalRecords,
  onReset,
  onExport,
  isExporting = false,
}: DashboardHeaderProps) {
  const update = <K extends keyof DashboardFilters>(key: K, value: DashboardFilters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const { resolvedTheme, setTheme } = useTheme();
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    setThemeReady(true);
  }, []);

  const isDark = themeReady && resolvedTheme === "dark";

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm print:hidden"
    >
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 xl:px-16 py-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-none">
                Dashboard de Contenções Psiquiatricas
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                {totalRecords} {totalRecords === 1 ? "registro" : "registros"} carregados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              title={isDark ? "Modo claro" : "Modo escuro"}
              className="flex items-center justify-center w-[38px] h-[38px] rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSfDL4r2FkYL5eDeZ-dRzxTpsORCLWvWE5Aogk_w-14vQ2ua2g/viewform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary bg-primary/10 hover:bg-primary/20 border border-primary/20 transition-all font-medium"
            >
              Preencher Formulário
            </a>
            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Recarregar dados
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isExporting}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {isExporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  {isExporting ? "Exportando..." : "Exportar"}
                  <ChevronDown className="w-4 h-4 opacity-70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onExport('pdf')} className="cursor-pointer gap-2">
                  <FileText className="w-4 h-4" />
                  <span>Exportar como PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport('img')} className="cursor-pointer gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Exportar como Imagem</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-end gap-2.5 w-full">
          <MonthYearFilter
            months={filters.months}
            years={filters.years}
            yearOptions={yearOptions}
            onMonthsChange={(months) => update("months", months)}
            onYearsChange={(years) => update("years", years)}
          />


          {/* CID */}
          <div className="flex flex-col gap-1 flex-1 min-w-[100px] max-w-[200px]">
            <label className="text-xs text-muted-foreground font-medium truncate">CID</label>
            <select
              value={filters.cid}
              onChange={(e) => update("cid", e.target.value)}
              className="w-full px-3 py-2 h-[38px] bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary truncate"
            >
              <option value="all">Todos os CIDs</option>
              {cidOptions.map((cid) => (
                <option key={cid} value={cid}>{cid}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1 w-[120px] shrink-0">
            <label className="text-xs text-muted-foreground font-medium">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => update("type", e.target.value as DashboardFilters["type"])}
              className="w-full px-2 py-2 h-[38px] bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Todas</option>
              <option value="mechanical">Mecânica</option>
              <option value="chemical">Química</option>
            </select>
          </div>

          {/* Reset filters */}
          <button
            onClick={() =>
              onFilterChange({
                months: [],
                years: yearOptions[0] ? [yearOptions[0]] : [],
                cid: "all",
                type: "all",
              })
            }
            className="h-[38px] shrink-0 whitespace-nowrap flex items-center gap-1.5 px-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
