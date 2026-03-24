import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, Database } from "lucide-react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { fetchGoogleSheetData } from "@/lib/googleSheetParser";
import type { RestraintRecord } from "@/types/restraint";

const Index = () => {
  const [records, setRecords] = useState<RestraintRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchGoogleSheetData();
      setRecords(data);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro desconhecido ao carregar dados da planilha."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleReload = useCallback(() => {
    setRecords(null);
    loadData();
  }, [loadData]);

  if (records) {
    return <Dashboard records={records} fileName="Google Sheets" onReset={handleReload} />;
  }

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
            Sistema de Análise de Contenções Psiquiátricas
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-3">
            Dashboard de{" "}
            <span className="text-gradient-primary">Contenções</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Carregando dados diretamente do Google Sheets
          </p>
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center justify-center w-full h-72 rounded-2xl border-2 border-border bg-card"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-border" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  <p className="text-foreground font-medium">Conectando ao Google Sheets...</p>
                </div>
                <p className="text-muted-foreground text-sm">Buscando e processando dados da planilha</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center w-full rounded-2xl border-2 border-destructive/30 bg-card p-10 gap-6"
          >
            <div className="p-4 rounded-2xl bg-destructive/10">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <div className="text-center">
              <p className="text-foreground font-semibold text-lg mb-2">Erro ao carregar dados</p>
              <p className="text-muted-foreground text-sm max-w-md">{error}</p>
            </div>
            <button
              onClick={handleReload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar novamente
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Index;
