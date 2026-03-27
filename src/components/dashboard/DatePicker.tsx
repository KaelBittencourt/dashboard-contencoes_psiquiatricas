import * as React from "react";
import { format, parse, isValid, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: string; // yyyy-mm-dd
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  onChange,
  label,
  placeholder = "DD/MM/AAAA",
  className,
}: DatePickerProps) {
  const [inputValue, setInputValue] = React.useState("");
  
  // Sync internal text state with parent date
  React.useEffect(() => {
    if (date) {
      try {
        const d = new Date(date + "T12:00:00"); // Avoid timezone issues
        if (isValid(d)) {
          setInputValue(format(d, "dd/MM/yyyy"));
        }
      } catch (e) {
        // ignore
      }
    } else {
      setInputValue("");
    }
  }, [date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 8) val = val.slice(0, 8);
    
    // Add slashes
    if (val.length > 4) {
      val = `${val.slice(0, 2)}/${val.slice(2, 4)}/${val.slice(4)}`;
    } else if (val.length > 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    
    setInputValue(val);

    // If fully typed, try to update parent
    if (val.length === 10) {
      const parsedDate = parse(val, "dd/MM/yyyy", new Date());
      if (isValid(parsedDate)) {
        onChange(format(parsedDate, "yyyy-MM-dd"));
      }
    } else if (val.length === 0) {
      onChange("");
    }
  };

  const selectedDate = React.useMemo(() => {
    if (!date) return undefined;
    const d = new Date(date + "T12:00:00");
    return isValid(d) ? d : undefined;
  }, [date]);

  return (
    <div className={cn("grid gap-1", className)}>
      {label && <label className="text-xs text-muted-foreground font-medium">{label}</label>}
      <div className="relative group">
        <Popover>
          <PopoverTrigger asChild>
            <button className="absolute left-0 top-0 h-full px-3 text-muted-foreground hover:text-primary transition-colors focus:outline-none z-10">
              <CalendarIcon className="w-4 h-4" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border bg-popover/95 backdrop-blur-xl shadow-2xl" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  onChange(format(d, "yyyy-MM-dd"));
                }
              }}
              locale={ptBR}
              initialFocus
              className="bg-transparent"
            />
          </PopoverContent>
        </Popover>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-3 py-2 h-[38px] bg-card border border-border rounded-xl text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all hover:bg-muted/50"
        />
      </div>
    </div>
  );
}
