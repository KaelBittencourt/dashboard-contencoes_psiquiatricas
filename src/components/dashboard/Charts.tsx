import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  AreaChart, Area
} from "recharts";
import type { MonthlyData, CIDData, RestraintRecord } from "@/types/restraint";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  index?: number;
}

function ChartCard({ title, children, index = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
      className="p-5 rounded-2xl bg-card border border-border"
    >
      <h3 className="font-display text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

const COLORS = [
  "hsl(210, 100%, 56%)",
  "hsl(172, 66%, 50%)",
  "hsl(28, 100%, 55%)",
  "hsl(265, 85%, 65%)",
  "hsl(350, 80%, 60%)",
  "hsl(142, 70%, 50%)",
  "hsl(190, 80%, 50%)",
  "hsl(45, 90%, 55%)",
  "hsl(300, 60%, 60%)",
  "hsl(160, 60%, 50%)",
  "hsl(240, 70%, 65%)",
  "hsl(15, 85%, 60%)",
];

const tooltipStyle = {
  backgroundColor: "hsl(220, 18%, 12%)",
  border: "1px solid hsl(220, 15%, 22%)",
  borderRadius: "12px",
  color: "hsl(213, 31%, 91%)",
  fontSize: "13px",
};

const tooltipLabelStyle = {
  color: "hsl(213, 31%, 91%)",
  fontWeight: 600,
  marginBottom: "4px",
};

const tooltipItemStyle = {
  color: "hsl(213, 20%, 70%)",
};

interface MonthlyChartProps {
  data: MonthlyData[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const maxMonth = data.length > 0 ? data.reduce((max, d) => d.count > max.count ? d : max, data[0]) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="p-6 rounded-2xl bg-card border border-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
          Evolução Mensal
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          Linha do Tempo
        </span>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full flex flex-col min-h-[220px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 16%)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
              />
              <YAxis
                tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickMargin={12}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                labelStyle={tooltipLabelStyle}
                itemStyle={tooltipItemStyle}
                cursor={{ stroke: "hsl(220, 15%, 26%)", strokeWidth: 1, strokeDasharray: "4 4" }}
                formatter={(v: number) => [v, "Contenções"]}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="hsl(210, 100%, 56%)"
                fill="url(#colorCount)"
                strokeWidth={3}
                activeDot={{ r: 6, fill: "hsl(210, 100%, 56%)", stroke: "hsl(222, 47%, 11%)", strokeWidth: 4 }}
                name="Contenções"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Nenhum dado encontrado
          </div>
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Total no período: <span className="text-foreground font-medium">{totalCount}</span>
        </span>
        {maxMonth && (
          <span className="text-xs text-muted-foreground">
            Pico de registros:{" "}
            <span className="text-primary font-medium">{maxMonth.label} ({maxMonth.count})</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface CIDChartProps {
  data: CIDData[];
}

export function CIDChart({ data }: CIDChartProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const maxCount = data.length > 0 ? Math.max(...data.map(d => d.count)) : 1;
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 rounded-2xl bg-card border border-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
          Distribuição por CID
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          {data.length} {data.length === 1 ? "código" : "códigos"}
        </span>
      </div>

      {/* Chart (Modern Ranked List) */}
      <div className="flex-1 w-full flex flex-col min-h-[220px]">
        {sortedData.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-[240px] overflow-y-auto scrollbar-thin pr-1 pb-1">
            {sortedData.map((item, index) => {
              const color = COLORS[index % COLORS.length];
              const percentage = Math.max((item.count / maxCount) * 100, 2); // At least 2% for visibility

              return (
                <div key={item.cid} className="relative h-[36px] shrink-0 flex items-center justify-between px-3 group rounded-lg overflow-hidden border border-transparent hover:border-border/40 transition-colors">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.04, ease: "easeOut" }}
                    className="absolute left-0 top-0 h-full origin-left"
                    style={{ backgroundColor: color, opacity: 0.15 }}
                  />

                  <div className="relative z-10 flex items-center gap-3">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                    <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground transition-colors truncate max-w-[140px] xl:max-w-[200px]">
                      {item.cid}
                    </span>
                  </div>

                  <div className="relative z-10 flex items-center gap-2">
                    <span className="text-[14px] font-display font-bold text-foreground">
                      {item.count}
                    </span>
                    <span className="text-[11px] text-muted-foreground w-8 text-right font-medium">
                      {Math.round((item.count / totalCount) * 100)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-1 text-muted-foreground text-sm">
            Nenhum dado encontrado
          </div>
        )}
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Total de registros: <span className="text-foreground font-medium">{totalCount}</span>
        </span>
        {sortedData.length > 0 && (
          <span className="text-xs text-muted-foreground">
            Líder:{" "}
            <span className="text-primary font-medium">{sortedData[0].cid}</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

interface ChemicalPieChartProps {
  records: RestraintRecord[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ChemicalPieChart({ records }: ChemicalPieChartProps) {
  const chemical = records.filter((r) => r.isChemical).length;
  const mechanical = records.length - chemical;
  const total = chemical + mechanical;

  const data = [
    { name: "Contenção Química", value: chemical, color: "hsl(172, 66%, 50%)", grad: "pieGrad0" },
    { name: "Contenção Mecânica", value: mechanical, color: "hsl(210, 100%, 56%)", grad: "pieGrad1" },
  ].filter((d) => d.value > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="p-6 rounded-2xl bg-card border border-border flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-display text-sm font-semibold text-foreground uppercase tracking-wide">
          Química vs Mecânica
        </h3>
        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
          Geral
        </span>
      </div>

      {/* Chart Area */}
      <div className="flex-1 flex flex-col justify-center items-center min-h-[220px]">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <defs>
              <linearGradient id="pieGrad0" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(172, 66%, 50%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="pieGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="hsl(210, 100%, 56%)" stopOpacity={1} />
                <stop offset="100%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.6} />
              </linearGradient>
            </defs>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={6}
              cornerRadius={8}
              dataKey="value"
              stroke="none"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#${entry.grad})`} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              formatter={(v: number) => [`${v} (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`, "Contenções"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground mb-1">Contenção Química</span>
          <span className="text-xl font-bold font-display" style={{ color: "hsl(172, 66%, 50%)" }}>
            {total > 0 ? Math.round((chemical / total) * 100) : 0}%
          </span>
        </div>
        <div className="flex flex-col pl-4 border-l border-border/50">
          <span className="text-xs text-muted-foreground mb-1">Contenção Mecânica</span>
          <span className="text-xl font-bold font-display" style={{ color: "hsl(210, 100%, 56%)" }}>
            {total > 0 ? Math.round((mechanical / total) * 100) : 0}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}
