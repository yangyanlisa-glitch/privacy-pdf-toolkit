/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle, RotateCw, RotateCcw, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { PDFFile, RotationState } from '../types';
import { rotatePDF, getPageThumbnail } from '../pdfUtils';

export default function PDFRotator() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [rotating, setRotating] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Tracks rotation angle (0, 90, 180, 270) for each page (0-indexed)
  const [rotations, setRotations] = useState<RotationState>({});
  
  // Tracks rendered thumbnail URLs for previewing pages
  const [thumbnails, setThumbnails] = useState<{ [pageIndex: number]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File loading
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    setRotations({});
    setThumbnails({});
    const selectedFile = files[0];
    
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('PDFファイルを選択してください。');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      let pageCount = 1;
      try {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        if (pdfjsLib) {
          const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
          pageCount = doc.numPages;
        }
      } catch (err) {
        console.warn('Page parsing failed, fallback 1', err);
      }

      const fileObj = {
        id: Math.random().toString(),
        name: selectedFile.name,
        size: selectedFile.size,
        data: uint8Array,
        pageCount: pageCount
      };

      setFile(fileObj);
      loadThumbnails(fileObj);

    } catch (err: any) {
      setError('PDFファイルの読み込みに失敗しました: ' + (err.message || err));
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setError(null);
      setRotations({});
      setThumbnails({});
      const selectedFile = e.dataTransfer.files[0];
      
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('PDFファイルを選択してください。');
        return;
      }

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let pageCount = 1;
        try {
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          if (pdfjsLib) {
            const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
            pageCount = doc.numPages;
          }
        } catch (err) {
          console.warn('Page count fallback 1:', err);
        }

        const fileObj = {
          id: Math.random().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          data: uint8Array,
          pageCount: pageCount
        };

        setFile(fileObj);
        loadThumbnails(fileObj);
      } catch (err) {
        setError('PDFファイルの読み込みに失敗しました。');
      }
    }
  };

  // Asynchronously render thumbnails for all pages using background queue
  const loadThumbnails = async (pdfFile: PDFFile) => {
    const total = pdfFile.pageCount;
    // Load dynamically scale = 0.25 to make it very fast
    for (let i = 1; i <= total; i++) {
      try {
        const dataUrl = await getPageThumbnail(pdfFile.data, i, 0.35);
        if (dataUrl) {
          setThumbnails((prev) => ({ ...prev, [i - 1]: dataUrl }));
        }
      } catch (err) {
        console.warn(`Thumbnail failed for page ${i}`, err);
      }
    }
  };

  // Result output state
  const [rotatedResult, setRotatedResult] = useState<{
    data: Uint8Array;
    size: number;
    downloadUrl: string;
  } | null>(null);

  // Rotate a single page by 90 degrees (clockwise or counter-clockwise)
  const rotatePage = (pageIndex: number, amt: 90 | -90 | 180) => {
    const current = rotations[pageIndex] || 0;
    const next = (current + amt) % 360;
    setRotations((prev) => ({
      ...prev,
      [pageIndex]: next < 0 ? next + 360 : next
    }));
    setRotatedResult(null); // invalidate compiled cache
  };

  const rotateAllPages = (amt: 90 | -90) => {
    if (!file) return;
    const nextState: RotationState = {};
    for (let i = 0; i < file.pageCount; i++) {
      const current = rotations[i] || 0;
      const next = (current + amt) % 360;
      nextState[i] = next < 0 ? next + 360 : next;
    }
    setRotations(nextState);
    setRotatedResult(null);
  };

  const resetRotations = () => {
    setRotations({});
    setRotatedResult(null);
  };

  const triggerExportRotated = async () => {
    if (!file) return;
    setRotating(true);
    setProgressMsg('PDFを新しい角度パラメータで再レイアウト中...');
    setError(null);

    try {
      const resData = await rotatePDF(file.data, rotations);
      const blob = new Blob([resData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setRotatedResult({
        data: resData,
        size: resData.length,
        downloadUrl: url
      });
    } catch (err: any) {
      setError('回転データの生成処理中にエラーが発生しました: ' + (err.message || '不明なエラー'));
    } finally {
      setRotating(false);
    }
  };

  const handleDownload = () => {
    if (!rotatedResult || !file) return;
    const link = document.createElement('a');
    link.href = rotatedResult.downloadUrl;
    const base = file.name.endsWith('.pdf') ? file.name.slice(0, -4) : file.name;
    link.download = `${base}_rotated.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const resetAll = () => {
    setFile(null);
    setRotations({});
    setThumbnails({});
    setRotatedResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      
      {/* Title */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <RotateCw className="h-7 w-7 text-purple-500 animate-pulse" />
            PDF 回転
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            横スキャンされた資料の修正。ページを個別、または全編一括で素早く回転させ保存します。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload zone */}
      {!file && (
        <div
          id="dropzone-rotate"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center hover:border-purple-500/50 hover:bg-purple-500/[0.005] cursor-pointer transition-all duration-300 shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <div className="mb-4 rounded-full bg-purple-50 p-4 text-purple-500 transition-transform group-hover:scale-105 duration-300">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg">
            PDF ファイルをここにドロップしてください
          </h3>
          <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
            またはクリックしてファイルシステムからアップロード &bull; 100% 機密保持
          </p>
          <div className="mt-6 inline-flex rounded-lg bg-purple-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs group-hover:bg-purple-600 transition-colors">
            ファイルを選択
          </div>
        </div>
      )}

      {/* Visual interactive layout editor */}
      {file && (
        <div className="space-y-6">
          
          {/* Header Panel detailing actions */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-500 shrink-0">
                <FileText className="h-5.5 w-5.5" />
              </div>
              <div className="truncate text-left">
                <h4 className="font-bold text-gray-900 text-sm truncate max-w-xs">{file.name}</h4>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                  {formatSize(file.size)} &bull; {file.pageCount} ページ
                </p>
              </div>
            </div>

            {/* Quick bulk action triggers */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end text-xs">
              <button
                id="btn-rot-all-cw"
                onClick={() => rotateAllPages(90)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl font-bold text-gray-700 cursor-pointer"
              >
                <RotateCw className="h-3.5 w-3.5 text-purple-500" />
                全ページ右90°
              </button>
              <button
                id="btn-rot-all-ccw"
                onClick={() => rotateAllPages(-90)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl font-bold text-gray-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5 text-purple-500" />
                全ページ左90°
              </button>
              <button
                id="btn-rot-reset"
                onClick={resetRotations}
                disabled={Object.values(rotations).every((v) => v === 0)}
                className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl font-bold cursor-pointer ${
                  Object.values(rotations).every((v) => v === 0)
                    ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white border-red-100 hover:bg-red-50 text-red-500'
                }`}
              >
                回転をリセット
              </button>
              <button
                id="btn-rotate-reupload"
                onClick={resetAll}
                className="flex items-center gap-1 bg-white hover:bg-gray-50 border border-gray-150 rounded-xl font-bold text-gray-600 px-3 py-2 cursor-pointer"
              >
                別ファイル選択
              </button>
            </div>
          </div>

          {/* Grid of pages with individual visual rotation modifiers */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {Array.from({ length: file.pageCount }).map((_, index) => {
              const degreesSetting = rotations[index] || 0;
              const hasThumbnail = !!thumbnails[index];

              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl border border-gray-150 p-3 shadow-xs space-y-3 hover:border-purple-300/60 hover:shadow-premium transition-all duration-300 group flex flex-col justify-between"
                  id={`page-card-${index}`}
                >
                  
                  {/* Visual canvas or fallback Page Vector box with style-based rotation */}
                  <div className="aspect-[3/4] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center relative overflow-hidden p-2 shadow-inner shrink-0">
                    <div
                      className="w-full h-full flex items-center justify-center transition-transform duration-300"
                      style={{
                        transform: `rotate(${degreesSetting}deg)`,
                      }}
                    >
                      {hasThumbnail ? (
                        <img
                          src={thumbnails[index]}
                          alt={`Page ${index + 1}`}
                          className="max-w-full max-h-full object-contain rounded shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-center space-y-2 flex flex-col items-center">
                          <FileText className="h-10 w-10 text-gray-300" />
                          <span className="text-[10px] font-mono font-semibold text-gray-400">PDF PAGE</span>
                        </div>
                      )}
                    </div>

                    {/* Page badge */}
                    <span className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-lg bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono font-bold">
                      {index + 1}
                    </span>

                    {/* Display active rotation delta if modified */}
                    {degreesSetting !== 0 && (
                      <span className="absolute top-2 right-2 flex items-center gap-0.5 rounded-lg bg-purple-600 text-white text-[9px] px-2 py-0.5 font-bold">
                        <RotateCw className="h-2.5 w-2.5 animate-spin-slow" />
                        {degreesSetting}&deg;
                      </span>
                    )}
                  </div>

                  {/* Operational rotation buttons */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-gray-50">
                    <button
                      id={`btn-page-rot-left-${index}`}
                      onClick={() => rotatePage(index, -90)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[10px] text-gray-500 font-bold border border-gray-100 transition-colors cursor-pointer"
                      title="左90度回転"
                    >
                      <RotateCcw className="h-3 w-3 shrink-0" />
                      <span>左95°</span>
                    </button>
                    <button
                      id={`btn-page-rot-right-${index}`}
                      onClick={() => rotatePage(index, 90)}
                      className="flex items-center justify-center gap-1 py-1.5 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 rounded-lg text-[10px] text-gray-500 font-bold border border-gray-100 transition-colors cursor-pointer"
                      title="右90度回転"
                    >
                      <RotateCw className="h-3 w-3 shrink-0" />
                      <span>右95°</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Compilation CTA and output segment */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-xs max-w-md mx-auto space-y-5 text-center">
            <h4 className="font-display font-semibold text-gray-900 text-base">
              回転の確定とダウンロード
            </h4>
            <p className="text-xs text-gray-400">
              設定した角度パラメータをPDFの内部マトリックスへ恒常的に適用し保存します。
            </p>

            <div className="space-y-4">
              <button
                id="btn-run-rotate"
                disabled={rotating}
                onClick={triggerExportRotated}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-bold text-white py-3.5 transition-colors cursor-pointer shadow-xs shadow-purple-500/10"
              >
                {rotating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>回転パラメータの保存処理中...</span>
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4" />
                    <span>回転を保存・適用する (ローカル)</span>
                  </>
                )}
              </button>

              {rotatedResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3 animate-fade-in text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>回転適用完了 ({formatSize(rotatedResult.size)})</span>
                  </div>
                  
                  <button
                    id="btn-download-rotated"
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer animate-pulse"
                  >
                    <Download className="h-4 w-4" />
                    <span>変更されたPDFをダウンロード</span>
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
