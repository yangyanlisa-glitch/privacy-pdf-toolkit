/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum PDFTool {
  NONE = 'NONE',
  COMPRESS = 'COMPRESS',
  MERGE = 'MERGE',
  SPLIT = 'SPLIT',
  ROTATE = 'ROTATE'
}

export interface PDFFile {
  id: string;
  name: string;
  size: number;
  data: Uint8Array;
  pageCount: number;
  previewUrls?: string[]; // Blob URLs for preview if rendered
}

export interface DragItem {
  index: number;
  id: string;
}

export interface CompressionSettings {
  mode: 'lossless' | 'lossy';
  quality: number; // 0.1 to 1.0
  dpi: number; // 72 to 300
}

export interface RotationState {
  [pageIndex: number]: number; // 0, 90, 180, 270
}
