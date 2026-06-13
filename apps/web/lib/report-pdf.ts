import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Build a report PDF (landscape A4) with a title, date-range subtitle, and a
 * full table of all columns. Returns the jsPDF doc; the caller opens it in the
 * browser's native PDF preview (new tab) — not a forced download.
 */
export function buildReportPdf({
  title,
  subtitle,
  head,
  body,
}: {
  title: string;
  subtitle: string;
  head: string[];
  body: string[][];
}): jsPDF {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(14, 42, 32); // pine
  doc.text(title, 40, 44);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(subtitle, 40, 62);

  autoTable(doc, {
    startY: 78,
    head: [head],
    body: body.length ? body : [head.map(() => '—')],
    styles: { fontSize: 8, cellPadding: 5, textColor: [40, 40, 40] },
    headStyles: { fillColor: [14, 42, 32], textColor: [246, 242, 233], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [247, 244, 237] },
    margin: { left: 40, right: 40 },
  });

  return doc;
}

/** Open a PDF in a new tab using the browser's native viewer. */
export function previewPdf(doc: jsPDF): void {
  const url = doc.output('bloburl');
  window.open(url, '_blank');
}
