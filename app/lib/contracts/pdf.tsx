/* eslint-disable @next/next/no-img-element */
import { Document, Page, StyleSheet, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { company as sellerCompany } from "../../shared/company";
import { parseTermsToBlocks, renderContractTerms, type ContractBlock } from "./render";
import { CONTRACT_TYPE_LABEL, formatMoney, type Contract } from "./types";

const styles = StyleSheet.create({
  page: { padding: 56, fontSize: 10.5, fontFamily: "Helvetica", color: "#0f172a", lineHeight: 1.55 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 },
  brand: { fontSize: 16, fontWeight: 700, color: "#0f6b46" },
  brandSmall: { fontSize: 8.5, color: "#64748b", marginTop: 2 },
  headerMeta: { textAlign: "right", fontSize: 9, color: "#475569" },
  headerMetaTitle: { fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 4 },
  rule: { borderBottomColor: "#e2e8f0", borderBottomWidth: 1, marginBottom: 16 },
  h2: { fontSize: 14, fontWeight: 700, marginTop: 14, marginBottom: 8, color: "#0f6b46" },
  h3: { fontSize: 11.5, fontWeight: 700, marginTop: 12, marginBottom: 6, color: "#0f172a" },
  p: { marginBottom: 6 },
  li: { marginBottom: 3, paddingLeft: 10 },
  bullet: { width: 8 },
  table: { marginVertical: 10, borderColor: "#cbd5e1", borderWidth: 1, borderRadius: 2 },
  trHead: { flexDirection: "row", backgroundColor: "#f1f5f9", borderBottomColor: "#cbd5e1", borderBottomWidth: 1 },
  tr: { flexDirection: "row", borderBottomColor: "#e2e8f0", borderBottomWidth: 1 },
  trLast: { flexDirection: "row" },
  th: { padding: 6, fontSize: 9, fontWeight: 700, color: "#334155" },
  td: { padding: 6, fontSize: 9.5, color: "#0f172a" },
  colName: { width: "44%" },
  colQty: { width: "14%", textAlign: "right" },
  colUnit: { width: "12%" },
  colPrice: { width: "15%", textAlign: "right" },
  colSub: { width: "15%", textAlign: "right" },
  totals: { flexDirection: "row", justifyContent: "flex-end", marginTop: 8 },
  totalsBox: { width: "40%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 },
  totalLabel: { fontSize: 10, color: "#475569" },
  totalValue: { fontSize: 10.5, fontWeight: 700, color: "#0f172a" },
  signaturesWrap: { flexDirection: "row", justifyContent: "space-between", marginTop: 32, gap: 24 },
  sigBox: { flex: 1 },
  sigLabel: { fontSize: 9, color: "#64748b", marginBottom: 24 },
  sigLine: { borderBottomColor: "#94a3b8", borderBottomWidth: 1, marginBottom: 4 },
  sigName: { fontSize: 10, fontWeight: 700 },
  sigTitle: { fontSize: 8.5, color: "#475569" },
  footer: {
    position: "absolute",
    left: 56,
    right: 56,
    bottom: 28,
    fontSize: 8,
    color: "#94a3b8",
    borderTopColor: "#e2e8f0",
    borderTopWidth: 1,
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  auditFooter: {
    marginTop: 14,
    padding: 10,
    backgroundColor: "#f1f5f9",
    fontSize: 8.5,
    color: "#475569",
    borderRadius: 2
  }
});

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh"
    }) + " ICT";
  } catch {
    return iso;
  }
}

function LineItemsTable({ contract }: { contract: Contract }) {
  const items = contract.lineItems ?? [];
  return (
    <View style={styles.table}>
      <View style={styles.trHead}>
        <Text style={[styles.th, styles.colName]}>Description</Text>
        <Text style={[styles.th, styles.colQty]}>Qty</Text>
        <Text style={[styles.th, styles.colUnit]}>Unit</Text>
        <Text style={[styles.th, styles.colPrice]}>Unit price</Text>
        <Text style={[styles.th, styles.colSub]}>Subtotal</Text>
      </View>
      {items.length === 0 ? (
        <View style={styles.trLast}>
          <Text style={[styles.td, { width: "100%", color: "#94a3b8", fontStyle: "italic" }]}>
            (no line items)
          </Text>
        </View>
      ) : (
        items.map((it, i) => {
          const last = i === items.length - 1;
          return (
            <View key={i} style={last ? styles.trLast : styles.tr}>
              <View style={[styles.td, styles.colName]}>
                <Text style={{ fontWeight: 700 }}>{it.name}</Text>
                {it.description ? <Text style={{ fontSize: 8.5, color: "#475569" }}>{it.description}</Text> : null}
              </View>
              <Text style={[styles.td, styles.colQty]}>{it.quantity.toLocaleString()}</Text>
              <Text style={[styles.td, styles.colUnit]}>{it.unit}</Text>
              <Text style={[styles.td, styles.colPrice]}>
                {formatMoney(it.unit_price, contract.currency)}
              </Text>
              <Text style={[styles.td, styles.colSub]}>
                {formatMoney(it.subtotal, contract.currency)}
              </Text>
            </View>
          );
        })
      )}
    </View>
  );
}

