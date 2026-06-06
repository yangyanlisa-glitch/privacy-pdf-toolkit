/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PDFDocument, degrees } from 'pdf-lib';

// Parse array of files into a merged single PDF
export async function mergePDFs(files: { data: Uint8Array }[]): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();
  for (const file of files) {
    const srcPdf = await PDFDocument.load(file.data);
    const pageIndices = srcPdf.getPageIndices();
    const copiedPages = await mergedPdf.copyPages(srcPdf, pageIndices);
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save({ useObjectStreams: true });
}

// Extract selected page ranges and compile into a single PDF
export async function splitPDF(
  fileBytes: Uint8Array,
  pageString: string
): Promise<Uint8Array> {
  const srcPdf = await PDFDocument.load(fileBytes);
  const totalPages = srcPdf.getPageCount();
  const indexSet = new Set<number>();

  const sections = pageString.split(',');
  for (let section of sections) {
    section = section.trim();
    if (!section) continue;

    if (section.includes('-')) {
      const [startStr, endStr] = section.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);
      if (!isNaN(start) && !isNaN(end)) {
        const lower = Math.min(start, end);
        const upper = Math.max(start, end);
        for (let i = lower; i <= upper; i++) {
          if (i >= 1 && i <= totalPages) {
            indexSet.add(i - 1);
          }
        }
      }
    } else {
      const pageNum = parseInt(section, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
        indexSet.add(pageNum - 1);
      }
    }
  }

  const indicesToCopy = Array.from(indexSet).sort((a, b) => a - b);
  if (indicesToCopy.length === 0) {
    throw new Error('有効なページが選択されていません。');
  }

  const splitPdf = await PDFDocument.create();
  const copiedPages = await splitPdf.copyPages(srcPdf, indicesToCopy);
  copiedPages.forEach((page) => splitPdf.addPage(page));
  return await splitPdf.save({ useObjectStreams: true });
}

// Split PDF into a list of separate single pages
export async function splitAllPages(
  fileBytes: Uint8Array,
  baseName: string
): Promise<{ name: string; data: Uint8Array }[]> {
  const srcPdf = await PDFDocument.load(fileBytes);
  const totalPages = srcPdf.getPageCount();
  const results: { name: string; data: Uint8Array }[] = [];

  const cleanBase = baseName.endsWith('.pdf') ? baseName.slice(0, -4) : baseName;

  for (let i = 0; i < totalPages; i++) {
    const singlePdf = await PDFDocument.create();
    const [copiedPage] = await singlePdf.copyPages(srcPdf, [i]);
    singlePdf.addPage(copiedPage);
    const pdfBytes = await singlePdf.save({ useObjectStreams: true });
    results.push({
      name: `${cleanBase}_page_${i + 1}.pdf`,
      data: pdfBytes
    });
  }

  return results;
}

// Rotate individual specified pages or all pages of a PDF
export async function rotatePDF(
  fileBytes: Uint8Array,
  rotations: { [pageIndex: number]: number }
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBytes);
  const pages = pdfDoc.getPages();

  for (let i = 0; i < pages.length; i++) {
    const rot = rotations[i] || 0;
    if (rot !== 0) {
      const currentRot = pages[i].getRotation().angle;
      // Accumulate and make sure it is bounded by [0, 360)
      const targetRot = (currentRot + rot) % 360;
      pages[i].setRotation(degrees(targetRot < 0 ? targetRot + 360 : targetRot));
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

// Lossless structural compression
export async function compressPDFLossless(fileBytes: Uint8Array): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(fileBytes);
  // Re-saving with object stream compression optimizes structural space in compliance with pdf-lib types
  return await pdfDoc.save({
    useObjectStreams: true
  });
}

// Lossy compress pages by rendering each page to a jpeg canvas and bundling
export async function compressPDFLossy(
  fileBytes: Uint8Array,
  dpi: number, // e.g. 150 (scale = 150/72 ≈ 2.08) or 100 (scale = 1.38)
  quality: number, // 0.1 to 1.0 (jpeg compression quality)
  progressCallback?: (current: number, total: number) => void
): Promise<Uint8Array> {
  const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
  if (!pdfjsLib) {
    throw new Error('PDF.js library is not available. Try Lossless Mode.');
  }

  // Load via pdf.js to render
  const docTask = pdfjsLib.getDocument({ data: fileBytes });
  const pdfjsDoc = await docTask.promise;
  const pageCount = pdfjsDoc.numPages;

  const pdfDoc = await PDFDocument.create();

  // Scale calculations. PDF standard is 72 default user units per inch.
  const scale = dpi / 72;

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdfjsDoc.getPage(i);
    const viewport = page.getViewport({ scale });

    // Render to canvas
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Canvas render context could not be created.');
    }

    // Fill with white background (in case of translatency background elements)
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    // Get JPEG stream bytes
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64Data = jpegDataUrl.substring(jpegDataUrl.indexOf(',') + 1);
    
    // Convert to Uint8Array safely client-side
    const binaryStr = atob(base64Data);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let k = 0; k < len; k++) {
      bytes[k] = binaryStr.charCodeAt(k);
    }

    // Embed and append
    const embeddedImg = await pdfDoc.embedJpg(bytes);
    const newPage = pdfDoc.addPage([viewport.width / scale, viewport.height / scale]);
    newPage.drawImage(embeddedImg, {
      x: 0,
      y: 0,
      width: viewport.width / scale,
      height: viewport.height / scale
    });

    if (progressCallback) {
      progressCallback(i, pageCount);
    }
  }

  return await pdfDoc.save({ useObjectStreams: true });
}

// Generate single canvas-based image thumbnail URL for page previews using global PDF.js
export async function getPageThumbnail(
  pdfBytes: Uint8Array,
  pageNo: number,
  scale: number = 0.5
): Promise<string | null> {
  try {
    const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'];
    if (!pdfjsLib) return null;

    const docTask = pdfjsLib.getDocument({ data: pdfBytes });
    const pdf = await docTask.promise;
    if (pageNo < 1 || pageNo > pdf.numPages) return null;

    const page = await pdf.getPage(pageNo);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const context = canvas.getContext('2d');
    if (!context) return null;

    // Draw white background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.error('Thumbnail generation failed for page', pageNo, err);
    return null;
  }
}
