import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateInvoicePDF } from '@/lib/pdf-generator';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: params.id },
      include: {
        customer: true,
        payments: {
          orderBy: { paymentDate: 'desc' },
        },
        subscription: {
          include: {
            lines: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const lines = invoice.subscription.lines.map((l) => ({
      productName: l.product.name,
      variantName: l.variant?.variantName || null,
      quantity: l.quantity,
      unitPrice: l.unitPrice,
      taxRate: l.taxRate,
      subtotal: l.subtotal,
    }));

    const payments = invoice.payments.map((p) => ({
      date: new Date(p.paymentDate).toLocaleDateString(),
      amount: p.amount,
      method: p.paymentMethod,
      reference: p.referenceNote,
    }));

    const pdfDoc = generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      issueDate: new Date(invoice.issueDate).toLocaleDateString(),
      dueDate: new Date(invoice.dueDate).toLocaleDateString(),
      status: invoice.status,
      paymentTerms: invoice.subscription.paymentTerms,
      customer: {
        name: invoice.customer.name,
        email: invoice.customer.email,
        companyName: invoice.customer.companyName,
      },
      subscriptionNumber: invoice.subscription.subscriptionNumber,
      lines,
      subtotal: invoice.subtotal,
      discountAmount: invoice.discountAmount,
      taxAmount: invoice.taxAmount,
      totalAmount: invoice.totalAmount,
      balanceDue: invoice.balanceDue,
      payments,
    });

    const pdfBuffer = Buffer.from(pdfDoc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate PDF' }, { status: 500 });
  }
}

