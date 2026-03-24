import { useState, useMemo } from "react";
import { Activity, Users, FlaskConical, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { RestraintRecord, DashboardFilters } from "@/types/restraint";
import { filterRecords, getKPIs, getMonthlyData, getCIDData } from "@/lib/excelParser";
import { DashboardHeader } from "./DashboardHeader";
import { KPICard } from "./KPICard";
import { MonthlyChart, CIDChart, ChemicalPieChart } from "./Charts";
import { DataTable } from "./DataTable";

interface DashboardProps {
  records: RestraintRecord[];
  fileName: string;
  onReset: () => void;
}

export function Dashboard({ records, fileName, onReset }: DashboardProps) {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateStart: "2022-08-01",
    dateEnd: "",
    cid: "all",
    type: "all",
  });

  const cidOptions = useMemo(() => {
    const unique = new Set(records.map((r) => r.cid));
    return Array.from(unique).sort();
  }, [records]);

  const filtered = useMemo(() => filterRecords(records, filters), [records, filters]);

  const kpis = useMemo(() => getKPIs(filtered), [filtered]);
  const monthlyData = useMemo(() => getMonthlyData(filtered), [filtered]);
  const cidData = useMemo(() => getCIDData(filtered), [filtered]);

  const avgDurationStr = useMemo(() => {
    const { days, hours, minutes } = kpis.avgDuration;
    const parts: string[] = [];
    if (days > 0) parts.push(`${days} ${days === 1 ? "dia" : "dias"}`);
    if (hours > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}min`);
    return parts.join(" ") || "—";
  }, [kpis.avgDuration]);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        filters={filters}
        onFilterChange={setFilters}
        cidOptions={cidOptions}
        totalRecords={records.length}
        onReset={onReset}
      />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 xl:px-16 py-6 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total de Contenções"
            value={kpis.totalRestraints}
            subtitle={`${records.length} no total`}
            icon={Activity}
            color="blue"
            index={0}
          />
          <KPICard
            title="Pacientes Distintos"
            value={kpis.distinctPatients}
            subtitle="Pacientes únicos"
            icon={Users}
            color="teal"
            index={1}
          />
          <KPICard
            title="Contenções Químicas"
            value={kpis.chemicalRestraints}
            subtitle={`${kpis.totalRestraints > 0 ? Math.round((kpis.chemicalRestraints / kpis.totalRestraints) * 100) : 0}% do total`}
            icon={FlaskConical}
            color="orange"
            index={2}
          />
          <KPICard
            title="Tempo Médio"
            value={avgDurationStr}
            subtitle="Duração média por contenção"
            icon={Clock}
            color="purple"
            index={3}
          />
        </div>

        {/* Monthly chart — full width */}
        <MonthlyChart data={monthlyData} />

        {/* CID chart + Pie chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <CIDChart data={cidData} />
          <ChemicalPieChart records={filtered} />
        </div>

        {/* Data table */}
        <DataTable records={filtered} />
      </div>
    </div>
  );
}