function Totals({ contract }: { contract: Contract }) {
  const subtotal = contract.lineItems.reduce((s, i) => s + i.subtotal, 0);
  const tax = (subtotal * contract.taxPct) / 100;
  const total = subtotal + tax;
  return (
    <View style={styles.totals}>
      <View style={styles.totalsBox}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>{formatMoney(subtotal, contract.currency)}</Text>
        </View>
        {contract.taxPct > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({contract.taxPct}%)</Text>
            <Text style={styles.totalValue}>{formatMoney(tax, contract.currency)}</Text>
          </View>
        ) : null}
        <View style={[styles.totalRow, { borderTopColor: "#cbd5e1", borderTopWidth: 1, marginTop: 4, paddingTop: 6 }]}>
          <Text style={[styles.totalLabel, { fontWeight: 700, color: "#0f6b46" }]}>Total</Text>
          <Text style={[styles.totalValue, { color: "#0f6b46" }]}>{formatMoney(total, contract.currency)}</Text>
        </View>
      </View>
    </View>
  );
}

function Block({ block, contract }: { block: ContractBlock; contract: Contract }) {
  if (block.type === "heading") {
    return block.level === 2
      ? <Text style={styles.h2}>{block.content}</Text>
      : <Text style={styles.h3}>{block.content}</Text>;
  }
  if (block.type === "list") {
    return (
      <View>
        {block.items.map((item, i) => (
          <View key={i} style={{ flexDirection: "row", marginBottom: 3 }}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.li, { flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </View>
    );
  }
  if (block.type === "line_items") {
    return (
      <>
        <LineItemsTable contract={contract} />
        <Totals contract={contract} />
      </>
    );
  }
  return <Text style={styles.p}>{block.content}</Text>;
}

export function ContractDocument({
  contract,
  audit
}: {
  contract: Contract;
  audit?: { signerName: string; signedAt: string; ip?: string | null; method: string };
}) {
  const renderedHtml = renderContractTerms(contract);
  const blocks = parseTermsToBlocks(renderedHtml, contract.lineItems);

  return (
    <Document
      author={sellerCompany.legalNameEn}
      creator="5B Trading"
      producer="5B Trading"
      subject={`${CONTRACT_TYPE_LABEL[contract.type]} — ${contract.buyerLegalName}`}
      title={contract.contractNumber}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.brand}>5B Trading</Text>
            <Text style={styles.brandSmall}>{sellerCompany.legalNameEn}</Text>
            <Text style={styles.brandSmall}>{sellerCompany.address}</Text>
            <Text style={styles.brandSmall}>Tax ID {sellerCompany.taxId} · {sellerCompany.email}</Text>
          </View>
          <View style={styles.headerMeta}>
            <Text style={styles.headerMetaTitle}>{CONTRACT_TYPE_LABEL[contract.type]}</Text>
            <Text>Contract No.: {contract.contractNumber}</Text>
            <Text>Version: v{contract.version}</Text>
            <Text>Date: {fmt(contract.sentAt ?? contract.createdAt).split(",")[0]}</Text>
          </View>
        </View>
        <View style={styles.rule} />

        {blocks.map((b, i) => (
          <Block block={b} contract={contract} key={i} />
        ))}

        <View style={styles.signaturesWrap} wrap={false}>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>For the Seller</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{sellerCompany.representativeEn}</Text>
            <Text style={styles.sigTitle}>Director, {sellerCompany.legalNameEn}</Text>
          </View>
          <View style={styles.sigBox}>
            <Text style={styles.sigLabel}>For the Buyer</Text>
            <View style={styles.sigLine} />
            <Text style={styles.sigName}>{contract.buyerSignerName || "—"}</Text>
            <Text style={styles.sigTitle}>
              {[contract.buyerSignerTitle, contract.buyerLegalName].filter(Boolean).join(", ")}
            </Text>
          </View>
        </View>

        {audit ? (
          <View style={styles.auditFooter} wrap={false}>
            <Text style={{ fontWeight: 700, marginBottom: 2 }}>Audit trail</Text>
            <Text>
              Electronically accepted by {audit.signerName} on {fmt(audit.signedAt)}
              {audit.ip ? ` from IP ${audit.ip}` : ""}.
            </Text>
            <Text>Method: {audit.method}. Document hash: {contract.id.slice(0, 8)}-v{contract.version}.</Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{contract.contractNumber} · v{contract.version}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
          <Text>{sellerCompany.shortName} · {sellerCompany.email}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function generateContractPdfBuffer(
  contract: Contract,
  audit?: Parameters<typeof ContractDocument>[0]["audit"]
): Promise<Buffer> {
  return await renderToBuffer(<ContractDocument audit={audit} contract={contract} />);
}
