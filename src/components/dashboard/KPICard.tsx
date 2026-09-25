import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "blue" | "teal" | "orange" | "purple";
  index: number;
}

const colorMap = {
  blue: {
    bg: "bg-chart-blue/10",
    icon: "text-chart-blue",
  },
  teal: {
    bg: "bg-accent/10",
    icon: "text-accent",
  },
  orange: {
    bg: "bg-chart-orange/10",
    icon: "text-chart-orange",
  },
  purple: {
    bg: "bg-chart-purple/10",
    icon: "text-chart-purple",
  },
};

export function KPICard({ title, value, subtitle, icon: Icon, color, index }: KPICardProps) {
  const colors = colorMap[color];
  const compactValue = String(value).length > 8;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium leading-snug text-muted-foreground">
          {title}
        </p>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colors.bg}`}>
          <Icon className={`h-4 w-4 ${colors.icon}`} strokeWidth={2} />
        </div>
      </div>

      <div className="min-w-0">
        <p
          className={`font-display font-semibold tracking-tight text-foreground leading-tight ${
            compactValue ? "text-lg" : "text-2xl"
          }`}
        >
          {value}
        </p>
        {subtitle && (
          <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
}
