import { useState, useCallback } from "react";
import { FileUpload } from "@/components/dashboard/FileUpload";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { parseExcelFile } from "@/lib/excelParser";
import type { RestraintRecord } from "@/types/restraint";

const Index = () => {
  const [records, setRecords] = useState<RestraintRecord[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await parseExcelFile(file);
      if (data.length === 0) {
        setError("Nenhum dado encontrado na planilha. Verifique o formato do arquivo.");
        return;
      }
      setRecords(data);
      setFileName(file.name);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? `Erro ao processar planilha: ${err.message}`
          : "Erro desconhecido ao processar a planilha."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setRecords(null);
    setFileName("");
    setError(null);
  }, []);

  if (records) {
    return <Dashboard records={records} fileName={fileName} onReset={handleReset} />;
  }

  return (
    <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
  );
};

export default Index;
