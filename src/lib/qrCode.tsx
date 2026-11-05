/**
 * Lightweight, zero-dependency QR Code generator (ISO/IEC 18004 compliant byte mode).
 * Generates an SVG path or 2D boolean matrix for any URL or text string.
 */

import React from 'react';

// Galois Field GF(256) with primitive polynomial 0x11d
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGF() {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + 255] = val;
    GF_LOG[val] = i;
    val = (val << 1) ^ (val >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function polyMul(p1: Uint8Array, p2: Uint8Array): Uint8Array {
  const res = new Uint8Array(p1.length + p2.length - 1);
  for (let i = 0; i < p1.length; i++) {
    for (let j = 0; j < p2.length; j++) {
      res[i + j] ^= gfMul(p1[i], p2[j]);
    }
  }
  return res;
}

function getGeneratorPoly(degree: number): Uint8Array {
  let poly: Uint8Array = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    poly = polyMul(poly, new Uint8Array([1, GF_EXP[i]]));
  }
  return poly;
}

function calculateEcc(data: Uint8Array, eccCount: number): Uint8Array {
  const gen = getGeneratorPoly(eccCount);
  const msg = new Uint8Array(data.length + eccCount);
  msg.set(data);

  for (let i = 0; i < data.length; i++) {
    const coef = msg[i];
    if (coef !== 0) {
      for (let j = 0; j < gen.length; j++) {
        msg[i + j] ^= gfMul(gen[j], coef);
      }
    }
  }
  const result = new Uint8Array(eccCount);
  for (let i = 0; i < eccCount; i++) {
    result[i] = msg[data.length + i];
  }
  return result;
}

// Version configs for Medium Error Correction (M)
interface VersionConfig {
  version: number;
  size: number;
  totalBytes: number;
  dataBytes: number;
  eccPerBlock: number;
  blocks: { numBlocks: number; dataPerBlock: number }[];
  alignments: number[];
}

const VERSIONS: VersionConfig[] = [
  {
    version: 1,
    size: 21,
    totalBytes: 26,
    dataBytes: 16,
    eccPerBlock: 10,
    blocks: [{ numBlocks: 1, dataPerBlock: 16 }],
    alignments: [],
  },
  {
    version: 2,
    size: 25,
    totalBytes: 44,
    dataBytes: 28,
    eccPerBlock: 16,
    blocks: [{ numBlocks: 1, dataPerBlock: 28 }],
    alignments: [6, 18],
  },
  {
    version: 3,
    size: 29,
    totalBytes: 70,
    dataBytes: 44,
    eccPerBlock: 26,
    blocks: [{ numBlocks: 1, dataPerBlock: 44 }],
    alignments: [6, 22],
  },
  {
    version: 4,
    size: 33,
    totalBytes: 100,
    dataBytes: 64,
    eccPerBlock: 18,
    blocks: [{ numBlocks: 2, dataPerBlock: 32 }],
    alignments: [6, 26],
  },
  {
    version: 5,
    size: 37,
    totalBytes: 134,
    dataBytes: 86,
    eccPerBlock: 24,
    blocks: [{ numBlocks: 2, dataPerBlock: 43 }],
    alignments: [6, 30],
  },
  {
    version: 6,
    size: 41,
    totalBytes: 172,
    dataBytes: 108,
    eccPerBlock: 16,
    blocks: [{ numBlocks: 4, dataPerBlock: 27 }],
    alignments: [6, 34],
  },
];

