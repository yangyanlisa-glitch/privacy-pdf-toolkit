/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { PDFTool } from './types';
import Header from './components/Header';
import LandingPage from './components/LandingPage';
import PDFCompressor from './components/PDFCompressor';
import PDFMerger from './components/PDFMerger';
import PDFSplitter from './components/PDFSplitter';
import PDFRotator from './components/PDFRotator';
import Footer from './components/Footer';
import SEORouter from './components/SEORouter';
import { SEO_PAGES } from './seoData';

export default function App() {
  const [currentTool, setCurrentTool] = useState<PDFTool>(PDFTool.NONE);
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const slug = currentPath.replace(/^\//, '');
  const isSEOPage = SEO_PAGES[slug] !== undefined;

  const handleSelectTool = (tool: PDFTool) => {
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
    }
    setCurrentTool(tool);
  };

  const handleNavigateHome = () => {
    if (window.location.pathname !== '/') {
      window.history.pushState(null, '', '/');
      setCurrentPath('/');
    }
    setCurrentTool(PDFTool.NONE);
  };

  const renderToolComponent = () => {
    if (isSEOPage) {
      return (
        <SEORouter
          currentPath={currentPath}
          onNavigateHome={handleNavigateHome}
          onSelectTool={handleSelectTool}
        />
      );
    }

    switch (currentTool) {
      case PDFTool.COMPRESS:
        return <PDFCompressor />;
      case PDFTool.MERGE:
        return <PDFMerger />;
      case PDFTool.SPLIT:
        return <PDFSplitter />;
      case PDFTool.ROTATE:
        return <PDFRotator />;
      case PDFTool.NONE:
      default:
        return <LandingPage onSelectTool={handleSelectTool} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafafa] selection:bg-teal-500/15 selection:text-teal-800">
      
      {/* Visual background atmospheric mesh */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-radial-to-b from-teal-500/[0.025] to-transparent pointer-events-none" />

      {/* Header element */}
      <Header currentTool={isSEOPage ? PDFTool.NONE : currentTool} onSelectTool={handleSelectTool} />

      {/* Main Content Pane with Animated Presence Viewports */}
      <main className="flex-grow relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={isSEOPage ? currentPath : currentTool}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderToolComponent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer element */}
      <Footer />

    </div>
  );
}
