/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { 
  Sparkles, 
  Layers, 
  Columns, 
  RotateCw, 
  ShieldCheck, 
  WifiOff, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  ChevronDown,
  Lock
} from 'lucide-react';
import { PDFTool } from '../types';
import { useState } from 'react';

interface LandingPageProps {
  onSelectTool: (tool: PDFTool) => void;
}

export default function LandingPage({ onSelectTool }: LandingPageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toolsList = [
    {
      id: PDFTool.COMPRESS,
      title: 'PDF 圧縮',
      enTitle: 'Compress PDF',
      description: 'ファイル構造の最適化（ロスレス）または、画像データの解像度/品質のトリミング（ロスモード）の2種類から選んで、PDF容量を最小限に軽量化します。',
      icon: <Sparkles className="h-6 w-6 text-teal-600" />,
      color: 'bg-teal-500/10 text-teal-700 hover:border-teal-400 group-hover:bg-teal-600 group-hover:text-white',
      badge: '最適化'
    },
    {
      id: PDFTool.MERGE,
      title: 'PDF 結合',
      enTitle: 'Merge PDF',
      description: '複数のPDFファイルをドラッグ＆ドロップで追加し、任意の順番に素早く並び替え、1つのシームレスなPDFドキュメントへと結合します。ファイル間ページの繋ぎ合わせに。',
      icon: <Layers className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-500/10 text-blue-700 hover:border-blue-400 group-hover:bg-blue-600 group-hover:text-white',
      badge: 'ドキュメント連結'
    },
    {
      id: PDFTool.SPLIT,
      title: 'PDF 分割',
      enTitle: 'Split PDF',
      description: '単一のPDFから指定したページ範囲（例：1-3, 5）を取得して新しいPDFとして抽出、または、全ページを個別のPDFファイルへと切り分けます。',
      icon: <Columns className="h-6 w-6 text-amber-500" />,
      color: 'bg-amber-500/10 text-amber-700 hover:border-amber-400 group-hover:bg-amber-600 group-hover:text-white',
      badge: 'ページ抽出'
    },
    {
      id: PDFTool.ROTATE,
      title: 'PDF 回転',
      enTitle: 'Rotate PDF',
      description: 'スキャン時の向き間違い。特定のページ、もしくはすべてのページを時計回り・反時計回り、180度自由自在に回転させて、正しい向きで保存し直します。',
      icon: <RotateCw className="h-6 w-6 text-purple-500" />,
      color: 'bg-purple-500/10 text-purple-700 hover:border-purple-400 group-hover:bg-purple-600 group-hover:text-white',
      badge: '方向修正'
    }
  ];

  const valueProps = [
    {
      icon: <Lock className="h-10 w-10 text-teal-600" />,
      title: '100% サーバレス・高セキュリティ',
      desc: 'すべてのPDF処理（描画、結合、分割、圧縮、回転）はあなたのパソコンのローカルブラウザ環境のみで処理されます。外部サーバへ1バイトもファイルが送信されないため、個人情報や機密資料が流出する恐れは一切ありません。'
    },
    {
      icon: <WifiOff className="h-10 w-10 text-teal-600" />,
      title: 'オフラインでの動作対応',
      desc: '一度このWEBサイトを開いてしまえば、インターネット接続を切断した完全オフライン環境であっても、すべてのPDF機能（圧縮・結合・分割・回転）が全く同じ速度で正常に利用可能です。'
    },
    {
      icon: <Cpu className="h-10 w-10 text-teal-600" />,
      title: '高速な WebAssembly 処理',
      desc: '強力なクライアントサイドPDFライブラリ（pdf-lib/pdf.js）が直接V8エンジンのネイティブメモリ内で計算処理を行います。大容量のPDFでも待たされることなく、一瞬でコンパイル・保存が完了します。'
    }
  ];

  const faqs = [
    {
      q: 'セキュリティの仕組みについて教えてください。ファイルは本当に安全ですか？',
      a: 'はい、完全に安全です。一般の無料PDF変換サイトは、裏であなたのファイルを運営者のクラウドサーバーへアップロードし、変換処理を代行しています。これは情報漏洩のリスクを伴います。Privacy PDF Toolkitはサーバー送信を行わず、ブラウザのJavaScriptメモリ上ですべてのバイナリパースを行います。ご不安な場合は、サイトのロード後にインターネットを切断（機内モード）して動作を確認してみてください。全く同じように処理が完了します。'
    },
    {
      q: 'PDF圧縮における「ロスレス」と「ロスモード（JPEG再描画）」の違いは何ですか？',
      a: '「ロスレス（無劣化）」は、PDFファイル内の構造化テーブルやメタデータ、不要オブジェクトをクリーンアップし、PDFのバイト構造的な重複を最適化する手法です。文字の鮮明さや画質は完全に維持されます。「ロスモード」は、PDFの各ページを極小サイズのJPEG形式に変換してパッケージし直す手法で、特にスキャンされた数十MB単位の重い資料や領収書セットを数MBの持ち運び用PDFへと劇的に軽量化する際に効果を発揮します。'
    },
    {
      q: '対応しているブラウザやデバイスに制限はありますか？',
      a: 'Google Chrome, Apple Safari, Microsoft Edge, Mozilla FirefoxなどのHTML5標準に準拠したあらゆるモダンブラウザに対応しています。PCだけでなく、iPhoneやiPad、Androidスマートフォンでも100%ローカルかつ高速に動作可能です。'
    },
    {
      q: 'Cloudflare Pagesへ公開可能とありますが、どのような構成ですか？',
      a: '本システムは完全に静的なSPA（シングルページアプリケーション）としてViteとReact 19によりコンパイルされます。そのため、NodeJS backendを走らせる必要がなく、Cloudflare PagesやGitHub Pages、Vercelなどの超高速CDNサーバーへドラッグ＆ドロップ、もしくはgit pushするだけで直接グローバルデプロイが可能です。'
    }
  ];

  // Animation constants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 sm:py-16">
      
      {/* Dynamic Slogan / Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 mb-16 sm:mb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center space-x-1.5 rounded-full bg-teal-50 px-4 py-1.5 text-xs font-bold text-teal-700 border border-teal-100"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>サーバー送信なし &bull; 100% 端末内で処理する PDF ツール</span>
        </motion.div>

        {/* The required headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-6xl font-black text-gray-950 tracking-tight leading-[1.1] text-balance"
        >
          Your PDFs <span className="relative inline-block text-transparent bg-clip-text bg-linear-to-r from-teal-600 to-emerald-600">never leave</span> your machine.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto font-light"
        >
          クラウドに個人や機密書類のデータをアップロードしていませんか？ Privacy PDF Toolkit は、すべての編集処理を完全にあなたのローカルブラウザ内で完結させる、究極の機密保持ツールです。
        </motion.p>
      </div>

      {/* Main Toolkit Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-24 sm:mb-32"
      >
        {toolsList.map((tool) => (
          <motion.div
            key={tool.id}
            variants={itemVariants}
            className="group relative flex flex-col justify-between rounded-2xl bg-white border border-gray-100/90 p-6 sm:p-8 hover:border-teal-500/30 hover:shadow-premium cursor-pointer transition-all-custom"
            onClick={() => onSelectTool(tool.id)}
            id={`tool-card-${tool.id.toLowerCase()}`}
          >
            {/* Background Glow accent */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/0 via-transparent to-teal-500/0 opacity-0 group-hover:opacity-100 group-hover:from-teal-500/[0.01] group-hover:to-teal-500/[0.02] transition-opacity duration-300 pointer-events-none" />
            
            <div className="z-10">
              <div className="flex items-center justify-between mb-5">
                <div className={`p-3 rounded-xl transition-colors duration-300 flex items-center justify-center ${tool.color}`}>
                  {tool.icon}
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2.5 py-1 rounded-md tracking-wider">
                  {tool.badge}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-gray-950 mb-2 group-hover:text-teal-600 transition-colors">
                {tool.title}
                <span className="block mt-0.5 text-xs font-mono text-gray-400 uppercase tracking-widest group-hover:text-teal-500 transition-colors">
                  {tool.enTitle}
                </span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-sans mt-3">
                {tool.description}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-50/80 flex items-center text-xs font-semibold text-teal-600 group-hover:text-teal-700 transition-colors">
              <span className="mr-1">今すぐツールを開く</span>
              <span className="transition-transform group-hover:translate-x-1 duration-300">&rarr;</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Structural Value Propositions */}
      <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 mb-24 sm:mb-32 border border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <h2 className="font-display text-2.5xl sm:text-3xl font-extrabold text-gray-950">
            どうしてローカルブラウザ処理なのか？
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            従来のオンラインPDF変換サービスと比べた時の大きな優位性
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueProps.map((prop, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100/60 shadow-xs flex flex-col space-y-4">
              <div className="flex bg-teal-50/80 h-14 w-14 items-center justify-center rounded-2xl">
                {prop.icon}
              </div>
              <h4 className="font-display font-bold text-gray-900 text-lg">
                {prop.title}
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">
                {prop.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion SEO FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16 sm:mb-24">
        <div className="text-center mb-10">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-teal-50 text-teal-600 mb-3">
            <HelpCircle className="h-5 w-5" />
          </div>
          <h2 className="font-display text-2.5xl sm:text-3xl font-extrabold text-gray-950">
            よくある質問と安全性への配慮 (FAQ)
          </h2>
          <p className="text-sm text-gray-500 mt-1">信頼性と動作環境に関する技術詳細</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-300"
              >
                <button
                  id={`faq-btn-${index}`}
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-gray-900 font-semibold focus:outline-none hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-display pr-4 text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
                </button>
                <div 
                  className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-96 opacity-100 border-t border-gray-50 bg-gray-50/30' : 'max-h-0 opacity-0 pointer-events-none'
                  }`}
                >
                  <div className="p-5 text-sm text-gray-600 leading-relaxed space-y-2">
                    <p>{faq.a}</p>
                    <div className="flex items-center space-x-1.5 text-xs text-teal-600 font-bold mt-3">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>100% 端末内で実行。漏洩の心配なし。</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
