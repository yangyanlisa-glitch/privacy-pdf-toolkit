/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */

import React, { useEffect, useState } from 'react';
import { SEO_PAGES, compileSEOArticleContent, SEOPageData } from '../seoData';
import { Shield, BookOpen, ChevronRight, FileText, CheckCircle2, AlertCircle, RefreshCw, Layers, RotateCw, ArrowLeft, Star } from 'lucide-react';
import { PDFTool } from '../types';

interface SEORouterProps {
  currentPath: string;
  onNavigateHome: () => void;
  onSelectTool: (tool: PDFTool) => void;
}

export default function SEORouter({ currentPath, onNavigateHome, onSelectTool }: SEORouterProps) {
  // Extract slug from path (e.g. "/secure-pdf-compressor" -> "secure-pdf-compressor")
  const slug = currentPath.replace(/^\//, '');
  const pageData = SEO_PAGES[slug];

  useEffect(() => {
    if (pageData) {
      // 1. Set dynamic page title
      document.title = `${pageData.title} | Privacy PDF Toolkit`;

      // 2. Set dynamic meta description
      let metaDescriptionTag = document.querySelector('meta[name="description"]');
      if (metaDescriptionTag) {
        metaDescriptionTag.setAttribute('content', pageData.metaDescription);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = pageData.metaDescription;
        document.head.appendChild(meta);
      }

      // 3. Update canonical tag
      let canonicalTag = document.querySelector('link[rel="canonical"]');
      const canonicalUrl = `https://privacypdf.pages.dev/${pageData.slug}`;
      if (canonicalTag) {
        canonicalTag.setAttribute('href', canonicalUrl);
      } else {
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonicalUrl;
        document.head.appendChild(link);
      }

      // 4. Inject Dynamic Schema.org JSON-LD for Search Indexing
      const existingSchema = document.getElementById('seo-schema-jsonld');
      if (existingSchema) {
        existingSchema.remove();
      }

      const script = document.createElement('script');
      script.id = 'seo-schema-jsonld';
      script.type = 'application/ld+json';
      
      const faqSchema = pageData ? compileSEOArticleContent(pageData).faqList.map(faq => ({
        "@type": "Question",
        "name": faq.q,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.a
        }
      })) : [];

      const schemaData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": pageData.title,
        "description": pageData.metaDescription,
        "url": canonicalUrl,
        "isPartOf": {
          "@type": "WebSite",
          "name": "Privacy PDF Toolkit",
          "url": "https://privacypdf.pages.dev/"
        },
        "about": {
          "@type": "Thing",
          "name": pageData.keyword,
          "description": `Safe, client-side cryptographic handling utility targeting ${pageData.keyword}`
        },
        "mainEntity": {
          "@type": "FAQPage",
          "mainEntity": faqSchema
        },
        "publisher": {
          "@type": "Organization",
          "name": "Privacy PDF Toolkit Team",
          "logo": {
            "@type": "ImageObject",
            "url": "https://privacypdf.pages.dev/favicon.svg"
          }
        }
      };

      script.innerHTML = JSON.stringify(schemaData, null, 2);
      document.head.appendChild(script);
    }
  }, [pageData]);

  if (!pageData) {
    return (
      <div className="max-w-xl mx-auto my-24 text-center px-4">
        <AlertCircle className="h-16 w-16 text-teal-600 mx-auto mb-6" />
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Resource Not Found</h1>
        <p className="text-gray-500 mb-6">The requested privacy resource could not be located in our secure database.</p>
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Toolkit Dashboard
        </button>
      </div>
    );
  }

  const { intro, professionalContext, technicalMechanism, workflowSteps, secTableTitle, faqList } = compileSEOArticleContent(pageData);

  // Match corresponding interactive tool for Call To Action
  const getToolAction = () => {
    switch (pageData.category) {
      case 'compress':
        return { name: 'Compress PDF Securely', tool: PDFTool.COMPRESS, desc: 'Optimize megabytes without any cloud uploads.' };
      case 'merge':
        return { name: 'Merge PDF Files Securely', tool: PDFTool.MERGE, desc: 'Stitch multipage accounts files with 100% data sovereignty.' };
      case 'split':
        return { name: 'Split PDF Pages Private', tool: PDFTool.SPLIT, desc: 'Extract private chapters and items locally.' };
      case 'rotate':
        return { name: 'Rotate Scans Offline', tool: PDFTool.ROTATE, desc: 'Re-align upside-down portfolios in seconds.' };
      case 'general':
      default:
        return { name: 'Access Complete PDF Toolkit', tool: PDFTool.COMPRESS, desc: 'Experience 100% serverless static tools.' };
    }
  };

  const ctaArg = getToolAction();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16 font-sans">
      
      {/* Search Sitemap Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-xs font-mono text-gray-500" id="seo-breadcrumbs">
        <button onClick={onNavigateHome} className="hover:text-teal-600 font-medium transition-colors">
          Toolkit Home
        </button>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-gray-400">Compliance & Resources</span>
        <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
        <span className="text-teal-600 truncate max-w-xs">{pageData.keyword}</span>
      </nav>

      {/* Hero Visual Title Display */}
      <div className="border-b border-gray-100 pb-8 mb-10">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-500/10 text-teal-800 text-xs font-mono mb-4">
          <Shield className="h-3.5 w-3.5" />
          <span>Industrial Security Level Compliance: {pageData.targetAudience}</span>
        </div>
        <h1 className="text-2xl sm:text-3.5xl md:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight mb-4" id="seo-hero-title">
          {pageData.title}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl font-normal">
          {pageData.metaDescription}
        </p>
      </div>

      {/* Main Column Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Core Content Reading Zone (2 Cols wide) */}
        <div className="md:col-span-2 space-y-10 text-sm sm:text-base leading-relaxed text-gray-700">
          
          {/* Section 1: Intro */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              1. The Absolute Privacy Problem with standard tools
            </h2>
            <p className="font-normal text-gray-600 leading-relaxed text-justify">
              {intro}
            </p>
          </section>

          {/* Section 2: Industry Audience Specific */}
          <section className="bg-teal-500/[0.02] border border-teal-500/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              2. Tailored Operational Needs for {pageData.targetAudience}
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-2 whitespace-pre-line text-justify">
              {professionalContext}
            </div>
          </section>

          {/* Core Interactive Banner / Call-to-Action 1 */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Shield className="h-64 w-62" />
            </div>
            <span className="block text-xs font-mono tracking-widest text-teal-100 uppercase mb-2">TRUSTED BY INTEL & ACCOUNTING FIRMS</span>
            <h3 className="text-lg sm:text-xl font-bold tracking-tight mb-2">
              Ready to process files locally?
            </h3>
            <p className="text-xs sm:text-sm text-teal-50 mb-6 max-w-md leading-relaxed">
              {ctaArg.desc}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  onSelectTool(ctaArg.tool);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white hover:bg-teal-50 text-teal-800 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-colors text-xs sm:text-sm flex items-center gap-2"
              >
                Launch {pageData.category.toUpperCase()} Tool
                <CheckCircle2 className="h-4 w-4" />
              </button>
              <button
                onClick={onNavigateHome}
                className="bg-teal-600/50 hover:bg-teal-600/70 text-white font-medium px-4 py-2.5 rounded-xl transition-colors text-xs border border-teal-400/20"
              >
                Browse All Utilities
              </button>
            </div>
          </div>

          {/* Section 3: Technical Execution */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              3. Deep-Dive: Browser-native compilation mechanisms
            </h2>
            <div className="text-gray-600 leading-relaxed space-y-4 text-justify whitespace-pre-line">
              {technicalMechanism}
            </div>
          </section>

          {/* Section 4: Operational Step-by-Step Guide */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              4. Step-by-Step Security Instructions for {pageData.keyword}
            </h2>
            <ol className="divide-y divide-gray-100 border border-gray-100 rounded-2xl bg-white shadow-xs overflow-hidden">
              {workflowSteps.map((step, idx) => (
                <li key={idx} className="p-4 sm:p-5 flex gap-4 text-gray-600 leading-relaxed text-sm">
                  <span className="h-6 w-6 shrink-0 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center font-mono text-xs font-bold mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>{step}</div>
                </li>
              ))}
            </ol>
          </section>

          {/* Section 5: Secure Comparison Grid Matrix */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              5. {secTableTitle}
            </h2>
            <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-xs">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-3.5 font-semibold text-gray-900">Security Parameters</th>
                    <th className="p-3.5 font-semibold text-teal-800 bg-teal-50/50">Privacy Toolkit (Local)</th>
                    <th className="p-3.5 font-semibold text-gray-500">Ordinary Cloud SaaS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  <tr>
                    <td className="p-3.5 font-medium text-gray-900">File Network Path</td>
                    <td className="p-3.5 text-teal-700 font-medium bg-teal-50/[0.15]">No Network payload (Local RAM)</td>
                    <td className="p-3.5">Uploaded via TLS to cloud datacenters</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-gray-900">Temporary Storage Logs</td>
                    <td className="p-3.5 text-teal-700 font-medium bg-teal-50/[0.15]">0 Byte generated (Instantly purged)</td>
                    <td className="p-3.5">Retained up to 24hr on disk caches</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-gray-900">Offline Functionality</td>
                    <td className="p-3.5 text-teal-700 font-medium bg-teal-50/[0.15]">100% Operational without internet</td>
                    <td className="p-3.5">Completely offline / non-responsive</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 font-medium text-gray-900">Regulated Auditing</td>
                    <td className="p-3.5 text-teal-700 font-medium bg-teal-50/[0.15]">Naturally GDPR/HIPAA Compliant</td>
                    <td className="p-3.5">Requires customized Enterprise BAA</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 6: In-Depth Keyword-Specific FAQs */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <span className="h-6 w-1 rounded-full bg-teal-600 inline-block" />
              6. FAQ: Compliance & Operational Clarity
            </h2>
            <div className="space-y-4">
              {faqList.map((faq, idx) => (
                <div key={idx} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 shadow-xs">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base flex items-start gap-2.5 mb-2">
                    <span className="text-teal-600 font-serif">Q:</span>
                    <span>{faq.q}</span>
                  </h4>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm pl-6 text-justify">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar widgets panel (1 Col wide) */}
        <div className="space-y-6">
          
          {/* Internal Security Indicator */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-teal-700">
              <Shield className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">Security Integrity</h3>
            </div>
            <div className="space-y-3.5 text-xs text-gray-600">
              <p className="leading-relaxed">
                Privacy PDF Toolkit is designed with absolute compliance boundaries. We employ no server backends, trackers, cookies, or user logs.
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span>Static Status</span>
                <span className="text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded">ONLINE & LOCAL</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Memory Sandboxing</span>
                <span className="text-teal-700 font-mono font-bold bg-teal-50 px-2 py-0.5 rounded">V8 SECURE</span>
              </div>
            </div>
          </div>

          {/* Internal Links Map for Crawlers (Mesh Internal Links!) */}
          <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-teal-700">
              <BookOpen className="h-5 w-5 shrink-0" />
              <h3 className="font-bold text-gray-900 text-sm tracking-tight">Related Compliance Areas</h3>
            </div>
            <ul className="space-y-2.5 text-xs text-gray-600">
              {pageData.relatedSlugs.map(rSlug => {
                const target = SEO_PAGES[rSlug];
                if (!target) return null;
                return (
                  <li key={rSlug}>
                    <button
                      onClick={() => {
                        window.history.pushState(null, '', `/${target.slug}`);
                        // Dispatch popstate signature or trigger router reload
                        window.dispatchEvent(new Event('popstate'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-left font-medium text-teal-600 hover:text-teal-800 transition-colors flex items-start gap-1.5"
                    >
                      <ChevronRight className="h-3.5 w-3.5 text-teal-500 shrink-0 mt-0.5" />
                      <span className="hover:underline">{target.keyword}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Quick CTA to Toolkit */}
          <div className="bg-[#fafafa] border border-dashed border-gray-200 rounded-2xl p-5 text-center space-y-4">
            <Layers className="h-8 w-8 text-teal-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-gray-900 text-xs sm:text-sm">Local Tool Suite</h4>
              <p className="text-gray-500 text-xxs sm:text-xs">
                Need compression, merge, splits, or angle rotation? Open instantly.
              </p>
            </div>
            <button
              onClick={onNavigateHome}
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 rounded-xl text-xs transition-colors shadow-2xs"
            >
              Go to Homepage
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
