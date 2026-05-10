'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  companyInfo: {
    fontSize: 9,
    color: '#666666',
    textAlign: 'right',
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 20,
  },
  infoSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  infoBlock: {
    width: '48%',
  },
  label: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 11,
    color: '#111111',
    marginBottom: 2,
  },
  table: {
    marginTop: 20,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  col1: { width: '50%' },
  col2: { width: '20%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  cellText: {
    fontSize: 10,
    color: '#111111',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 200,
    marginBottom: 6,
  },
  totalLabel: {
    fontSize: 10,
    color: '#666666',
    width: 100,
  },
  totalValue: {
    fontSize: 10,
    color: '#111111',
    width: 100,
    textAlign: 'right',
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: 200,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#10b981',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111111',
    width: 100,
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10b981',
    width: 100,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 4,
  },
  paymentTerms: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  paymentTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111111',
    marginBottom: 6,
  },
  paymentText: {
    fontSize: 9,
    color: '#666666',
  },
})

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customer: {
    name: string
    address?: string
    city?: string
    phone?: string
    email?: string
  }
  job: {
    description: string
    serviceType: string
    amount: number
  }
  materials?: Array<{
    description: string
    quantity: number
    unit: string
    cost: number
  }>
}

export function InvoicePDF({ data }: { data: InvoiceData }) {
  const subtotal = data.job.amount
  const materialsTotal = data.materials?.reduce((sum, m) => sum + (m.cost * m.quantity), 0) || 0
  const total = subtotal + materialsTotal

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BLACK BEAR</Text>
            <Text style={{ fontSize: 10, color: '#666666' }}>TREE CARE</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text>Black Bear Tree Care</Text>
            <Text>Austin, TX</Text>
            <Text>info@blackbeartreecare.com</Text>
          </View>
        </View>

        {/* Invoice Title */}
        <Text style={styles.invoiceTitle}>INVOICE</Text>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Bill To</Text>
            <Text style={styles.value}>{data.customer.name}</Text>
            {data.customer.address && <Text style={styles.value}>{data.customer.address}</Text>}
            {data.customer.city && <Text style={styles.value}>{data.customer.city}</Text>}
            {data.customer.phone && <Text style={styles.value}>{data.customer.phone}</Text>}
            {data.customer.email && <Text style={styles.value}>{data.customer.email}</Text>}
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.label}>Invoice Number</Text>
            <Text style={styles.value}>{data.invoiceNumber}</Text>
            <Text style={{ ...styles.label, marginTop: 10 }}>Invoice Date</Text>
            <Text style={styles.value}>{data.date}</Text>
            <Text style={{ ...styles.label, marginTop: 10 }}>Due Date</Text>
            <Text style={styles.value}>{data.dueDate}</Text>
          </View>
        </View>

        {/* Services Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={{ ...styles.tableHeaderText, ...styles.col1 }}>Description</Text>
            <Text style={{ ...styles.tableHeaderText, ...styles.col2 }}>Service</Text>
            <Text style={{ ...styles.tableHeaderText, ...styles.col3 }}>Qty</Text>
            <Text style={{ ...styles.tableHeaderText, ...styles.col4 }}>Amount</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={{ ...styles.cellText, ...styles.col1 }}>{data.job.description || 'Tree service'}</Text>
            <Text style={{ ...styles.cellText, ...styles.col2 }}>{data.job.serviceType}</Text>
            <Text style={{ ...styles.cellText, ...styles.col3 }}>1</Text>
            <Text style={{ ...styles.cellText, ...styles.col4 }}>${data.job.amount.toFixed(2)}</Text>
          </View>
          {data.materials?.map((material, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={{ ...styles.cellText, ...styles.col1 }}>{material.description}</Text>
              <Text style={{ ...styles.cellText, ...styles.col2 }}>Material</Text>
              <Text style={{ ...styles.cellText, ...styles.col3 }}>{material.quantity} {material.unit}</Text>
              <Text style={{ ...styles.cellText, ...styles.col4 }}>${(material.cost * material.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
          </View>
          {materialsTotal > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Materials</Text>
              <Text style={styles.totalValue}>${materialsTotal.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Total Due</Text>
            <Text style={styles.grandTotalValue}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Payment Terms */}
        <View style={styles.paymentTerms}>
          <Text style={styles.paymentTitle}>Payment Terms</Text>
          <Text style={styles.paymentText}>
            Payment is due within 30 days of invoice date. We accept cash, check, Venmo, and all major credit cards.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for choosing Black Bear Tree Care!</Text>
          <Text style={styles.footerText}>Questions? Contact us at info@blackbeartreecare.com</Text>
        </View>
      </Page>
    </Document>
  )
}
