import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";
import type { RestraintRecord } from "@/types/restraint";
import { formatDate, formatDuration } from "@/lib/excelParser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  User, 
  FileText, 
  Stethoscope, 
  AlertCircle, 
  Activity,
  ArrowRight
} from "lucide-react";


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
  const [selectedRecord, setSelectedRecord] = useState<RestraintRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRowClick = (record: RestraintRecord) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };


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
                  onClick={() => handleRowClick(r)}
                  className={`
                    border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer group
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


      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl sm:rounded-2xl p-0 overflow-hidden border-none shadow-2xl bg-modal-gradient">
          <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-6">
            <DialogHeader className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-display font-bold text-foreground">
                    Detalhes da Contenção
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    Informações completas do registro selecionado
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {selectedRecord && (
              <div className="space-y-6">
                {/* Patient section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <User className="w-3.5 h-3.5" />
                      Paciente
                    </div>
                    <p className="text-foreground font-medium text-lg capitalize">
                      {selectedRecord.patientName}
                    </p>
                  </div>
                  <div className="bg-muted/40 p-4 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      <Stethoscope className="w-3.5 h-3.5" />
                      Diagnóstico (CID)
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-sm bg-primary/10 text-primary border-none">
                        {selectedRecord.cid}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Status Section */}
                <div className="flex flex-wrap gap-3">
                  {selectedRecord.isChemical ? (
                    <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 px-3 py-1 flex items-center gap-1.5 rounded-lg">
                      <FlaskConical className="w-4 h-4" />
                      Contenção Química
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 px-3 py-1 flex items-center gap-1.5 rounded-lg">
                      <Activity className="w-4 h-4" />
                      Contenção Mecânica
                    </Badge>
                  )}
                  {selectedRecord.medication && (
                    <Badge variant="outline" className="px-3 py-1 flex items-center gap-1.5 rounded-lg border-primary/20 text-primary">
                      <AlertCircle className="w-4 h-4" />
                      {selectedRecord.medication}
                    </Badge>
                  )}
                </div>

                {/* Timeline Section */}
                <div className="bg-muted/20 p-5 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    Cronologia do Evento
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex-1 flex flex-col items-center sm:items-start">
                      <span className="text-xs text-muted-foreground mb-1">Início</span>
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        {formatDate(selectedRecord.startDate)}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="h-px w-20 bg-gradient-to-r from-transparent via-border to-transparent hidden sm:block mb-2"></div>
                      <Badge variant="secondary" className="text-xs py-1 px-3 bg-primary text-primary-foreground font-bold rounded-full">
                        {formatDuration(selectedRecord.durationMinutes)}
                      </Badge>
                    </div>

                    <div className="flex-1 flex flex-col items-center sm:items-end">
                      <span className="text-xs text-muted-foreground mb-1">Término</span>
                      <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Calendar className="w-4 h-4 text-primary/60" />
                        {formatDate(selectedRecord.endDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reason & Notes */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5" />
                      Justificativa / Motivo
                    </div>
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm text-foreground leading-relaxed italic">
                      "{selectedRecord.reason || "Nenhuma justificativa fornecida"}"
                    </div>
                  </div>

                  {selectedRecord.notes && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <Activity className="w-3.5 h-3.5" />
                        Observações Adicionais
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border/50 text-sm text-muted-foreground">
                        {selectedRecord.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
              >
                Fechar Detalhes
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

