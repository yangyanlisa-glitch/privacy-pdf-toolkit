/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, HardDrive, Heart, Network, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useState } from 'react';
import { SEO_PAGES } from '../seoData';

export default function Footer() {
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = (slug: string) => {
    window.history.pushState(null, '', `/${slug}`);
    // Trigger popstate so that App.tsx receives the update and renders SEORouter
    window.dispatchEvent(new Event('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Group pages by category for exceptional navigation experience
  const compressPages = Object.values(SEO_PAGES).filter(p => p.category === 'compress');
  const mergePages = Object.values(SEO_PAGES).filter(p => p.category === 'merge');
  const splitPages = Object.values(SEO_PAGES).filter(p => p.category === 'split');
  const rotatePages = Object.values(SEO_PAGES).filter(p => p.category === 'rotate');
  const generalPages = Object.values(SEO_PAGES).filter(p => p.category === 'general');

  return (
    <footer className="w-full bg-white border-t border-gray-100 py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-100/80">
          
          {/* Column 1: Guarantee */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-sm tracking-wide uppercase">
              <ShieldCheck className="h-5 w-5" />
              <span>100% 機密保持保証</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed text-justify">
              当サイトにアップロードされたPDFファイルが、外部のサーバーにアップロードされることはありません。すべてのデータはあなたのブラウザの一時メモリ内のみで処理され、閉じると消滅します。
            </p>
          </div>

          {/* Column 2: Tech Specs */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-sm tracking-wide uppercase">
              <HardDrive className="h-5 w-5" />
              <span>ブラウザ完結テクノロジー</span>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed text-justify">
              最新の WebAssembly および JavaScript エンジン（pdf-lib, pdf.js）をブラウザ上で実行することにより、高速かつ完全なローカル処理を実現しています。オフライン環境でも動作可能です。
            </p>
          </div>

          {/* Column 3: Tagline */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-sm tracking-wide uppercase">
              <Network className="h-5 w-5" />
              <span>クラウドサーバー不要</span>
            </div>
            <p className="text-sm text-gray-900 font-medium font-display leading-normal italic">
              "Your PDFs never leave your machine."
            </p>
            <p className="text-xs text-gray-400 text-justify">
              社外秘資料、契約書、財務諸表など、絶対に社外へ流出させたくない極秘文書も、安心して編集・最適化できます。
            </p>
          </div>

        </div>

        {/* 50 SEO Landing Pages Dynamic Directory Accordion */}
        <div className="py-6 border-b border-gray-100/80" id="compliance-seo-directory">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between text-xs font-mono font-bold text-gray-500 hover:text-teal-700 transition-colors uppercase tracking-wider py-1"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-teal-600" />
              <span>🔒 業界・目的別 本格セキュリティPDFリファレンス (全50ページ)</span>
            </div>
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {isOpen && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 text-xs text-gray-500 pt-4 border-t border-gray-100/40">
              
              {/* Box 1: Compress Modules (20 Links) */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-800 text-xxs uppercase tracking-wider text-teal-700">1. 安全圧縮ソリューション</h4>
                <div className="flex flex-col gap-1.5 pl-1.5 border-l border-teal-100">
                  {compressPages.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => handleLinkClick(p.slug)}
                      className="text-left hover:text-teal-600 hover:underline truncate"
                      title={p.title}
                    >
                      {p.keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 2: Merge Modules */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-800 text-xxs uppercase tracking-wider text-teal-700">2. 合算結合・結合</h4>
                <div className="flex flex-col gap-1.5 pl-1.5 border-l border-teal-100">
                  {mergePages.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => handleLinkClick(p.slug)}
                      className="text-left hover:text-teal-600 hover:underline truncate"
                      title={p.title}
                    >
                      {p.keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 3: Split Modules */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-800 text-xxs uppercase tracking-wider text-teal-700">3. 分割・安全抽出</h4>
                <div className="flex flex-col gap-1.5 pl-1.5 border-l border-teal-100">
                  {splitPages.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => handleLinkClick(p.slug)}
                      className="text-left hover:text-teal-600 hover:underline truncate"
                      title={p.title}
                    >
                      {p.keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 4: Rotate Modules */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-800 text-xxs uppercase tracking-wider text-teal-700">4. 整合回転リライナ</h4>
                <div className="flex flex-col gap-1.5 pl-1.5 border-l border-teal-100">
                  {rotatePages.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => handleLinkClick(p.slug)}
                      className="text-left hover:text-teal-600 hover:underline truncate"
                      title={p.title}
                    >
                      {p.keyword}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box 5: General & Compliance */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-gray-800 text-xxs uppercase tracking-wider text-teal-700">5. 規律コンプライアンス</h4>
                <div className="flex flex-col gap-1.5 pl-1.5 border-l border-teal-100">
                  {generalPages.map(p => (
                    <button
                      key={p.slug}
                      onClick={() => handleLinkClick(p.slug)}
                      className="text-left hover:text-teal-600 hover:underline truncate"
                      title={p.title}
                    >
                      {p.keyword}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-4">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-gray-600">Privacy PDF Toolkit</span>
            <span>&copy; 100% Browser Native &bull; Open-source Engine</span>
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by react-native, fully client-side</span>
            <Heart className="h-3.5 w-3.5 text-teal-500 fill-teal-500" />
            <span>&bull; Cloudflare Pages ready design.</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
