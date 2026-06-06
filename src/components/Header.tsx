/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, ArrowLeft, Layers, Columns, RotateCw, Sparkles, FileText } from 'lucide-react';
import { PDFTool } from '../types';

interface HeaderProps {
  currentTool: PDFTool;
  onSelectTool: (tool: PDFTool) => void;
}

export default function Header({ currentTool, onSelectTool }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Home Button */}
        <button
          id="btn-goto-home"
          onClick={() => onSelectTool(PDFTool.NONE)}
          className="flex items-center space-x-2.5 group text-left cursor-pointer transition-all focus:outline-none"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600/10 text-teal-600 transition-colors group-hover:bg-teal-600 group-hover:text-white">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block font-display text-lg font-bold tracking-tight text-gray-900 leading-tight">
              Privacy PDF <span className="text-teal-600 font-medium">Toolkit</span>
            </span>
          </div>
        </button>

        {/* Global Security Pill Indicator */}
        <div className="hidden md:flex items-center space-x-1.5 rounded-full bg-teal-50 px-3.5 py-1.5 text-xs font-semibold text-teal-700 border border-teal-100/60 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
          </span>
          <span className="font-sans">100% ローカルブラウザ処理 (サーバー送信なし)</span>
        </div>

        {/* Navigation Actions */}
        <nav className="flex items-center space-x-1">
          {currentTool !== PDFTool.NONE ? (
            <button
              id="header-back-home"
              onClick={() => onSelectTool(PDFTool.NONE)}
              className="flex items-center space-x-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>ホームに戻る</span>
            </button>
          ) : (
            <div className="flex space-x-0.5 sm:space-x-1">
              <button
                id="nav-compress"
                onClick={() => onSelectTool(PDFTool.COMPRESS)}
                className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-colors"
              >
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span className="hidden sm:inline">PDF圧縮</span>
              </button>
              <button
                id="nav-merge"
                onClick={() => onSelectTool(PDFTool.MERGE)}
                className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-colors"
              >
                <Layers className="h-4 w-4 text-blue-500" />
                <span className="hidden sm:inline">PDF結合</span>
              </button>
              <button
                id="nav-split"
                onClick={() => onSelectTool(PDFTool.SPLIT)}
                className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-colors"
              >
                <Columns className="h-4 w-4 text-amber-500" />
                <span className="hidden sm:inline">PDF分割</span>
              </button>
              <button
                id="nav-rotate"
                onClick={() => onSelectTool(PDFTool.ROTATE)}
                className="flex items-center space-x-1.5 rounded-lg px-2.5 py-1.5 sm:px-3 text-xs sm:text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:text-teal-600 transition-colors"
              >
                <RotateCw className="h-4 w-4 text-purple-500" />
                <span className="hidden sm:inline">PDF回転</span>
              </button>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}
