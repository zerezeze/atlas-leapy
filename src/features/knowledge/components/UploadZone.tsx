'use client';

import { useState, useRef } from 'react';
import {
  UploadCloud,
  File,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { readStreamableValue } from '@ai-sdk/rsc';
import { uploadDocumentAction, UploadState } from '../actions/upload-document';

interface UploadZoneProps {
  onSuccess: () => void;
}

export function UploadZone({ onSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndSetFile = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase().split('.').pop();
    if (ext !== 'md' && ext !== 'txt' && ext !== 'pdf' && ext !== 'docx') {
      setErrorMsg(
        'Apenas arquivos .md, .txt, .pdf e .docx são suportados no momento.'
      );
      return false;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      setErrorMsg('O arquivo deve ter no máximo 5MB.');
      return false;
    }
    setFile(selectedFile);
    setErrorMsg(null);
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setState('uploading');
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { statusStream } = await uploadDocumentAction(formData);

      for await (const status of readStreamableValue(statusStream)) {
        if (status) {
          setState(status as UploadState);
          if (status === 'success') {
            setTimeout(() => {
              setFile(null);
              setState('idle');
              onSuccess();
            }, 2000);
          } else if (status === 'error') {
            setErrorMsg('Ocorreu um erro durante o processamento do arquivo.');
          }
        }
      }
    } catch (error) {
      console.error(error);
      setState('error');
      setErrorMsg('Falha ao comunicar com o servidor.');
    }
  };

  const renderState = () => {
    switch (state) {
      case 'idle':
        return null;
      case 'uploading':
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Upload realizado...
          </div>
        );
      case 'chunking':
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Dividindo documento...
          </div>
        );
      case 'embedding':
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Gerando embeddings...
          </div>
        );
      case 'indexing':
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Atualizando base de
            conhecimento...
          </div>
        );
      case 'success':
        return (
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="h-4 w-4" /> Documento indexado com sucesso.
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center gap-2 text-sm text-red-500">
            <AlertCircle className="h-4 w-4" />{' '}
            {errorMsg || 'Erro no processamento.'}
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".md,.txt,.pdf,.docx"
        />

        {!file ? (
          <>
            <div className="h-12 w-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center mb-4 border border-zinc-100 dark:border-zinc-700">
              <UploadCloud className="h-6 w-6 text-zinc-400" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Arraste e solte seu documento aqui
            </p>
            <p className="text-xs text-zinc-500 mt-1 mb-4">
              Suporta arquivos .md, .txt, .pdf e .docx
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors shadow-sm"
            >
              Selecionar Arquivo
            </button>
            {errorMsg && state === 'idle' && (
              <p className="text-xs text-red-500 mt-4 flex items-center gap-1.5">
                <AlertCircle className="h-3 w-3" /> {errorMsg}
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center w-full max-w-sm">
            <div className="flex items-center gap-3 p-3 w-full bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm mb-4">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-blue-500">
                <FileText className="h-5 w-5" />
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-zinc-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {state === 'idle' ? (
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setFile(null)}
                  className="flex-1 text-xs font-medium px-4 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  className="flex-1 text-xs font-medium px-4 py-2.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Enviar Documento
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center w-full gap-2 p-3 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                {renderState()}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
