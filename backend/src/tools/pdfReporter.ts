import PDFDocument from 'pdfkit';
import { Writable } from 'stream';

export interface ProductReportData {
  name: string;
  url: string;
  lastStatus: string;
  priceHistory: Array<{ price: number; currency: string; scrapedAt: Date }>;
}

export interface ReportData {
  generatedAt: Date;
  userEmail: string;
  competitors: Array<{
    name: string;
    websiteUrl: string;
    products: ProductReportData[];
  }>;
  periodLabel: string; // e.g. "Weekly Report — Sept 1–7, 2026"
}

/**
 * Generates a PDF report buffer from ReportData.
 * Returns a Buffer containing the PDF bytes.
 */
export async function generatePdfReport(data: ReportData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(Buffer.from(chunk));
        callback();
      }
    });

    doc.pipe(stream);

    // ── Header ──
    doc.rect(0, 0, doc.page.width, 80).fill('#4F46E5');
    doc.fill('white').fontSize(22).font('Helvetica-Bold')
      .text('Competitor Tracker', 50, 25);
    doc.fontSize(11).font('Helvetica')
      .text(data.periodLabel, 50, 52);

    doc.fill('black').moveDown(3);

    // ── Meta ──
    doc.fontSize(10).fill('#6B7280')
      .text(`Generated: ${data.generatedAt.toLocaleString()}`, { align: 'right' })
      .text(`Account: ${data.userEmail}`, { align: 'right' });

    doc.moveDown(1);

    // ── Summary ──
    const totalProducts = data.competitors.reduce((s, c) => s + c.products.length, 0);
    const brokenCount = data.competitors.reduce((s, c) =>
      s + c.products.filter(p => p.lastStatus === 'broken').length, 0);

    doc.fontSize(14).fill('#111827').font('Helvetica-Bold').text('Summary');
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).stroke('#E5E7EB');
    doc.moveDown(0.5);
    doc.fontSize(11).font('Helvetica').fill('#374151');
    doc.text(`Total competitors tracked: ${data.competitors.length}`);
    doc.text(`Total products tracked: ${totalProducts}`);
    doc.text(`Broken links detected: ${brokenCount}`);
    doc.moveDown(1.5);

    // ── Per-competitor sections ──
    for (const comp of data.competitors) {
      // Check if we need a new page
      if (doc.y > doc.page.height - 150) doc.addPage();

      doc.fontSize(13).fill('#4F46E5').font('Helvetica-Bold').text(comp.name);
      doc.fontSize(9).fill('#6B7280').font('Helvetica').text(comp.websiteUrl);
      doc.moveDown(0.5);

      for (const product of comp.products) {
        if (doc.y > doc.page.height - 120) doc.addPage();

        // Product name + status
        const statusColor = product.lastStatus === 'ok' ? '#10B981'
          : product.lastStatus === 'broken' ? '#EF4444' : '#F59E0B';
        doc.fontSize(11).fill('#111827').font('Helvetica-Bold').text(product.name, { continued: true });
        doc.fill(statusColor).font('Helvetica').fontSize(9).text(`  [${product.lastStatus.toUpperCase()}]`);
        doc.fill('#6B7280').fontSize(8).text(product.url);

        if (product.priceHistory.length > 0) {
          // Mini price table header
          doc.moveDown(0.3);
          const startX = 70;
          const col2 = 200;
          doc.fontSize(8).fill('#9CA3AF').font('Helvetica-Bold');
          doc.text('Date', startX, doc.y);
          doc.text('Price', col2, doc.y - doc.currentLineHeight());
          doc.moveDown(0.2);
          doc.moveTo(startX, doc.y).lineTo(350, doc.y).stroke('#E5E7EB');

          // Show up to last 5 price points
          const slice = product.priceHistory.slice(-5).reverse();
          for (const h of slice) {
            if (doc.y > doc.page.height - 60) { doc.addPage(); }
            doc.fontSize(8).fill('#374151').font('Helvetica');
            const dateStr = new Date(h.scrapedAt).toLocaleDateString();
            doc.text(dateStr, startX, doc.y);
            doc.text(`${h.currency} ${h.price.toFixed(2)}`, col2, doc.y - doc.currentLineHeight());
          }
        } else {
          doc.fill('#9CA3AF').fontSize(8).font('Helvetica').text('  No price history yet.');
        }

        doc.moveDown(0.8);
      }

      doc.moveDown(1);
    }

    // ── Footer ──
    const pageCount = doc.bufferedPageRange().count;
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i);
      doc.fontSize(8).fill('#9CA3AF')
        .text(`Page ${i + 1} of ${pageCount} — Competitor Tracker`, 50, doc.page.height - 30, {
          align: 'center', width: doc.page.width - 100
        });
    }

    doc.end();

    stream.on('finish', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
