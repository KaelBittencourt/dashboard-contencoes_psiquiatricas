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
  return (
    <ChartCard title="Evolução Mensal de Contenções" index={0}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barSize={28}>
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
            cursor={{ fill: "hsl(220, 15%, 18%)" }}
            formatter={(v) => [v, "Contenções"]}
          />
          <Bar dataKey="count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} name="Contenções" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

interface CIDChartProps {
  data: CIDData[];
}

export function CIDChart({ data }: CIDChartProps) {
  return (
    <ChartCard title="Distribuição por CID" index={1}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" barSize={18}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <YAxis
            dataKey="cid"
            type="category"
            tick={{ fill: "hsl(213, 20%, 55%)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "hsl(220, 15%, 18%)" }}
            formatter={(v) => [v, "Contenções"]}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Contenções">
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
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

  const data = [
    { name: "Contenção Química", value: chemical },
    { name: "Contenção Mecânica", value: mechanical },
  ].filter((d) => d.value > 0);

  return (
    <ChartCard title="Contenção Química vs Mecânica" index={2}>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={85}
            innerRadius={45}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            <Cell fill="hsl(172, 66%, 50%)" />
            <Cell fill="hsl(210, 100%, 56%)" />
          </Pie>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(v) => [v, "Contenções"]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span style={{ color: "hsl(213, 20%, 55%)", fontSize: "12px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
