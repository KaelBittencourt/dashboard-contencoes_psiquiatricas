import React, { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export function FileUpload({ onFileUpload, isLoading, error }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.match(/\.(xlsx|xls)$/i)) {
        return;
      }
      onFileUpload(file);
    },
    [onFileUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Sistema de Análise de Contenções Hospitalares
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Dashboard de{" "}
            <span className="text-gradient-primary">Contenções</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Importe sua planilha Excel para gerar análises e indicadores automáticos
          </p>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`
              relative flex flex-col items-center justify-center w-full h-72 
              rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-300
              ${isDragging
                ? "border-primary bg-primary/10 scale-[1.01]"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
              }
            `}
          >
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleChange}
              disabled={isLoading}
            />

            {isLoading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-border" />
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-foreground font-medium">Processando planilha...</p>
                <p className="text-muted-foreground text-sm">Analisando dados e calculando indicadores</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 px-8 text-center">
                <div className={`
                  p-5 rounded-2xl transition-all duration-300
                  ${isDragging ? "bg-primary/20" : "bg-muted"}
                `}>
                  <Upload className={`w-10 h-10 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-lg mb-1">
                    {isDragging ? "Solte o arquivo aqui" : "Arraste e solte sua planilha"}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    ou <span className="text-primary font-medium">clique para selecionar</span>
                  </p>
                </div>
                <p className="text-muted-foreground text-xs">Formatos suportados: .xlsx, .xls</p>
              </div>
            )}
          </label>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          {[
            { icon: FileSpreadsheet, label: "Leitura automática", desc: "Interpreta colunas automaticamente" },
            { icon: CheckCircle2, label: "KPIs em tempo real", desc: "Indicadores calculados instantaneamente" },
            { icon: Upload, label: "Gráficos interativos", desc: "Visualizações dinâmicas dos dados" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="p-4 rounded-xl bg-card border border-border text-center">
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-foreground text-sm font-medium">{label}</p>
              <p className="text-muted-foreground text-xs mt-1">{desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
