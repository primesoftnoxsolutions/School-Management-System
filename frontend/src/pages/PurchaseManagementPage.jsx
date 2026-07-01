import { useMemo, useState } from "react";
import FormModal from "../components/ui/FormModal";
import PageHeader from "../components/ui/PageHeader";
import { IconEye, IconPrint } from "../components/icons/NavIcons";
import { CLASS_OPTIONS, SECTION_OPTIONS } from "../constants/classes";
import {
  getPurchaseCategoryLabel,
  getStoredPurchases,
  PURCHASE_CATEGORIES,
  purchasesToCsv,
  saveStoredPurchases,
  summarizePurchases,
} from "../utils/purchaseStore";

const initialForm = {
  date: new Date().toISOString().slice(0, 10),
  className: "",
  section: "",
  category: "DESKS",
  itemName: "",
  vendor: "",
  quantity: "",
  unitCost: "",
  notes: "",
};

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString()}`;

function PurchaseDetails({ item }) {
  if (!item) return null;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {[
          ["Date", item.date || "-"],
          ["Class / Section", item.className ? `${item.className} ${item.section || ""}` : "-"],
          ["Category", getPurchaseCategoryLabel(item.category)],
          ["Item", item.itemName],
          ["Vendor", item.vendor || "-"],
          ["Quantity", item.quantity],
          ["Unit Cost", currency(item.unitCost)],
          ["Total Amount", currency(item.totalAmount)],
          ["Notes", item.notes || "-"],
        ].map(([label, value]) => (
          <div key={label} className={label === "Notes" ? "md:col-span-2" : ""}>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PurchaseManagementPage() {
  const [items, setItems] = useState(() => getStoredPurchases());
  const [form, setForm] = useState(initialForm);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const summary = useMemo(() => summarizePurchases(items), [items]);

  const saveItems = (nextItems) => {
    setItems(nextItems);
    saveStoredPurchases(nextItems);
  };

  const submitPurchase = (event) => {
    event.preventDefault();
    const quantity = Math.max(0, Number(form.quantity || 0));
    const unitCost = Math.max(0, Number(form.unitCost || 0));
    if (!form.itemName.trim() || !quantity) return;

    saveItems([
      {
        id: crypto.randomUUID(),
        ...form,
        quantity,
        unitCost,
        totalAmount: quantity * unitCost,
        createdAt: new Date().toISOString(),
      },
      ...items,
    ]);
    setForm(initialForm);
    setShowAddModal(false);
  };

  const downloadCsv = () => {
    const blob = new Blob([purchasesToCsv(items)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "purchase-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const printPurchase = (item) => {
    const printWindow = window.open("", "_blank", "width=760,height=840");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Purchase Record</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
            h1 { margin-bottom: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            td { border: 1px solid #e2e8f0; padding: 12px; }
            td:first-child { width: 34%; font-weight: 700; background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Purchase Record</h1>
          <p>Naseer Ideal Public School</p>
          <table>
            <tr><td>Date</td><td>${item.date || "-"}</td></tr>
            <tr><td>Class / Section</td><td>${item.className ? `${item.className} ${item.section || ""}` : "-"}</td></tr>
            <tr><td>Category</td><td>${getPurchaseCategoryLabel(item.category)}</td></tr>
            <tr><td>Item</td><td>${item.itemName || "-"}</td></tr>
            <tr><td>Vendor</td><td>${item.vendor || "-"}</td></tr>
            <tr><td>Quantity</td><td>${item.quantity || 0}</td></tr>
            <tr><td>Unit Cost</td><td>${currency(item.unitCost)}</td></tr>
            <tr><td>Total Amount</td><td>${currency(item.totalAmount)}</td></tr>
            <tr><td>Notes</td><td>${item.notes || "-"}</td></tr>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <section className="space-y-6">
      <PageHeader
        title="Purchase Management"
        subtitle="Manage school furniture and equipment purchases."
        actionLabel="Add Purchase"
        onAction={() => setShowAddModal(true)}
        afterAction={
          <button type="button" className="ref-btn-outline" onClick={downloadCsv} disabled={!items.length}>
            Download Purchase Report
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {[
          ["Desks", summary.desks],
          ["Benches & Chairs", summary.benchesChairs],
          ["Bulbs", summary.bulbs],
          ["Fans", summary.fans],
          ["Total Spent", currency(summary.totalAmount)],
        ].map(([label, value]) => (
          <div key={label} className="ref-card p-4">
            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="ref-card overflow-x-auto p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              {["Date", "Class", "Category", "Item", "Vendor", "Qty", "Unit Cost", "Total", "Action"].map((heading) => (
                <th key={heading} className="px-5 py-3 font-medium">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-3 text-slate-700">{item.date || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{item.className ? `${item.className} ${item.section || ""}` : "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{getPurchaseCategoryLabel(item.category)}</td>
                  <td className="px-5 py-3 font-medium text-slate-800">{item.itemName}</td>
                  <td className="px-5 py-3 text-slate-700">{item.vendor || "-"}</td>
                  <td className="px-5 py-3 text-slate-700">{item.quantity}</td>
                  <td className="px-5 py-3 text-slate-700">{currency(item.unitCost)}</td>
                  <td className="px-5 py-3 font-semibold text-slate-900">{currency(item.totalAmount)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => setSelectedItem(item)}
                        aria-label="View purchase"
                      >
                        <IconEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                        onClick={() => printPurchase(item)}
                        aria-label="Print purchase"
                      >
                        <IconPrint className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="px-5 py-8 text-center text-slate-500">
                  No purchases recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal open={showAddModal} title="Add Purchase" onClose={() => setShowAddModal(false)} wide>
        <form onSubmit={submitPurchase} className="space-y-5">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <p className="text-sm font-bold text-slate-900">Purchase Details</p>
            <p className="mt-1 text-xs text-slate-500">Record furniture or equipment purchases class-wise when needed.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input type="date" className="ref-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className="ref-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {PURCHASE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>{category.label}</option>
              ))}
            </select>
            <select className="ref-input" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}>
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((className) => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
            <select className="ref-input" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
              <option value="">Select section</option>
              {SECTION_OPTIONS.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <input className="ref-input" placeholder="Item name *" value={form.itemName} onChange={(e) => setForm({ ...form, itemName: e.target.value })} required />
            <input className="ref-input" placeholder="Vendor" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
            <input type="number" min="1" className="ref-input" placeholder="Quantity *" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <input type="number" min="0" className="ref-input" placeholder="Unit cost" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
            <input className="ref-input md:col-span-2" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <button type="submit" className="ref-btn-primary w-full">
            Save Purchase
          </button>
        </form>
      </FormModal>

      <FormModal open={Boolean(selectedItem)} title="Purchase Details" onClose={() => setSelectedItem(null)}>
        <div className="space-y-4">
          <PurchaseDetails item={selectedItem} />
          <button type="button" className="ref-btn-primary w-full" onClick={() => printPurchase(selectedItem)}>
            Print Purchase Record
          </button>
        </div>
      </FormModal>
    </section>
  );
}
