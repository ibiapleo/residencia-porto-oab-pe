"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface FileImportProps {
  uploadService: (file: File) => Promise<any>;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  acceptedFileTypes?: string;
  maxFiles?: number;
  maxSize?: number;
  templateFileUrl?: string;
}

export function FileImport({
  uploadService,
  onSuccess,
  onError,
  acceptedFileTypes = ".csv, .xlsx, .xls",
  maxFiles = 1,
  maxSize = 5 * 1024 * 1024, // 5MB
  templateFileUrl,
}: FileImportProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setProgress(0);

      try {
        setProgress(30);
        await uploadService(file);
        setProgress(100);

        toast({
          title: "Sucesso",
          description: "Arquivo importado com sucesso!",
          variant: "default",
        });

        if (onSuccess) onSuccess();
      } catch (error) {
        console.error("Erro ao processar arquivo:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao importar o arquivo. Verifique o formato e tente novamente.",
          variant: "destructive",
        });

        if (onError) onError(error);
      } finally {
        setIsLoading(false);
        setTimeout(() => setProgress(0), 1000);
      }
    },
    [uploadService, toast, onSuccess, onError]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setIsDragging(false);
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        processFile(selectedFile);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles,
    maxSize,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    disabled: isLoading,
  });

  const removeFile = () => {
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-border hover:bg-accent/50"
        } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">
            {isDragging
              ? "Solte o arquivo aqui"
              : file
              ? file.name
              : "Arraste e solte um arquivo aqui, ou clique para selecionar"}
          </p>
          <p className="text-sm text-muted-foreground">
            Formatos aceitos: {acceptedFileTypes} (Max: {maxSize / 1024 / 1024}MB)
          </p>
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between bg-accent/30 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            {isLoading ? (
              <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : progress === 100 ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="font-medium">{file.name}</span>
          </div>
          {!isLoading && progress !== 100 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive"
            >
              Remover
            </Button>
          )}
        </div>
      )}

      {isLoading && <Progress value={progress} className="h-2" />}

    </div>
  );
}