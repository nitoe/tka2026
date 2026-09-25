/**
 * Generator laporan PDF hasil try out / latihan.
 * Dipakai dari guru/rekap-tryout.html.
 * Bergantung pada window.jspdf (jsPDF UMD) + plugin autotable.
 */

const LABEL_KOMPLEKSITAS = {
  'L1-Pemahaman': '(L1) Pemahaman — Knowing & understanding',
  'L2-Aplikasi': '(L2) Aplikasi — Applying',
  'L3-Penalaran': '(L3) Penalaran — Reasoning',
};

const ORDER_KOMPLEKSITAS = ['L1-Pemahaman', 'L2-Aplikasi', 'L3-Penalaran'];
const ORDER_CAPAIAN_BI = ['Pemahaman Tekstual', 'Pemahaman Inferensial', 'Evaluasi dan Apresiasi'];
const ORDER_CAPAIAN_MTK = ['Bilangan', 'Aljabar', 'Pengukuran', 'Geometri', 'Analisis Data dan Probabilitas', 'Data dan Ketidakpastian'];

const SUBJECT_LABEL = {
  'matematika': 'Matematika',
  'bahasa-indonesia': 'Bahasa Indonesia',
};

function pct(n, d) {
  if (!d || d <= 0) return 0;
  return Math.round((n / d) * 1000) / 10;
}

function normalizeBucket(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw || {})) {
    out[k] = {
      benar: v.benar || 0,
      total: v.total || 0,
      poinBenar: v.poinBenar != null ? v.poinBenar : null,
      poinMaks: v.poinMaks != null ? v.poinMaks : null,
      noSoal: Array.isArray(v.noSoal) ? v.noSoal : [],
    };
  }
  return out;
}

function orderedEntries(map, preferredOrder) {
  const keys = Object.keys(map);
  const ordered = preferredOrder.filter(k => keys.includes(k));
  const rest = keys.filter(k => !preferredOrder.includes(k)).sort((a, b) => a.localeCompare(b, 'id'));
  return [...ordered, ...rest].map(k => [k, map[k]]);
}

function drawBarChart(doc, x, y, width, height, items, title) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(18, 41, 107);
  doc.text(title, x, y);

  const chartTop = y + 6;
  const labelW = 52;
  const barMaxW = width - labelW - 18;
  const rowH = Math.min(12, height / Math.max(items.length, 1));

  items.forEach((it, i) => {
    const yy = chartTop + i * rowH + 3;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    const short = it.label.length > 28 ? it.label.slice(0, 26) + '…' : it.label;
    doc.text(short, x, yy + 2.5);

    const bx = x + labelW;
    doc.setDrawColor(220, 225, 235);
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(bx, yy - 2, barMaxW, 6, 1, 1, 'FD');

    const w = Math.max(0, Math.min(100, it.value)) / 100 * barMaxW;
    if (w > 0) {
      const [r, g, b] = it.color;
      doc.setFillColor(r, g, b);
      doc.roundedRect(bx, yy - 2, w, 6, 1, 1, 'F');
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(31, 42, 55);
    doc.text(String(it.value) + '%', bx + barMaxW + 2, yy + 2.5);
  });

  return chartTop + items.length * rowH + 6;
}

/**
 * @param {object} attempt
 * @param {object} [opts]
 * @param {number} [opts.kkm=70]
 */
