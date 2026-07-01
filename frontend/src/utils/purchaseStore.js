const PURCHASE_STORAGE_KEY = "finance-manager-purchases";

export const PURCHASE_CATEGORIES = [
  { value: "DESKS", label: "Desks" },
  { value: "BENCHES_CHAIRS", label: "Benches & Chairs" },
  { value: "BULBS", label: "Bulbs" },
  { value: "FANS", label: "Fans" },
];

export const getPurchaseCategoryLabel = (value) =>
  PURCHASE_CATEGORIES.find((category) => category.value === value)?.label || value;

export const getStoredPurchases = () => {
  try {
    const raw = localStorage.getItem(PURCHASE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveStoredPurchases = (items) => {
  localStorage.setItem(PURCHASE_STORAGE_KEY, JSON.stringify(items));
};

export const summarizePurchases = (items = getStoredPurchases()) =>
  items.reduce(
    (summary, item) => {
      const quantity = Number(item.quantity || 0);
      const total = Number(item.totalAmount || 0);
      if (item.category === "DESKS") summary.desks += quantity;
      if (item.category === "BENCHES_CHAIRS") summary.benchesChairs += quantity;
      if (item.category === "BULBS") summary.bulbs += quantity;
      if (item.category === "FANS") summary.fans += quantity;
      summary.totalAmount += total;
      summary.totalItems += quantity;
      return summary;
    },
    { desks: 0, benchesChairs: 0, bulbs: 0, fans: 0, totalAmount: 0, totalItems: 0 }
  );

export const purchasesToCsv = (items = []) => {
  const rows = [
    ["Date", "Class", "Section", "Category", "Item", "Vendor", "Quantity", "Unit Cost", "Total Amount", "Notes"],
    ...items.map((item) => [
      item.date || "",
      item.className || "",
      item.section || "",
      getPurchaseCategoryLabel(item.category),
      item.itemName || "",
      item.vendor || "",
      item.quantity || 0,
      item.unitCost || 0,
      item.totalAmount || 0,
      item.notes || "",
    ]),
  ];

  return rows
    .map((row) =>
      row
        .map((value) => String(value ?? "").replaceAll('"', '""'))
        .map((value) => `"${value}"`)
        .join(",")
    )
    .join("\n");
};
