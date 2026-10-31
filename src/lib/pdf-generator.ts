import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoicePDFData {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: string;
  paymentTerms: string;
  customer: {
    name: string;
    email: string;
    companyName?: string | null;
  };
  subscriptionNumber: string;
  lines: Array<{
    productName: string;
    variantName?: string | null;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    subtotal: number;
  }>;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  balanceDue: number;
  payments: Array<{
    date: string;
    amount: number;
    method: string;
    reference?: string | null;
  }>;
}

export function generateInvoicePDF(data: InvoicePDFData): jsPDF {
  const doc = new jsPDF();

  // Primary Colors: Indigo / Slate
  const primaryColor: [number, number, number] = [79, 70, 229]; // #4f46e5
  const darkSlate: [number, number, number] = [30, 41, 59]; // #1e293b
  const lightGray: [number, number, number] = [241, 245, 249]; // #f1f5f9

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 28, 'F');

  // Company Title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('BRIGHTLOOP SOFTWARE', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Subscription & Financial Cloud Engine', 14, 24);

  // Status Badge on Right Header
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const statusText = `INVOICE: ${data.status.toUpperCase()}`;
  doc.text(statusText, 210 - 14 - doc.getTextWidth(statusText), 18);

  // Invoice Meta & Billed To
  let y = 42;
  doc.setTextColor(...darkSlate);

  // Left Column: Billed To
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('BILLED TO:', 14, y);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 6;
  if (data.customer.companyName) {
    doc.setFont('helvetica', 'bold');
    doc.text(data.customer.companyName, 14, y);
    doc.setFont('helvetica', 'normal');
    y += 5;
  }
  doc.text(data.customer.name, 14, y);
  y += 5;
  doc.text(data.customer.email, 14, y);

  // Right Column: Invoice Details
  let ry = 42;
  const rx = 130;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('INVOICE DETAILS:', rx, ry);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  ry += 6;
  doc.text(`Invoice Number: ${data.invoiceNumber}`, rx, ry);
  ry += 5;
  doc.text(`Subscription: ${data.subscriptionNumber}`, rx, ry);
  ry += 5;
  doc.text(`Issue Date: ${data.issueDate}`, rx, ry);
  ry += 5;
  doc.text(`Due Date: ${data.dueDate} (${data.paymentTerms})`, rx, ry);

  const tableStartY = Math.max(y, ry) + 12;

  // Items Table
  const tableRows = data.lines.map((line) => [
    line.variantName ? `${line.productName} (${line.variantName})` : line.productName,
    line.quantity.toString(),
    `$${line.unitPrice.toFixed(2)}`,
    `${line.taxRate.toFixed(2)}%`,
    `$${line.subtotal.toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Item & Description', 'Qty', 'Unit Price', 'Tax Rate', 'Subtotal']],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: lightGray,
    },
    theme: 'striped',
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Totals Box (Right Aligned)
  const totalsX = 120;
  const totalsWidth = 76;
  let ty = finalY;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  doc.text('Subtotal:', totalsX, ty);
  doc.text(`$${data.subtotal.toFixed(2)}`, 210 - 14, ty, { align: 'right' });
  ty += 6;

  if (data.discountAmount > 0) {
    doc.setTextColor(220, 38, 38); // Red
    doc.text('Applied Discount:', totalsX, ty);
    doc.text(`-$${data.discountAmount.toFixed(2)}`, 210 - 14, ty, { align: 'right' });
    doc.setTextColor(...darkSlate);
    ty += 6;
  }

  doc.text('Tax Amount:', totalsX, ty);
  doc.text(`$${data.taxAmount.toFixed(2)}`, 210 - 14, ty, { align: 'right' });
  ty += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setDrawColor(203, 213, 225);
  doc.line(totalsX, ty - 2, 210 - 14, ty - 2);

  doc.text('Total Amount:', totalsX, ty + 4);
  doc.text(`$${data.totalAmount.toFixed(2)}`, 210 - 14, ty + 4, { align: 'right' });
  ty += 11;

  doc.setFillColor(data.balanceDue > 0 ? 254 : 240, data.balanceDue > 0 ? 242 : 253, data.balanceDue > 0 ? 242 : 244);
  doc.rect(totalsX, ty - 4, totalsWidth, 12, 'F');
  doc.setTextColor(data.balanceDue > 0 ? 185 : 22, data.balanceDue > 0 ? 28 : 101, data.balanceDue > 0 ? 28 : 52);
  doc.setFontSize(11);
  doc.text('Balance Due:', totalsX + 4, ty + 3);
  doc.text(`$${data.balanceDue.toFixed(2)}`, 210 - 18, ty + 3, { align: 'right' });
  doc.setTextColor(...darkSlate);

  // Payment History Section
  let payY = Math.max(ty + 20, finalY + 10);
  if (data.payments && data.payments.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('PAYMENTS RECEIVED:', 14, payY);
    payY += 6;

    const paymentRows = data.payments.map((p) => [
      p.date,
      p.method,
      p.reference || 'N/A',
      `$${p.amount.toFixed(2)}`,
    ]);

    autoTable(doc, {
      startY: payY,
      head: [['Payment Date', 'Method', 'Transaction Ref', 'Amount Paid']],
      body: paymentRows,
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
      },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer / Remittance Info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Brightloop Software Inc. • 100 Enterprise Way, Suite 400 • billing@brightloop.com', 105, 285, { align: 'center' });

  return doc;
}