export function buatLaporanPdf(attempt, opts = {}) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    throw new Error('jsPDF belum dimuat. Muat ulang halaman lalu coba lagi.');
  }
  const { jsPDF } = window.jspdf;
  const kkm = opts.kkm ?? 70;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 14;
  const contentW = pageW - margin * 2;
  let y = 14;

  const skorAkhir = attempt.skorAkhir ?? 0;
  const skorMaks = attempt.skorMaksimal ?? 0;
  const persen = skorMaks > 0 ? Math.round((skorAkhir / skorMaks) * 100) : 0;
  const tuntas = persen >= kkm;
  const mapel = SUBJECT_LABEL[attempt.subjectId] || attempt.subjectId || '—';
  const jenis = (attempt.jenisPaket === 'tryout') ? 'Try Out' : 'Latihan';

  doc.setFillColor(18, 41, 107);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Portal Latihan TKA 2026', margin, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('SD Muhammadiyah 01 Kukusan', margin, 17);
  doc.setFontSize(8);
  doc.text('Laporan Hasil ' + jenis, margin, 23);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(mapel.toUpperCase(), pageW - margin, 14, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(attempt.packageNama || '—', pageW - margin, 20, { align: 'right' });

  y = 36;

  doc.setTextColor(18, 41, 107);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Identitas Siswa', margin, y);
  y += 5;

  doc.setDrawColor(209, 213, 219);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(margin, y, contentW, 22, 2, 2, 'FD');

  const infoLeft = [
    ['Nama', attempt.namaSiswa || '—'],
    ['Kelas', attempt.kelasSiswa || '—'],
  ];
  const infoRight = [
    ['Mata Pelajaran', mapel],
    ['Jenis', jenis],
  ];
  doc.setFontSize(8);
  infoLeft.forEach((row, i) => {
    const yy = y + 6 + i * 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(row[0], margin + 4, yy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 42, 55);
    doc.text(String(row[1]), margin + 32, yy);
  });
  infoRight.forEach((row, i) => {
    const yy = y + 6 + i * 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text(row[0], margin + contentW / 2, yy);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 42, 55);
    doc.text(String(row[1]), margin + contentW / 2 + 32, yy);
  });
  y += 28;

  doc.setFillColor(tuntas ? 222 : 254, tuntas ? 247 : 226, tuntas ? 236 : 226);
  doc.roundedRect(margin, y, contentW, 18, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(tuntas ? 5 : 185, tuntas ? 122 : 28, tuntas ? 85 : 28);
  doc.text(tuntas ? 'Sudah mencapai ketuntasan' : 'Belum mencapai ketuntasan — perlu remedial', margin + 4, y + 7);
  doc.setFontSize(14);
  doc.text(String(persen), pageW - margin - 28, y + 8, { align: 'right' });
  doc.setFontSize(8);
  doc.text('/ 100', pageW - margin - 4, y + 8, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(55, 65, 81);
  doc.text(`Skor mentah: ${skorAkhir} / ${skorMaks}  ·  KKM ${kkm}%  ·  Status: ${attempt.status === 'waktu_habis' ? 'Waktu habis' : 'Selesai'}`, margin + 4, y + 14);
  y += 24;

  const perKomp = normalizeBucket(attempt.skorPerKompleksitas);
  const kompRows = orderedEntries(perKomp, ORDER_KOMPLEKSITAS);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 41, 107);
  doc.text('A. Sebaran per Tingkat Kompleksitas', margin, y);
  y += 3;

  const tableKomp = kompRows.map(([k, v], idx) => {
    const label = LABEL_KOMPLEKSITAS[k] || k;
    const pBenar = v.poinBenar != null ? v.poinBenar : '—';
    const pMaks = v.poinMaks != null ? v.poinMaks : '—';
    const persenKat = v.poinMaks > 0 ? pct(v.poinBenar, v.poinMaks)
      : (v.total > 0 ? pct(v.benar, v.total) : 0);
    const no = v.noSoal.length ? v.noSoal.join(', ') : '—';
    return [String(idx + 1), label, no, String(v.total), String(v.benar), String(v.total - v.benar), `${pBenar} / ${pMaks}`, persenKat + '%'];
  });

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['No', 'Tingkat', 'No. Soal', 'Jml', 'Benar', 'Salah', 'Poin', '%']],
    body: tableKomp.length ? tableKomp : [['—', 'Tidak ada data', '—', '—', '—', '—', '—', '—']],
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: [31, 42, 55] },
    headStyles: { fillColor: [18, 41, 107], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8 },
      2: { cellWidth: 28 },
      3: { cellWidth: 10, halign: 'center' },
      4: { cellWidth: 12,halign: 'center' },
      5: { cellWidth: 12,halign: 'center' },
      6: { cellWidth: 18,halign: 'center' },
      7: { cellWidth: 14,halign: 'center' },
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  const colorsKomp = [[56, 189, 248], [59, 130, 246], [245, 158, 11]];
  const chartKomp = kompRows.map(([k, v], i) => ({
    label: LABEL_KOMPLEKSITAS[k] || k,
    value: v.poinMaks > 0 ? pct(v.poinBenar, v.poinMaks) : (v.total > 0 ? pct(v.benar, v.total) : 0),
    color: colorsKomp[i % colorsKomp.length],
  }));
  y = drawBarChart(doc, margin, y, contentW, 40, chartKomp, 'Diagram capaian per kompleksitas');
  y += 4;

  if (y > 230) { doc.addPage(); y = 16; }

  const perTipe = normalizeBucket(attempt.skorPerTipeMateri);
  const preferTipe = (attempt.subjectId === 'bahasa-indonesia')
    ? ORDER_CAPAIAN_BI
    : (attempt.subjectId === 'matematika' ? ORDER_CAPAIAN_MTK : []);
  const tipeRows = orderedEntries(perTipe, preferTipe);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 41, 107);
  doc.text('B. Sebaran per Capaian / Tipe Materi', margin, y);
  y += 3;

  const tableTipe = tipeRows.map(([k, v], idx) => {
    const persenKat = v.poinMaks > 0 ? pct(v.poinBenar, v.poinMaks)
      : (v.total > 0 ? pct(v.benar, v.total) : 0);
    const pBenar = v.poinBenar != null ? v.poinBenar : '—';
    const pMaks = v.poinMaks != null ? v.poinMaks : '—';
    const no = v.noSoal.length ? v.noSoal.join(', ') : '—';
    return [String(idx + 1), k, no, String(v.total), String(v.benar), String(v.total - v.benar), `${pBenar} / ${pMaks}`, persenKat + '%'];
  });

  doc.autoTable({
    startY: y,
    margin: { left: margin, right: margin },
    head: [['No', 'Capaian / Tipe Materi', 'No. Soal', 'Jml', 'Benar', 'Salah', 'Poin', '%']],
    body: tableTipe.length ? tableTipe : [['—', 'Tidak ada data kategori', '—', '—', '—', '—', '—', '—']],
    styles: { fontSize: 7.5, cellPadding: 1.6, textColor: [31, 42, 55] },
    headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', fontSize: 7.5 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 8 },
      2: { cellWidth: 28 },
      3: { cellWidth: 10,halign: 'center' },
      4: { cellWidth: 12,halign: 'center' },
      5: { cellWidth: 12,halign: 'center' },
      6: { cellWidth: 18,halign: 'center' },
      7: { cellWidth: 14,halign: 'center' },
    },
  });
  y = doc.lastAutoTable.finalY + 6;

  const colorsTipe = [[16, 185, 129], [59, 130, 246], [245, 158, 11], [139, 92, 246], [236, 72, 153]];
  const chartTipe = tipeRows.map(([k, v], i) => ({
    label: k,
    value: v.poinMaks > 0 ? pct(v.poinBenar, v.poinMaks) : (v.total > 0 ? pct(v.benar, v.total) : 0),
    color: colorsTipe[i % colorsTipe.length],
  }));
  if (chartTipe.length) {
    if (y > 250) { doc.addPage(); y = 16; }
    y = drawBarChart(doc, margin, y, contentW, 40, chartTipe, 'Diagram capaian per tipe materi');
    y += 4;
  }

  if (y > 255) { doc.addPage(); y = 16; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(18, 41, 107);
  doc.text('Kesimpulan', margin, y);
  y += 5;

  const kesimpulan = tuntas
    ? `${attempt.namaSiswa || 'Siswa'}, sudah mencapai ketuntasan (nilai ${persen} ≥ KKM ${kkm}). Tidak perlu remedial wajib.`
    : `${attempt.namaSiswa || 'Siswa'}, belum mencapai ketuntasan (nilai ${persen} < KKM ${kkm}). Disarankan remedial, terutama pada kategori dengan capaian terendah.`;

  doc.setFillColor(tuntas ? 222 : 254, tuntas ? 247 : 226, tuntas ? 236 : 226);
  doc.roundedRect(margin, y, contentW, 16, 2, 2, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(31, 42, 55);
  const lines = doc.splitTextToSize(kesimpulan, contentW - 8);
  doc.text(lines, margin + 4, y + 6);

  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Dicetak ${new Date().toLocaleString('id-ID')} · Portal Latihan TKA 2026 · Hal. ${i}/${pageCount}`,
      pageW / 2,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'center' }
    );
  }

  const safeName = String(attempt.namaSiswa || 'siswa').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '_');
  const safeMapel = String(attempt.subjectId || 'mapel').replace(/[^\w-]/g, '');
  const fname = `Laporan_${jenis.replace(/\s+/g, '')}_${safeMapel}_${safeName}.pdf`;
  doc.save(fname);
  return fname;
}
