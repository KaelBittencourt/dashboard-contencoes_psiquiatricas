import { motion } from "framer-motion";
import { Calendar, Filter, RotateCcw, RefreshCw } from "lucide-react";
import type { DashboardFilters } from "@/types/restraint";

interface DashboardHeaderProps {
  filters: DashboardFilters;
  onFilterChange: (filters: DashboardFilters) => void;
  cidOptions: string[];
  totalRecords: number;
  onReset: () => void;
}

export function DashboardHeader({
  filters,
  onFilterChange,
  cidOptions,
  totalRecords,
  onReset,
}: DashboardHeaderProps) {
  const update = (key: keyof DashboardFilters, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm"
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

          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar dados
          </button>
        </div>

        {/* Filters row */}
        <div className="flex items-end gap-2.5 w-full">
          {/* Date Start */}
          <div className="flex flex-col gap-1 w-[135px] shrink-0">
            <label className="text-xs text-muted-foreground font-medium">Data inicial</label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateStart}
                onChange={(e) => update("dateStart", e.target.value)}
                className="w-full pl-3 pr-8 py-2 h-[38px] bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

          {/* Date End */}
          <div className="flex flex-col gap-1 w-[135px] shrink-0">
            <label className="text-xs text-muted-foreground font-medium">Data final</label>
            <div className="relative">
              <input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => update("dateEnd", e.target.value)}
                className="w-full pl-3 pr-8 py-2 h-[38px] bg-card border border-border rounded-xl text-[13px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary relative [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:z-10"
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white pointer-events-none" />
            </div>
          </div>

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
              onFilterChange({ dateStart: "2022-08-01", dateEnd: "", cid: "all", type: "all" })
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
