import PDFDocument from "pdfkit";
import { format } from "date-fns";
const formatCurrency = (value) => new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
}).format(value);
export const generateDailyReportPDF = (report) => {
    return new Promise((resolve) => {
        const doc = new PDFDocument({ margin: 40, size: "A4" });
        const chunks = [];
        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.fontSize(18).text("Esca Food Günlük Kasa Özeti", { align: "center" });
        doc.moveDown();
        doc
            .fontSize(12)
            .text(`Tarih Aralığı: ${format(report.period.start, "dd.MM.yyyy")} - ${format(report.period.end, "dd.MM.yyyy")}`);
        doc.moveDown();
        doc.fontSize(12).text(`Toplam Giriş: ${formatCurrency(report.totals.inflow)}`);
        doc.text(`Toplam Çıkış: ${formatCurrency(report.totals.outflow)}`);
        doc.text(`Net: ${formatCurrency(report.totals.net)}`);
        doc.text(`Kapanış Bakiyesi: ${formatCurrency(report.totals.closingBalance)}`);
        doc.moveDown();
        doc.fontSize(11).text("Hareketler", { underline: true });
        doc.moveDown(0.5);
        report.rows.slice(0, 50).forEach((row) => {
            doc.fontSize(10).text(`${format(row.txnDate, "dd.MM.yyyy")} | ${row.txnNo} | ${row.type}/${row.method} | ${row.description}`);
            doc
                .fontSize(9)
                .text(`Karşı Taraf: ${row.contact ?? "-"} | Banka: ${row.bankAccount ?? "-"} | Kart: ${row.card ?? "-"}`, { indent: 10 });
            doc
                .fontSize(9)
                .text(`Giriş: ${formatCurrency(row.inflow)} | Çıkış: ${formatCurrency(row.outflow)} | Bakiye: ${formatCurrency(row.balance)}`, { indent: 10 });
            doc.moveDown(0.5);
        });
        if (report.rows.length > 50) {
            doc.font("Helvetica-Oblique")
                .fontSize(9)
                .text(`... toplam ${report.rows.length} kayıt mevcut. Detaylar CSV ekinde.`);
            doc.font("Helvetica");
        }
        doc.end();
    });
};
const escapeCsvValue = (value) => {
    if (value === null || value === undefined)
        return "";
    const str = String(value);
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};
export const generateDailyReportCSV = (report) => {
    const headers = [
        "Tarih",
        "Belge No",
        "Tür",
        "Yöntem",
        "Açıklama",
        "Muhatap",
        "Banka",
        "Kart",
        "Giriş",
        "Çıkış",
        "Bakiye",
    ];
    const rows = report.rows.map((row) => [
        format(row.txnDate, "dd.MM.yyyy"),
        row.txnNo,
        row.type,
        row.method,
        row.description,
        row.contact ?? "",
        row.bankAccount ?? "",
        row.card ?? "",
        row.inflow.toFixed(2),
        row.outflow.toFixed(2),
        row.balance.toFixed(2),
    ]);
    return [headers, ...rows]
        .map((r) => r.map(escapeCsvValue).join(","))
        .join("\n");
};
//# sourceMappingURL=report-export.js.map