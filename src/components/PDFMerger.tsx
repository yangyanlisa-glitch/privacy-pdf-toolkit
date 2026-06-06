/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, ArrowDown, ArrowUp, X, Layers, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { PDFFile } from '../types';
import { mergePDFs } from '../pdfUtils';

export default function PDFMerger() {
  const [filesList, setFilesList] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mergedResult, setMergedResult] = useState<{
    data: Uint8Array;
    size: number;
    downloadUrl: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // File additions
  const handleFilesAdded = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    const newFiles: PDFFile[] = [];
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];

    for (let i = 0; i < files.length; i++) {
      const selectedFile = files[i];
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        continue; // skip non pdfs
      }

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let pageCount = 1;
        if (pdfjsLib) {
          try {
            const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
            pageCount = doc.numPages;
          } catch (e) {
            console.warn('Page parsing failed, fallback 1', e);
          }
        }

        newFiles.push({
          id: Math.random().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          data: uint8Array,
          pageCount: pageCount
        });
      } catch (err) {
        console.error('File parsing failed:', err);
      }
    }

    if (newFiles.length === 0) {
      setError('有効なPDFファイルを追加できませんでした。');
      return;
    }

    setFilesList((prev) => [...prev, ...newFiles]);
    setMergedResult(null); // invalidate cached merge if any
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setError(null);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const newFiles: PDFFile[] = [];
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];

    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const selectedFile = e.dataTransfer.files[i];
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        continue;
      }

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let pageCount = 1;
        if (pdfjsLib) {
          try {
            const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
            pageCount = doc.numPages;
          } catch (e) {
            console.warn('Page parsing failed, fallback 1', e);
          }
        }

        newFiles.push({
          id: Math.random().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          data: uint8Array,
          pageCount: pageCount
        });
      } catch (err) {
        console.error('Drop parsing failed:', err);
      }
    }

    if (newFiles.length === 0) {
      setError('有効なPDFファイルを追加できませんでした。');
      return;
    }

    setFilesList((prev) => [...prev, ...newFiles]);
    setMergedResult(null);
  };

  // Move files up/down for custom order
  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === filesList.length - 1) return;

    const updatedList = [...filesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;

    setFilesList(updatedList);
    setMergedResult(null);
  };

  const removeItem = (id: string) => {
    setFilesList((prev) => prev.filter((f) => f.id !== id));
    setMergedResult(null);
  };

  const triggerMergeFiles = async () => {
    if (filesList.length < 2) {
      setError('結合するには2つ以上のPDFファイルが必要です。');
      return;
    }

    setMerging(true);
    setError(null);

    try {
      const mergedBytes = await mergePDFs(filesList);
      const blob = new Blob([mergedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setMergedResult({
        data: mergedBytes,
        size: mergedBytes.length,
        downloadUrl: url
      });
    } catch (err: any) {
      setError('結合中にエラーが発生しました: ' + (err.message || '不明なエラー'));
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedResult) return;
    const link = document.createElement('a');
    link.href = mergedResult.downloadUrl;
    link.download = 'merged_document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAll = () => {
    setFilesList([]);
    setMergedResult(null);
    setError(null);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTotalPagesCount = () => {
    return filesList.reduce((acc, file) => acc + file.pageCount, 0);
  };

  const getTotalSizeCount = () => {
    return filesList.reduce((acc, file) => acc + file.size, 0);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      
      {/* Title */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <Layers className="h-7 w-7 text-blue-500 animate-pulse" />
            PDF 結合
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            複数のPDFドキュメントをお好きな順に並び替え、単一のPDFファイルに綺麗に連結します。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Main interaction panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload & Files list Panel (Left, span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Input drag zone */}
          <div
            id="dropzone-merge"
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-10 text-center hover:border-blue-500/50 hover:bg-blue-500/[0.005] cursor-pointer transition-all duration-300 shadow-xs"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFilesAdded}
              accept=".pdf"
              multiple
              className="hidden"
            />
            <div className="mb-3 rounded-full bg-blue-50 p-3 text-blue-500 transition-transform group-hover:scale-105 duration-300">
              <Upload className="h-6 w-6" />
            </div>
            <h3 className="font-display font-bold text-gray-900 text-base">
              PDF ファイルをさらに追加する
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              ドラッグ＆ドロップまたはクリックでPC/スマートフォンから複数PDFファイルをまとめて読み込み
            </p>
          </div>

          {/* Files List showing sorting tools */}
          {filesList.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-gray-400" />
                  選択済みのドキュメント一覧 ({filesList.length}個)
                </h4>
                <button
                  id="btn-clear-merge"
                  onClick={clearAll}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline transition-colors cursor-pointer"
                >
                  リストをすべて削除
                </button>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {filesList.map((fileItem, idx) => (
                  <div
                    key={fileItem.id}
                    className="flex items-center justify-between p-3.5 bg-gray-50/60 rounded-xl border border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center space-x-3 w-[70%]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white border border-gray-100 text-xs font-mono font-bold text-gray-400">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <span className="block font-bold text-gray-900 text-sm truncate" title={fileItem.name}>
                          {fileItem.name}
                        </span>
                        <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono mt-0.5">
                          <span>{formatSize(fileItem.size)}</span>
                          <span>&bull;</span>
                          <span>{fileItem.pageCount} ページ</span>
                        </div>
                      </div>
                    </div>

                    {/* Sorting & Deleting control actions */}
                    <div className="flex items-center space-x-1.5 shrink-0">
                      <button
                        id={`btn-moveup-${idx}`}
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'up')}
                        className={`p-1.5 rounded-lg border bg-white ${
                          idx === 0
                            ? 'border-gray-50 text-gray-200 cursor-not-allowed'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 cursor-pointer'
                        }`}
                        title="上へ"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`btn-movedown-${idx}`}
                        disabled={idx === filesList.length - 1}
                        onClick={() => moveItem(idx, 'down')}
                        className={`p-1.5 rounded-lg border bg-white ${
                          idx === filesList.length - 1
                            ? 'border-gray-50 text-gray-200 cursor-not-allowed'
                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-500 cursor-pointer'
                        }`}
                        title="下へ"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`btn-remove-${idx}`}
                        onClick={() => removeItem(fileItem.id)}
                        className="p-1.5 rounded-lg border border-red-100 bg-red-50 text-red-500 hover:bg-red-100 transition-colors cursor-pointer"
                        title="削除"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* Consolidation Summary & Trigger Controls (Right, span 1) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between h-full space-y-6">
            
            <div className="space-y-5">
              <h4 className="font-display font-semibold text-gray-900 border-b border-gray-50 pb-2 flex items-center gap-1.5 text-base">
                結合サマリー
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-gray-400">ファイル総数</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">{filesList.length} 個</span>
                </div>
                <div>
                  <span className="block text-gray-400">総ページ数</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">{getTotalPagesCount()} ページ</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-gray-50">
                  <span className="block text-gray-400">推定合算サイズ</span>
                  <span className="font-bold text-gray-900 font-mono text-sm">{formatSize(getTotalSizeCount())}</span>
                </div>
              </div>

              {filesList.length > 0 && filesList.length < 2 && (
                <div className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg text-xs text-yellow-700 flex items-start gap-1.5">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-500 mt-0.5" />
                  <span>
                    ファイルを結合するには2つ以上のPDFが必要です。もう1つ追加してください。
                  </span>
                </div>
              )}
            </div>

            {/* Merge CTA */}
            <div className="space-y-3">
              <button
                id="btn-run-merge"
                disabled={filesList.length < 2 || merging}
                onClick={triggerMergeFiles}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors cursor-pointer shadow-xs ${
                  filesList.length < 2 || merging
                    ? 'bg-blue-300 dark:bg-blue-900/30 cursor-not-allowed text-white/60'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {merging ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>結合ファイルをコンパイル中...</span>
                  </>
                ) : (
                  <>
                    <Layers className="h-4 w-4" />
                    <span>PDFを結合する</span>
                  </>
                )}
              </button>

              {mergedResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>結合完了 ({formatSize(mergedResult.size)})</span>
                  </div>
                  
                  <button
                    id="btn-download-merged"
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>結合PDFをダウンロード</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
