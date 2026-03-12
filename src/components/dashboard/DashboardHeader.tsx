import { motion } from "framer-motion";
import { Calendar, Filter, RotateCcw, Upload } from "lucide-react";
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
      <div className="px-6 py-4">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-none">
                Dashboard de Contenções Hospitalares
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
            <Upload className="w-4 h-4" />
            Nova planilha
          </button>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-end gap-3">
          {/* Date Start */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Data inicial</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={filters.dateStart}
                onChange={(e) => update("dateStart", e.target.value)}
                className="pl-8 pr-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Date End */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Data final</label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => update("dateEnd", e.target.value)}
                className="pl-8 pr-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* CID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">CID</label>
            <select
              value={filters.cid}
              onChange={(e) => update("cid", e.target.value)}
              className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
            >
              <option value="all">Todos os CIDs</option>
              {cidOptions.map((cid) => (
                <option key={cid} value={cid}>{cid}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-muted-foreground font-medium">Tipo</label>
            <select
              value={filters.type}
              onChange={(e) => update("type", e.target.value as DashboardFilters["type"])}
              className="px-3 py-2 bg-card border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px]"
            >
              <option value="all">Todas</option>
              <option value="mechanical">Mecânica</option>
              <option value="chemical">Química</option>
            </select>
          </div>

          {/* Reset filters */}
          <button
            onClick={() =>
              onFilterChange({ dateStart: "", dateEnd: "", cid: "all", type: "all" })
            }
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted border border-border transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Limpar
          </button>
        </div>
      </div>
    </motion.div>
  );
}
