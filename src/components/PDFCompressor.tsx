/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Sparkles, Sliders, ArrowRight, RefreshCw, Download, AlertTriangle } from 'lucide-react';
import { PDFFile, CompressionSettings } from '../types';
import { compressPDFLossless, compressPDFLossy } from '../pdfUtils';

export default function PDFCompressor() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [compressing, setCompressing] = useState<boolean>(false);
  const [progressMsg, setProgressMsg] = useState<string>('');
  
  // Settings state
  const [settings, setSettings] = useState<CompressionSettings>({
    mode: 'lossless',
    quality: 0.7,
    dpi: 120
  });

  // Result state
  const [compressedResult, setCompressedResult] = useState<{
    data: Uint8Array;
    size: number;
    downloadUrl: string;
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File parsing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    setCompressedResult(null);
    const selectedFile = files[0];
    
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
      setError('PDFファイルを選択してください。');
      return;
    }

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Look up page count
      let pageCount = 1;
      try {
        const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
        if (pdfjsLib) {
          const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
          pageCount = doc.numPages;
        }
      } catch (err) {
        console.warn('Failed to parse pages via PDFJS, defaulting to 1:', err);
      }

      setFile({
        id: Math.random().toString(),
        name: selectedFile.name,
        size: selectedFile.size,
        data: uint8Array,
        pageCount: pageCount
      });
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
      setCompressedResult(null);
      const selectedFile = e.dataTransfer.files[0];
      
      if (selectedFile.type !== 'application/pdf' && !selectedFile.name.endsWith('.pdf')) {
        setError('PDFファイルを選択してください。');
        return;
      }

      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Look up page count
        let pageCount = 1;
        try {
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
          if (pdfjsLib) {
            const doc = await pdfjsLib.getDocument({ data: uint8Array }).promise;
            pageCount = doc.numPages;
          }
        } catch (err) {
          console.warn('Failed to lookup page count:', err);
        }

        setFile({
          id: Math.random().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          data: uint8Array,
          pageCount: pageCount
        });
      } catch (err: any) {
        setError('PDFファイルの読み込みに失敗しました。');
      }
    }
  };

  // Execution
  const triggerCompression = async () => {
    if (!file) return;
    setCompressing(true);
    setProgressMsg('最適化プロセスを初期化中...');
    setError(null);

    try {
      let outputData: Uint8Array;

      if (settings.mode === 'lossless') {
        setProgressMsg('PDF内部のメタデータ削除、ストリームテーブルの構築中...');
        outputData = await compressPDFLossless(file.data);
      } else {
        // Lossy JPG rasterization mode
        outputData = await compressPDFLossy(
          file.data,
          settings.dpi,
          settings.quality,
          (curr, tot) => {
            setProgressMsg(`各ページの再ラスタライズを実行中： ${curr} / ${tot} ページ`);
          }
        );
      }

      // Check if outputData actually generated
      if (outputData.length === 0) {
        throw new Error('圧縮結果が空です。モードを変更して試してください。');
      }

      const blob = new Blob([outputData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setCompressedResult({
        data: outputData,
        size: outputData.length,
        downloadUrl: url
      });
    } catch (err: any) {
      console.error(err);
      setError('圧縮処理中にエラーが発生しました: ' + (err.message || '不明なエラー'));
    } finally {
      setCompressing(false);
    }
  };

  // Human readable sizes
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSavingsPercent = () => {
    if (!file || !compressedResult) return 0;
    const ratio = (file.size - compressedResult.size) / file.size;
    return Math.round(ratio * 100);
  };

  const handleDownload = () => {
    if (!compressedResult || !file) return;
    const link = document.createElement('a');
    link.href = compressedResult.downloadUrl;
    
    const originalName = file.name.endsWith('.pdf') ? file.name.slice(0, -4) : file.name;
    link.download = `${originalName}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setFile(null);
    setCompressedResult(null);
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      
      {/* Title Header */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-teal-600 animate-pulse" />
            PDF 圧縮
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            画質を保ちながら内部構造をリフレッシュ、またはJPEG画質再加工でデータを超軽量化。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>{error}</div>
        </div>
      )}

      {/* 1. Upload Phase */}
      {!file && (
        <div
          id="dropzone-compress"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center hover:border-teal-500/50 hover:bg-teal-500/[0.005] cursor-pointer transition-all duration-300 shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <div className="mb-4 rounded-full bg-teal-50 p-4 text-teal-600 transition-transform group-hover:scale-105 duration-300">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg">
            PDF ファイルをここにドロップしてください
          </h3>
          <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
            またはクリックしてファイルシステムからアップロード &bull; 100% 機密保証
          </p>
          <div className="mt-6 inline-flex rounded-lg bg-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs group-hover:bg-teal-600 transition-colors">
            ファイルを選択
          </div>
        </div>
      )}

      {/* 2. Setup & Settings Phase */}
      {file && !compressedResult && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* File Card info (Left) */}
          <div className="md:col-span-1 flex flex-col justify-between bg-white rounded-2xl border border-gray-100 p-6 shadow-xs">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                  元のドキュメント
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 text-xs">
                <div>
                  <span className="block text-gray-400">ファイルサイズ</span>
                  <span className="font-semibold text-gray-900 font-mono">{formatSize(file.size)}</span>
                </div>
                <div>
                  <span className="block text-gray-400">総ページ数</span>
                  <span className="font-semibold text-gray-900 font-mono">{file.pageCount} ページ</span>
                </div>
              </div>
            </div>

            <button
              id="btn-re-upload"
              onClick={resetAll}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 py-2.5 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              別のファイルを選択
            </button>
          </div>

          {/* Compression Configuration (Right) */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="font-display font-bold text-gray-950 text-lg flex items-center gap-2 mb-4">
                <Sliders className="h-5 w-5 text-teal-500" />
                圧縮設定の選択
              </h3>

              {/* Compression Mode choice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                
                {/* Lossless Selector */}
                <button
                  id="compress-mode-lossless"
                  type="button"
                  onClick={() => setSettings({ ...settings, mode: 'lossless' })}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    settings.mode === 'lossless'
                      ? 'border-teal-500 bg-teal-500/[0.02] ring-2 ring-teal-500/10'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="font-bold text-gray-950 text-sm">ロスレス圧縮（無劣化）</span>
                  <span className="text-xs text-gray-400 mt-1 leading-relaxed">
                    フォントや画質を変えずにプログラムデータ最適化のみを行います。公式書面に最適。
                  </span>
                </button>

                {/* Lossy Selector */}
                <button
                  id="compress-mode-lossy"
                  type="button"
                  onClick={() => setSettings({ ...settings, mode: 'lossy' })}
                  className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    settings.mode === 'lossy'
                      ? 'border-teal-500 bg-teal-500/[0.02] ring-2 ring-teal-500/10'
                      : 'border-gray-100 hover:border-gray-200 bg-white'
                  }`}
                >
                  <span className="font-bold text-gray-950 text-sm">セービング圧縮（JPEG画質削減）</span>
                  <span className="text-xs text-gray-400 mt-1 leading-relaxed">
                    PDFを各ページ再描画して、画質や解像度を少しトリミングします。スキャナ文書や写真用に最適。
                  </span>
                </button>

              </div>

              {/* Advanced sliders if Lossy Mode selected */}
              {settings.mode === 'lossy' && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100/60 space-y-5 animate-slide-in">
                  
                  {/* Quality slider */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">JPEG 圧縮画質</span>
                      <span className="font-mono bg-teal-100/60 text-teal-700 px-2 py-0.5 rounded font-bold">
                        {Math.round(settings.quality * 100)}%
                      </span>
                    </div>
                    <input
                      id="input-quality-slider"
                      type="range"
                      min="0.2"
                      max="0.95"
                      step="0.05"
                      value={settings.quality}
                      onChange={(e) => setSettings({ ...settings, quality: parseFloat(e.target.value) })}
                      className="w-full accent-teal-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>超軽量 (20%)</span>
                      <span>標準バランス (70%)</span>
                      <span>高画質 (95%)</span>
                    </div>
                  </div>

                  {/* DPI Slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700">ラスタライズ解像度（DPI）</span>
                      <span className="font-mono bg-teal-100/60 text-teal-700 px-2 py-0.5 rounded font-bold">
                        {settings.dpi} DPI
                      </span>
                    </div>
                    <input
                      id="input-dpi-slider"
                      type="range"
                      min="72"
                      max="200"
                      step="5"
                      value={settings.dpi}
                      onChange={(e) => setSettings({ ...settings, dpi: parseInt(e.target.value, 10) })}
                      className="w-full accent-teal-600 h-1.5 bg-gray-200 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400">
                      <span>Web閲覧用 (72 DPI)</span>
                      <span>ドキュメント推奨 (120 DPI)</span>
                      <span>印刷良好 (200 DPI)</span>
                    </div>
                  </div>

                  {file && file.size > 10 * 1024 * 1024 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3.5 text-amber-800 text-xs flex items-start gap-2.5 leading-relaxed">
                      <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-amber-500 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">大容量ファイル（{formatSize(file.size)}）の処理について:</span>
                        セービング圧縮はブラウザ上（100%クライアントサイド）ですべてのページを画像化して結合するため、メモリ空き容量によっては処理に数十秒かかるか、ブラウザがフリーズする場合があります。正常に動作しない場合は、超高速かつ安全な「ロスレス圧縮（無劣化）」モードを使用してください。
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Execute trigger button */}
            <button
              id="btn-run-compress"
              disabled={compressing}
              onClick={triggerCompression}
              className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white cursor-pointer transition-colors shadow-xs ${
                compressing 
                  ? 'bg-teal-500/50 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
              }`}
            >
              {compressing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>{progressMsg}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>ファイルを圧縮する (100%ローカル)</span>
                </>
              )}
            </button>
          </div>

        </div>
      )}

      {/* 3. Output / Finished Phase */}
      {compressedResult && file && (
        <div className="bg-white rounded-3xl border border-teal-500/20 p-8 text-center space-y-8 shadow-premium animate-fade-in">
          
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
              <CheckCircle className="h-10 w-10" />
            </div>
            <h3 className="font-display text-2.5xl font-extrabold text-gray-950">
              圧縮が完了しました！
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              PDFの再構築とインデックスの最適化処理を完了。あなたの機密データは安全にローカルで維持されています。
            </p>
          </div>

          {/* Size Comparison Card */}
          <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-5 border border-gray-100 flex items-center justify-around">
            <div className="text-left">
              <span className="block text-xs text-gray-400 font-semibold mb-1">元のサイズ</span>
              <span className="block font-mono text-base font-bold text-gray-500 line-through">
                {formatSize(file.size)}
              </span>
            </div>
            <ArrowRight className="h-5 w-5 text-gray-300" />
            <div className="text-left">
              <span className="block text-xs text-teal-600 font-semibold mb-1">圧縮後のサイズ</span>
              <span className="block font-mono text-xl font-black text-teal-600">
                {formatSize(compressedResult.size)}
              </span>
            </div>
            <div className="bg-teal-500 text-white rounded-xl px-3.5 py-1.5 text-center font-bold">
              <span className="block text-[9px] uppercase tracking-wider opacity-90 leading-tight">削減率</span>
              <span className="block text-base leading-none font-mono">
                {getSavingsPercent() > 0 ? `-${getSavingsPercent()}%` : '0%'}
              </span>
            </div>
          </div>

          {getSavingsPercent() < 0 && (
            <div className="max-w-md mx-auto bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-700 flex items-start gap-1.5 text-left">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                圧縮後のサイズが大きくなりました。元のPDFはすでに高度に圧縮されているか、ロスレス最適化が追加ストリームを構築したためです。「画質再圧縮」モードでの処理をお試しください。
              </span>
            </div>
          )}

          {/* Download & Actions Buttons */}
          <div className="max-w-xs mx-auto flex flex-col gap-3">
            <button
              id="btn-download-compressed"
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 py-3.5 text-sm font-bold text-white shadow-xs hover:shadow-glow cursor-pointer transition-all"
            >
              <Download className="h-4 w-4" />
              <span>ダウンロード保存</span>
            </button>
            
            <button
              id="btn-re-compress"
              onClick={resetAll}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 py-2.5 text-xs font-bold text-gray-500 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              もう一度圧縮する
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
