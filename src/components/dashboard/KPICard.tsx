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
    border: "border-chart-blue/20",
    glow: "shadow-[0_0_20px_hsl(210_100%_56%/0.1)]",
    dot: "bg-chart-blue",
  },
  teal: {
    bg: "bg-accent/10",
    icon: "text-accent",
    border: "border-accent/20",
    glow: "shadow-[0_0_20px_hsl(172_66%_50%/0.1)]",
    dot: "bg-accent",
  },
  orange: {
    bg: "bg-chart-orange/10",
    icon: "text-chart-orange",
    border: "border-chart-orange/20",
    glow: "shadow-[0_0_20px_hsl(28_100%_55%/0.1)]",
    dot: "bg-chart-orange",
  },
  purple: {
    bg: "bg-chart-purple/10",
    icon: "text-chart-purple",
    border: "border-chart-purple/20",
    glow: "shadow-[0_0_20px_hsl(265_85%_65%/0.1)]",
    dot: "bg-chart-purple",
  },
};

export function KPICard({ title, value, subtitle, icon: Icon, color, index }: KPICardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`
        relative p-6 rounded-2xl border bg-card
        ${colors.border} ${colors.glow}
        hover:scale-[1.02] transition-transform duration-200
        overflow-hidden
      `}
    >
      {/* Decorative dot in the top right */}
      <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${colors.dot} opacity-60`} />

      <div className="flex items-center gap-5">
        <div className={`shrink-0 p-4 rounded-2xl ${colors.bg}`}>
          <Icon className={`w-7 h-7 ${colors.icon}`} />
        </div>
        
        <div className="flex-1 space-y-1.5 min-w-0">
          <p className="text-muted-foreground text-[11px] font-semibold uppercase tracking-wider truncate">
            {title}
          </p>
          <p className="font-display text-2xl lg:text-3xl font-bold text-foreground leading-none tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-muted-foreground text-xs truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
