export function generateSanctuaryWav(slug: string): Buffer {
  // Deterministic soothing harmonic drone + gentle bell resonance per slug
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 1000;
  }

  const baseFreqs = [130.81, 146.83, 164.81, 174.61, 196.0, 220.0];
  const root = baseFreqs[hash % baseFreqs.length];
  const fifth = root * 1.5;
  const octave = root * 2.0;

  const sampleRate = 22050;
  const durationSec = 18;
  const numSamples = sampleRate * durationSec;
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM
  buffer.writeUInt16LE(1, 20); // Linear PCM
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const fadeIn = Math.min(1, t / 1.5);
    const fadeOut = Math.min(1, (durationSec - t) / 1.5);
    const envelope = fadeIn * fadeOut;

    // Gentle tanpura-like harmonic drone
    const drone =
      0.42 * Math.sin(2 * Math.PI * root * t) +
      0.26 * Math.sin(2 * Math.PI * fifth * t) +
      0.18 * Math.sin(2 * Math.PI * octave * t) +
      0.08 * Math.sin(2 * Math.PI * (root * 3) * t);

    // Subtle temple bell chime every 6 seconds
    const chimePhase = t % 6;
    const chimeEnv = Math.exp(-chimePhase * 1.9);
    const chime =
      0.22 * chimeEnv * Math.sin(2 * Math.PI * (octave * 2) * chimePhase) +
      0.1 * chimeEnv * Math.sin(2 * Math.PI * (octave * 3.01) * chimePhase);

    const sample = Math.max(-1, Math.min(1, (drone * 0.45 + chime) * envelope));
    buffer.writeInt16LE(Math.round(sample * 24000), 44 + i * 2);
  }

  return buffer;
}

function escapePdfText(input: string): string {
  // Strip non-ASCII for PDF Type1 Helvetica encoding while preserving clean ASCII lines
  const ascii = input
    .replace(/[^\x20-\x7E\n]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
  return ascii;
}

function wrapLines(text: string, maxLen = 78): string[] {
  const out: string[] = [];
  for (const rawLine of text.split('\n')) {
    const words = rawLine.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      out.push('');
      continue;
    }
    let current = '';
    for (const w of words) {
      if ((current + ' ' + w).trim().length > maxLen) {
        if (current) out.push(current);
        current = w;
      } else {
        current = (current + ' ' + w).trim();
      }
    }
    if (current) out.push(current);
  }
  return out;
}

export function generateSimplePdfBuffer(
  title: string,
  subtitle: string,
  paragraphs: string[]
): Buffer {
  const lines: Array<{ text: string; size: number; bold?: boolean }> = [];
  lines.push({ text: 'TAMIL WISDOM | THIRUKKURAL & VEDANTA DIGITAL LIBRARY', size: 10, bold: true });
  lines.push({ text: '100% Free Learning - Knowledge for Everyone', size: 9 });
  lines.push({ text: '--------------------------------------------------------------------------', size: 10 });
  lines.push({ text: escapePdfText(title), size: 15, bold: true });
  if (subtitle) {
    lines.push({ text: escapePdfText(subtitle), size: 11 });
  }
  lines.push({ text: '', size: 10 });

  for (const para of paragraphs) {
    for (const wrapped of wrapLines(escapePdfText(para), 80)) {
      lines.push({ text: wrapped, size: 10 });
    }
    lines.push({ text: '', size: 8 });
  }

  const streamCommands: string[] = ['BT'];
  let y = 760;
  for (const line of lines) {
    if (y < 60) break;
    const fontRef = line.bold ? '/F2' : '/F1';
    streamCommands.push(`${fontRef} ${line.size} Tf`);
    streamCommands.push(`1 0 0 1 48 ${y} Tm`);
    streamCommands.push(`(${line.text}) Tj`);
    y -= line.size + 6;
  }
  streamCommands.push('ET');
  const contentStream = streamCommands.join('\n');

  const objects: string[] = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n'
  );
  objects.push(
    `4 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`
  );
  objects.push(
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n'
  );
  objects.push(
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n'
  );

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}
