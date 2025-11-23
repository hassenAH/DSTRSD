// src/components/Invoice/downloadInvoice.tsx
import React from "react";
import {
  pdf,
  Document as PdfDocument, // 👈 alias to avoid clash with DOM `Document`
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

import logo from "../../../../assets/images/LOGO.png"; // adjust path
import { Order } from "./order";

const styles = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 28, paddingHorizontal: 28, color: "#090909", fontSize: 10 },
  hero: { backgroundColor: "#090909", color: "#ffffff", padding: 20, marginBottom: 16 },
  brandRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  brandLeft: { flexDirection: "column" },
  brandName: { fontSize: 24, fontWeight: 700 as any, letterSpacing: 0.2, marginTop: 6 },
  tagline: { fontSize: 10, opacity: 0.9, marginTop: 2 },
  invoiceBlock: { textAlign: "right" as const },
  invoiceTitle: { fontSize: 20, fontWeight: 700 as any },
  invoiceMeta: { marginTop: 4, fontSize: 10, opacity: 0.95 },

  grid: { flexDirection: "row", marginBottom: 10 },
  col: { flex: 1, borderWidth: 1, borderColor: "#e9eaec", padding: 10, backgroundColor: "#fff" },
  colSpacer: { width: 12 },

  table: { width: "100%", borderWidth: 1, borderColor: "#e9eaec", borderBottomWidth: 0 },
  trHead: { flexDirection: "row", backgroundColor: "#f9fafb", borderBottomWidth: 1, borderColor: "#e9eaec" },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#e9eaec" },
  th: { padding: 8, fontSize: 10, fontWeight: 700 as any },
  td: { padding: 8, fontSize: 10 },
  cProduct: { width: "40%" },
  cOptions: { width: "25%" },
  cQty: { width: "10%", textAlign: "right" as const },
  cPrice: { width: "12.5%", textAlign: "right" as const },
  cLine: { width: "12.5%", textAlign: "right" as const },

  totals: { marginTop: 10, width: "100%", borderWidth: 1, borderColor: "#e9eaec" },
  trow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderColor: "#e9eaec" },
  grand: { backgroundColor: "#f9fafb", fontWeight: 700 as any },

  footer: { marginTop: 16, textAlign: "center" as const, color: "rgba(9,9,9,.7)", fontSize: 10 },
});

const fmt = (n: number) => `${n.toFixed(2)} DT`;
const dateStr = (iso: string) => { try { return new Date(iso).toLocaleString(); } catch { return iso; } };
const optionsOf = (p: Order["products"][number]) =>
  [p.size ? `Size: ${p.size}` : null, p.color ? `Color: ${p.color}` : null].filter(Boolean).join(" · ");

export async function downloadInvoice(order: Order) {
  const shortId = order._id?.slice(-6) ?? order._id;

  const element = (
    <PdfDocument>
      <Page size="A4" style={styles.page}>
        {/* HERO */}
        <View style={styles.hero}>
          <View style={styles.brandRow}>
            <View style={styles.brandLeft}>
              <Image src={logo as unknown as string} style={{ width: 42, height: 42 }} />
              <Text style={styles.brandName}>Distressed.</Text>
              <Text style={styles.tagline}>Jamais 203 .</Text>
            </View>
            <View style={styles.invoiceBlock}>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <Text style={styles.invoiceMeta}>Order #{shortId}</Text>
              <Text style={styles.invoiceMeta}>{dateStr(order.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* DETAILS */}
        <View style={styles.grid}>
          <View style={styles.col}>
            <Text>Bill To</Text>
            <Text>{order.firstName} {order.lastName}</Text>
            <Text>{order.email}</Text>
            {order.phone && <Text>{order.phone}</Text>}
          </View>
          <View style={styles.colSpacer} />
          <View style={styles.col}>
            <Text>Ship To</Text>
            <Text>{order.address}</Text>
            <Text>{order.city}{order.state ? `, ${order.state}` : ""} {order.zip}</Text>
            <Text>Delivery: {order.deliveryMethod}</Text>
            <Text>Payment: {order.paymentMethod}</Text>
          </View>
          <View style={styles.colSpacer} />
          <View style={styles.col}>
            <Text>From</Text>
            <Text>Distressed</Text>
          </View>
        </View>

        {/* ITEMS */}
        <View style={styles.table}>
          <View style={styles.trHead}>
            <Text style={[styles.th, styles.cProduct]}>Product</Text>
            <Text style={[styles.th, styles.cOptions]}>Options</Text>
            <Text style={[styles.th, styles.cQty]}>Qty</Text>
            <Text style={[styles.th, styles.cPrice]}>Price</Text>
            <Text style={[styles.th, styles.cLine]}>Line</Text>
          </View>
          {order.products.map((p, i) => {
            const line = p.price * p.quantity;
            return (
              <View key={`${p.product._id}-${i}`} style={styles.tr}>
                <Text style={[styles.td, styles.cProduct]}>{p.product.title}</Text>
                <Text style={[styles.td, styles.cOptions]}>{optionsOf(p) || "-"}</Text>
                <Text style={[styles.td, styles.cQty]}>{String(p.quantity)}</Text>
                <Text style={[styles.td, styles.cPrice]}>{fmt(p.price)}</Text>
                <Text style={[styles.td, styles.cLine]}>{fmt(line)}</Text>
              </View>
            );
          })}
        </View>

        {/* TOTALS */}
        <View style={styles.totals}>
          <View style={styles.trow}><Text>Subtotal</Text><Text>{fmt(order.subtotal)}</Text></View>
          <View style={styles.trow}><Text>Shipping</Text><Text>{fmt(order.shipping)}</Text></View>
          {order.discount > 0 && (
            <View style={styles.trow}><Text>Discount</Text><Text>- {fmt(order.discount)}</Text></View>
          )}
          <View style={[styles.trow, styles.grand]}><Text>Total</Text><Text>{fmt(order.totalAmount)}</Text></View>
        </View>

        <View style={styles.footer}><Text>Thank you for your order — keep it raw.</Text></View>
      </Page>
    </PdfDocument>
  );

  const blob = await pdf(element).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoice-${order._id}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