export function generateQrMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const rawBytes = encoder.encode(text);

  // Pick smallest fitting version
  const config = VERSIONS.find((v) => v.dataBytes >= rawBytes.length + 3) || VERSIONS[VERSIONS.length - 1];
  const { size, dataBytes, totalBytes, eccPerBlock, blocks, alignments } = config;

  // Encode bit stream (Byte mode indicator: 0100, length: 8 bits for v1-9)
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(rawBytes.length, 8); // Length
  for (const b of rawBytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zero bits)
  const maxBits = dataBytes * 8;
  for (let i = 0; i < 4 && bits.length < maxBits; i++) {
    bits.push(0);
  }
  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }
  // Pad bytes alternating 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data bytes
  const data = new Uint8Array(dataBytes);
  for (let i = 0; i < dataBytes; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    data[i] = b;
  }

  // Split into blocks and compute ECC
  const dataBlockList: Uint8Array[] = [];
  const eccBlockList: Uint8Array[] = [];
  let offset = 0;
  for (const block of blocks) {
    for (let i = 0; i < block.numBlocks; i++) {
      const bData = new Uint8Array(block.dataPerBlock);
      for (let k = 0; k < block.dataPerBlock; k++) {
        bData[k] = data[offset + k];
      }
      offset += block.dataPerBlock;
      dataBlockList.push(bData);
      eccBlockList.push(calculateEcc(bData, eccPerBlock));
    }
  }

  // Interleave data and ECC
  const finalMessage = new Uint8Array(totalBytes);
  let pos = 0;
  const maxDataPerBlock = Math.max(...blocks.map((b) => b.dataPerBlock));
  for (let i = 0; i < maxDataPerBlock; i++) {
    for (const bData of dataBlockList) {
      if (i < bData.length) {
        finalMessage[pos++] = bData[i];
      }
    }
  }
  for (let i = 0; i < eccPerBlock; i++) {
    for (const bEcc of eccBlockList) {
      finalMessage[pos++] = bEcc[i];
    }
  }

  // Prepare matrix (size x size)
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunction(r: number, c: number, val: boolean) {
    matrix[r][c] = val;
    isFunction[r][c] = true;
  }

  // 1. Finder patterns (7x7) + Separators
  function addFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row >= 0 && row < size && col >= 0 && col < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            setFunction(row, col, isBorder || isCenter);
          } else {
            setFunction(row, col, false); // Separator
          }
        }
      }
    }
  }

  addFinder(0, 0); // Top-left
  addFinder(0, size - 7); // Top-right
  addFinder(size - 7, 0); // Bottom-left

  // 2. Alignment patterns
  if (alignments.length > 0) {
    for (const r of alignments) {
      for (const c of alignments) {
        // Skip if overlaps finder
        if (
          (r === 6 && c === 6) ||
          (r === 6 && c === size - 7) ||
          (r === size - 7 && c === 6)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setFunction(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // 3. Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!isFunction[6][i]) setFunction(6, i, i % 2 === 0);
    if (!isFunction[i][6]) setFunction(i, 6, i % 2 === 0);
  }

  // 4. Dark module
  setFunction(size - 8, 8, true);

  // 5. Reserve format info
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = size - 8; i < size; i++) {
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }

  // 6. Place data bits in zig-zag
  let bitIdx = 0;
  const totalBits = finalMessage.length * 8;
  let upwards = true;

  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // Skip vertical timing line

    for (let rowStep = 0; rowStep < size; rowStep++) {
      const row = upwards ? size - 1 - rowStep : rowStep;

      for (let c = 0; c < 2; c++) {
        const curCol = col - c;
        if (!isFunction[row][curCol]) {
          let bit = false;
          if (bitIdx < totalBits) {
            const byte = finalMessage[Math.floor(bitIdx / 8)];
            bit = ((byte >> (7 - (bitIdx % 8))) & 1) === 1;
            bitIdx++;
          }
          // Mask 0: (row + col) % 2 === 0
          const mask = (row + curCol) % 2 === 0;
          matrix[row][curCol] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // 7. Format info for ECL 'M' (00) and Mask 0 (000) -> 00000 -> Format Bits: 0x5412 with mask
  const FORMAT_M_MASK0 = 0x5412; // Standard masked format bits for ECC M + Mask 0
  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_M_MASK0 >> i) & 1) === 1;
    // Around top-left
    if (i < 6) {
      matrix[8][i] = bit;
    } else if (i === 6) {
      matrix[8][7] = bit;
    } else if (i === 7) {
      matrix[8][8] = bit;
    } else if (i === 8) {
      matrix[7][8] = bit;
    } else {
      matrix[14 - i][8] = bit;
    }

    // Split around other finders
    if (i < 7) {
      matrix[size - 1 - i][8] = bit;
    } else {
      matrix[8][size - 15 + i] = bit;
    }
  }

  return matrix;
}

export function QrCodeSvg({
  value,
  size = 180,
  className = '',
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const matrix = generateQrMatrix(value);
  const padding = 2;
  const viewBoxSize = matrix.length + padding * 2;

  return (
    <svg
      viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      shapeRendering="crispEdges"
    >
      <rect width={viewBoxSize} height={viewBoxSize} fill="#ffffff" />
      {matrix.map((row, r) =>
        row.map((cell, c) =>
          cell ? (
            <rect
              key={`${r}-${c}`}
              x={c + padding}
              y={r + padding}
              width={1}
              height={1}
              fill="#000000"
            />
          ) : null
        )
      )}
    </svg>
  );
}
