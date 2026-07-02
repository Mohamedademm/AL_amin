import prisma from "../../config/database";
import PDFDocument from "pdfkit";
import { Readable } from "stream";

// Generates a professional PDF invoice for a given order.
// Returns a Node.js Readable stream that can be piped directly to the response.
export const InvoiceService = {
  async generate(orderId: string, requesterId: string, role: string): Promise<Readable> {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        spot: {
          select: { name: true, address: true, location: true, phone: true },
        },
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (!order) throw new Error("Order not found");

    const isStaff = ["ADMIN", "MANAGER", "WORKER"].includes(role);
    if (!isStaff && order.clientId !== requesterId) {
      throw new Error("Forbidden: you cannot access this invoice");
    }

    // Only generate for accepted/shipped/delivered orders
    if (!["ACCEPTED", "SHIPPING", "DELIVERED"].includes(order.status)) {
      throw new Error("Invoice is only available for accepted or delivered orders");
    }

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = doc as unknown as Readable;

    // ── Header ──
    doc.fontSize(26).font("Helvetica-Bold").fillColor("#9b1fe8").text("AL-amin", 50, 50);
    doc.fontSize(10).font("Helvetica").fillColor("#888888").text("Boutique & Vending Spot System", 50, 82);

    doc.fontSize(22).font("Helvetica-Bold").fillColor("#1a1a1a").text("INVOICE", 400, 50, { align: "right" });
    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor("#555555")
      .text(`Invoice #${order.id.slice(0, 8).toUpperCase()}`, 400, 78, { align: "right" })
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-GB")}`, 400, 92, { align: "right" })
      .text(`Status: ${order.status}`, 400, 106, { align: "right" });

    // Divider
    doc.moveTo(50, 130).lineTo(545, 130).strokeColor("#e0e0e0").lineWidth(1).stroke();

    // ── Bill To / From ──
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#9b1fe8").text("BILL TO", 50, 145);
    doc
      .fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#1a1a1a")
      .text(`${order.client.firstName} ${order.client.lastName}`, 50, 160);
    doc.fontSize(10).font("Helvetica").fillColor("#555555").text(order.client.email, 50, 175);
    if (order.client.phone) doc.text(order.client.phone, 50, 189);
    doc.text(order.address, 50, order.client.phone ? 203 : 189);

    doc.fontSize(9).font("Helvetica-Bold").fillColor("#9b1fe8").text("FROM", 350, 145);
    doc.fontSize(11).font("Helvetica-Bold").fillColor("#1a1a1a").text(order.spot.name, 350, 160);
    doc.fontSize(10).font("Helvetica").fillColor("#555555").text(order.spot.location, 350, 175);
    doc.text(order.spot.address, 350, 189);
    if (order.spot.phone) doc.text(order.spot.phone, 350, 203);

    // ── Items Table Header ──
    const tableTop = 260;
    doc.moveTo(50, tableTop - 10).lineTo(545, tableTop - 10).strokeColor("#e0e0e0").stroke();
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#888888");
    doc.text("PRODUCT", 50, tableTop);
    doc.text("QTY", 340, tableTop, { width: 60, align: "right" });
    doc.text("UNIT PRICE", 400, tableTop, { width: 80, align: "right" });
    doc.text("TOTAL", 480, tableTop, { width: 65, align: "right" });
    doc.moveTo(50, tableTop + 16).lineTo(545, tableTop + 16).strokeColor("#e0e0e0").stroke();

    // ── Items ──
    let y = tableTop + 26;
    for (const item of order.items) {
      const lineTotal = Number(item.price) * item.quantity;
      doc.fontSize(10).font("Helvetica").fillColor("#1a1a1a");
      doc.text(item.product.name, 50, y, { width: 280 });
      doc.text(String(item.quantity), 340, y, { width: 60, align: "right" });
      doc.text(`${Number(item.price).toFixed(2)} TND`, 400, y, { width: 80, align: "right" });
      doc.text(`${lineTotal.toFixed(2)} TND`, 480, y, { width: 65, align: "right" });
      y += 22;
    }

    // ── Total ──
    doc.moveTo(50, y + 8).lineTo(545, y + 8).strokeColor("#e0e0e0").stroke();
    doc.moveTo(380, y + 18).lineTo(545, y + 18).strokeColor("#9b1fe8").lineWidth(1.5).stroke();
    doc.fontSize(13).font("Helvetica-Bold").fillColor("#9b1fe8");
    doc.text("TOTAL", 380, y + 26);
    doc.text(`${Number(order.totalAmount).toFixed(2)} TND`, 480, y + 26, { width: 65, align: "right" });

    // ── Fulfilment Info ──
    if (order.fulfilment) {
      doc.fontSize(9).font("Helvetica").fillColor("#888888").text(
        `Fulfilment: ${order.fulfilment}${order.etaDays !== null ? ` · ETA: ${order.etaDays === 0 ? "Immediate" : `${order.etaDays} days`}` : ""}`,
        50, y + 50
      );
    }

    // ── Footer ──
    doc.fontSize(8).fillColor("#bbbbbb").text(
      "Thank you for your order. For any queries, please contact support.",
      50, 760, { align: "center", width: 495 }
    );
    doc.moveTo(50, 750).lineTo(545, 750).strokeColor("#e0e0e0").lineWidth(1).stroke();

    doc.end();
    return stream;
  },
};
