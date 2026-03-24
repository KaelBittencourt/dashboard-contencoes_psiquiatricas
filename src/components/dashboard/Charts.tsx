import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
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
  const CustomBarLabel = ({ x, y, width, value }: any) => (
    <text
      x={x + width / 2}
      y={y - 8}
      fill="hsl(213, 20%, 75%)"
      fontSize={12}
      fontWeight={600}
      textAnchor="middle"
    >
      {value > 0 ? value : ""}
    </text>
  );

  return (
    <ChartCard title="Evolução Mensal de Contenções" index={0}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={28} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(210, 100%, 56%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(210, 100%, 56%)" stopOpacity={0.5} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            cursor={{ fill: "hsl(220, 15%, 18%)" }}
            formatter={(v) => [v, "Contenções"]}
          />
          <Bar
            dataKey="count"
            fill="url(#barGradient)"
            radius={[6, 6, 0, 0]}
            name="Contenções"
            label={<CustomBarLabel />}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface CIDChartProps {
  data: CIDData[];
}

export function CIDChart({ data }: CIDChartProps) {
  const totalCount = data.reduce((sum, d) => sum + d.count, 0);
  const chartHeight = Math.max(240, data.length * 38 + 40);

  const CustomYAxisTick = ({ x, y, payload }: any) => (
    <g transform={`translate(${x},${y})`}>
      <text
        x={-4}
        y={0}
        dy={4}
        textAnchor="end"
        fill="hsl(213, 20%, 75%)"
        fontSize={12}
        fontWeight={500}
      >
        {payload.value}
      </text>
    </g>
  );

  const CustomBarLabel = ({ x, y, width, height, value }: any) => (
    <text
      x={x + width + 8}
      y={y + height / 2}
      dy={4}
      fill="hsl(213, 20%, 60%)"
      fontSize={11}
      fontWeight={500}
    >
      {value}
    </text>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 rounded-2xl bg-card border border-border flex flex-col"
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

      {/* Chart */}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            layout="vertical"
            barSize={16}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <defs>
              {COLORS.map((color, i) => (
                <linearGradient key={i} id={`cidGrad${i}`} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={color} stopOpacity={0.85} />
                  <stop offset="100%" stopColor={color} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 15%, 16%)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fill: "hsl(213, 20%, 45%)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <YAxis
              dataKey="cid"
              type="category"
              tick={<CustomYAxisTick />}
              axisLine={false}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelStyle={tooltipLabelStyle}
              itemStyle={tooltipItemStyle}
              cursor={{ fill: "hsl(220, 15%, 14%)", radius: 4 }}
              formatter={(v: number) => [`${v} (${totalCount > 0 ? ((v / totalCount) * 100).toFixed(1) : 0}%)`, "Contenções"]}
            />
            <Bar dataKey="count" radius={[0, 8, 8, 0]} name="Contenções" label={<CustomBarLabel />}>
              {data.map((_, index) => (
                <Cell key={index} fill={`url(#cidGrad${index % COLORS.length})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Total de registros: <span className="text-foreground font-medium">{totalCount}</span>
        </span>
        {data.length > 0 && (
          <span className="text-xs text-muted-foreground">
            CID mais frequente:{" "}
            <span className="text-primary font-medium">{data[0].cid}</span>
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
