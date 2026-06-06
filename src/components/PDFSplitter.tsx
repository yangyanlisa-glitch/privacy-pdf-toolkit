/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, Columns, RefreshCw, Download, AlertTriangle, HelpCircle, File } from 'lucide-react';
import { PDFFile } from '../types';
import { splitPDF, splitAllPages } from '../pdfUtils';

export default function PDFSplitter() {
  const [file, setFile] = useState<PDFFile | null>(null);
  const [splitting, setSplitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Settings
  const [splitMode, setSplitMode] = useState<'range' | 'all'>('range');
  const [pageRange, setPageRange] = useState<string>('1-2');

  // Results types
  const [rangeResult, setRangeResult] = useState<{
    data: Uint8Array;
    size: number;
    downloadUrl: string;
  } | null>(null);

  const [allPagesResult, setAllPagesResult] = useState<{
    name: string;
    size: number;
    downloadUrl: string;
    pageNo: number;
  }[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    resetResults();
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

      setFile({
        id: Math.random().toString(),
        name: selectedFile.name,
        size: selectedFile.size,
        data: uint8Array,
        pageCount: pageCount
      });

      // Provide sensible default range e.g. "1-2" or "1" depending on pages
      if (pageCount >= 2) {
        setPageRange(`1-2`);
      } else {
        setPageRange(`1`);
      }

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
      resetResults();
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

        setFile({
          id: Math.random().toString(),
          name: selectedFile.name,
          size: selectedFile.size,
          data: uint8Array,
          pageCount: pageCount
        });

        if (pageCount >= 2) {
          setPageRange(`1-2`);
        } else {
          setPageRange(`1`);
        }
      } catch (err) {
        setError('PDFファイルの読み込みに失敗しました。');
      }
    }
  };

  const resetResults = () => {
    setRangeResult(null);
    setAllPagesResult([]);
  };

  // Execution triggers
  const triggerSplit = async () => {
    if (!file) return;
    setSplitting(true);
    setError(null);
    resetResults();

    try {
      if (splitMode === 'range') {
        const outputBytes = await splitPDF(file.data, pageRange);
        const blob = new Blob([outputBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        setRangeResult({
          data: outputBytes,
          size: outputBytes.length,
          downloadUrl: url
        });
      } else {
        // Extract all pages separately
        const splitList = await splitAllPages(file.data, file.name);
        const formats = splitList.map((item, idx) => {
          const b = new Blob([item.data], { type: 'application/pdf' });
          return {
            name: item.name,
            size: item.data.length,
            downloadUrl: URL.createObjectURL(b),
            pageNo: idx + 1
          };
        });
        setAllPagesResult(formats);
      }
    } catch (err: any) {
      setError(err.message || '分割処理中にエラーが発生しました。入力範囲を確認してください。');
    } finally {
      setSplitting(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadRange = () => {
    if (!rangeResult || !file) return;
    const link = document.createElement('a');
    link.href = rangeResult.downloadUrl;
    const cleanB = file.name.endsWith('.pdf') ? file.name.slice(0, -4) : file.name;
    link.download = `${cleanB}_extracted.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetAll = () => {
    setFile(null);
    resetResults();
    setError(null);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      
      {/* Header */}
      <div className="mb-8 flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-black text-gray-950 flex items-center gap-2">
            <Columns className="h-7 w-7 text-amber-500 animate-pulse" />
            PDF 分割・抽出
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            特定のページ範囲を抜き出して新しいPDFに保存、または全ページを個別のPDFへと切り出します。
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200/80 p-4 text-sm text-red-700 flex items-start gap-3 text-left">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Phase */}
      {!file && (
        <div
          id="dropzone-split"
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white px-6 py-16 text-center hover:border-amber-500/50 hover:bg-amber-500/[0.005] cursor-pointer transition-all duration-300 shadow-xs"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf"
            className="hidden"
          />
          <div className="mb-4 rounded-full bg-amber-50 p-4 text-amber-500 transition-transform group-hover:scale-105 duration-300">
            <Upload className="h-8 w-8" />
          </div>
          <h3 className="font-display font-bold text-gray-900 text-lg">
            PDF ファイルをここにドロップしてください
          </h3>
          <p className="text-sm text-gray-400 mt-1.5 max-w-sm">
            またはクリックしてファイルシステムからアップロード &bull; 100% 機密保持
          </p>
          <div className="mt-6 inline-flex rounded-lg bg-amber-500 px-4 py-2.5 text-xs font-bold text-white shadow-xs group-hover:bg-amber-600 transition-colors">
            ファイルを選択
          </div>
        </div>
      )}

      {file && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* File Card Info Left Pane */}
          <div className="md:col-span-1 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between h-fit space-y-6">
            <div className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 truncate" title={file.name}>
                  {file.name}
                </h4>
                <p className="text-xs text-gray-400 font-mono mt-0.5 uppercase tracking-wider">
                  分割元のファイル
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
              id="btn-reupload-split"
              onClick={resetAll}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 py-2.5 text-xs font-bold text-gray-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              別ファイルを選択
            </button>
          </div>

          {/* Splitting Controller and Settings Right Panel */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-xs flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              <h3 className="font-display font-bold text-gray-950 text-lg flex items-center gap-1.5 pb-2">
                分割方法の設定
              </h3>

              {/* Tab options splitMode selector */}
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button
                  id="tab-split-range"
                  type="button"
                  onClick={() => { setSplitMode('range'); resetResults(); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    splitMode === 'range'
                      ? 'bg-white shadow-xs text-amber-600 border-b border-gray-100'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  ページ範囲の指定
                </button>
                <button
                  id="tab-split-all"
                  type="button"
                  onClick={() => { setSplitMode('all'); resetResults(); }}
                  className={`py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    splitMode === 'all'
                      ? 'bg-white shadow-xs text-amber-600 border-b border-gray-100'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  全ページ個別に切り出し
                </button>
              </div>

              {/* Sub controllers customized for selection */}
              {splitMode === 'range' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label id="lbl-page-range" className="block text-xs font-bold text-gray-700">
                      抽出するページ番号（半角）
                    </label>
                    <input
                      id="input-page-range"
                      type="text"
                      value={pageRange}
                      onChange={(e) => { setPageRange(e.target.value); setRangeResult(null); }}
                      placeholder="例: 1-3, 5, 8-10"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 placeholder:text-gray-400 text-sm font-semibold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/10 transition-all font-mono"
                    />
                  </div>

                  {/* Context helpers */}
                  <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/40 text-xs text-amber-800 space-y-2 leading-relaxed">
                    <h5 className="font-bold flex items-center gap-1">
                      <HelpCircle className="h-3.5 w-3.5" />
                      指定方法のガイド
                    </h5>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>ハイフンで繋いで<b>範囲指定</b>（例 <code>1-3</code> &rarr; 1, 2, 3ページ）</li>
                      <li>カンマで区切って<b>複数指定</b>（例 <code>1,4</code> &rarr; 1ページと4ページ）</li>
                      <li>合成例: <code>1-2, 4-4, 5</code> (総ページ <code>{file.pageCount}</code> 以下の半角数値のみ有効)</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-100/40 text-xs text-amber-800 space-y-2 leading-relaxed">
                  <h5 className="font-bold flex items-center gap-1.5">
                    <Columns className="h-4 w-4" />
                    個別抽出の特徴
                  </h5>
                  <p>
                    このモードでは、アップロードされた全 <b>{file.pageCount} ページ</b>をそれぞれ1ページ構成の独立した単体PDFへと分解します。
                  </p>
                  <p className="text-gray-500">
                    ※ 処理が終わり次第、ページごとの個別ダウンロードカードが生成され、必要なページだけを選んでダウンロード保存できます。
                  </p>
                </div>
              )}

            </div>

            {/* Execute CTA */}
            <div className="space-y-4">
              <button
                id="btn-run-split"
                disabled={splitting || (splitMode === 'range' && !pageRange.trim())}
                onClick={triggerSplit}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-colors cursor-pointer shadow-xs ${
                  splitting 
                    ? 'bg-amber-500/50 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600'
                }`}
              >
                {splitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>PDF分割計算を実行中...</span>
                  </>
                ) : (
                  <>
                    <Columns className="h-4 w-4" />
                    <span>PDF分割を実行する</span>
                  </>
                )}
              </button>

              {/* CASE A: Range Result completed */}
              {rangeResult && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-center space-y-4 animate-fade-in">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-800 font-bold">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>指定範囲の抽出に成功 ({formatSize(rangeResult.size)})</span>
                  </div>
                  
                  <button
                    id="btn-download-range"
                    onClick={handleDownloadRange}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer animate-pulse"
                  >
                    <Download className="h-4 w-4" />
                    <span>抽出したPDFを保存</span>
                  </button>
                </div>
              )}

              {/* CASE B: All Pages array completed */}
              {allPagesResult.length > 0 && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">個別抽出ページ一覧 ({allPagesResult.length}個)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">完了</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {allPagesResult.map((pResult, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <File className="h-4 w-4 text-amber-500 shrink-0" />
                          <div className="truncate text-left text-xs leading-none">
                            <span className="font-bold text-gray-900 block truncate">
                              ページ {pResult.pageNo}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono block mt-1">
                              {formatSize(pResult.size)}
                            </span>
                          </div>
                        </div>

                        <a
                          id={`dl-link-page-${pResult.pageNo}`}
                          href={pResult.downloadUrl}
                          download={pResult.name}
                          className="p-1 px-2 text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded-md hover:bg-teal-100 transition-colors shrink-0"
                        >
                          ダウンロード
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
