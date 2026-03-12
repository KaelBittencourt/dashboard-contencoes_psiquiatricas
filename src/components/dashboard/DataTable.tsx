import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import type { RestraintRecord } from "@/types/restraint";
import { formatDate, formatDuration } from "@/lib/excelParser";

interface DataTableProps {
  records: RestraintRecord[];
}

type SortKey = keyof RestraintRecord;
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export function DataTable({ records }: DataTableProps) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("startDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.cid.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.medication.toLowerCase().includes(q)
    );
  }, [records, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let av = a[sortKey];
      let bv = b[sortKey];
      if (av instanceof Date && bv instanceof Date) {
        return sortDir === "asc" ? av.getTime() - bv.getTime() : bv.getTime() - av.getTime();
      }
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="w-3 h-3 opacity-20" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3 h-3 text-primary" />
    ) : (
      <ChevronDown className="w-3 h-3 text-primary" />
    );
  };

  const columns: { key: SortKey; label: string; width?: string }[] = [
    { key: "patientName", label: "Paciente", width: "w-40" },
    { key: "cid", label: "CID", width: "w-24" },
    { key: "startDate", label: "Início", width: "w-28" },
    { key: "endDate", label: "Término", width: "w-28" },
    { key: "durationMinutes", label: "Duração", width: "w-24" },
    { key: "reason", label: "Motivo", width: "w-48" },
    { key: "isChemical", label: "Química", width: "w-20" },
    { key: "medication", label: "Medicamento", width: "w-44" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-2xl bg-card border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
            Registros Detalhados
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {sorted.length} {sorted.length === 1 ? "registro" : "registros"} encontrados
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar paciente, CID, motivo..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-72"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider
                    cursor-pointer hover:text-foreground transition-colors select-none
                    ${col.width || ""}
                  `}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-muted-foreground text-sm">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              paginated.map((r, i) => (
                <tr
                  key={r.id}
                  className={`
                    border-b border-border/50 hover:bg-muted/30 transition-colors
                    ${i % 2 === 0 ? "" : "bg-muted/10"}
                  `}
                >
                  <td className="px-4 py-3 text-sm font-medium text-foreground truncate max-w-[160px]">
                    {r.patientName}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-muted text-xs font-mono text-muted-foreground">
                      {r.cid}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(r.startDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDate(r.endDate)}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium whitespace-nowrap">
                    {formatDuration(r.durationMinutes)}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[192px]">
                    <span className="truncate block" title={r.reason}>{r.reason || "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.isChemical ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-accent/15 text-accent">
                        <FlaskConical className="w-3 h-3" />
                        Sim
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        Não
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[176px]">
                    <span className="truncate block" title={r.medication}>{r.medication || "—"}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Página {page} de {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const pageNum = totalPages <= 7
              ? i + 1
              : page <= 4
              ? i + 1
              : page >= totalPages - 3
              ? totalPages - 6 + i
              : page - 3 + i;
            return (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                className={`
                  min-w-[28px] h-7 px-2 rounded-lg text-xs font-medium transition-colors
                  ${pageNum === page
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }
                `}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
