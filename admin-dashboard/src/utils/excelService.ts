import * as XLSX from 'xlsx';
import type { Order, Product, Category, InventoryItem, Customer } from '@/types';
import { generateId, generateOrderNumber } from './formatters';

// ==================== INTERFACES ====================

export interface ValidationError {
  rowNumber: number;
  field: string;
  value: any;
  error: string;
  suggestion: string;
}

export interface ValidationResult<T> {
  validRows: T[];
  errorRows: ValidationError[];
  duplicates: { rowNumber: number; identifier: string; record: T }[];
  totalRows: number;
}

export interface ExportColumn {
  key: string;
  label: string;
  selected?: boolean;
}

// ==================== HELPER DOWNLOAD ====================

function saveWorkbook(wb: XLSX.WorkBook, fileName: string) {
  const finalName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(wb, finalName, { bookType: 'xlsx', type: 'binary' });
}

// ==================== EXPORT: ORDERS ====================

export const orderExportColumns: ExportColumn[] = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'customerName', label: 'Customer Name' },
  { key: 'customerEmail', label: 'Customer Email' },
  { key: 'totalAmount', label: 'Total Amount ($)' },
  { key: 'subtotal', label: 'Subtotal ($)' },
  { key: 'shipping', label: 'Shipping ($)' },
  { key: 'tax', label: 'Tax ($)' },
  { key: 'status', label: 'Order Status' },
  { key: 'paymentStatus', label: 'Payment Status' },
  { key: 'shippingAddress', label: 'Shipping Address' },
  { key: 'itemsCount', label: 'Items Count' },
  { key: 'itemsSummary', label: 'Items Summary' },
  { key: 'date', label: 'Order Date' },
  { key: 'notes', label: 'Notes' },
];

export function exportOrdersToExcel(orders: Order[], fileName = 'orders_export.xlsx', selectedColumns?: string[]) {
  const activeKeys = selectedColumns && selectedColumns.length > 0
    ? selectedColumns
    : orderExportColumns.map(c => c.key);

  const rows = orders.map(o => {
    const fullRow: Record<string, any> = {
      orderNumber: o.orderNumber,
      customerName: o.customer.name,
      customerEmail: o.customer.email,
      totalAmount: o.totalAmount,
      subtotal: o.subtotal,
      shipping: o.shipping,
      tax: o.tax,
      status: o.status,
      paymentStatus: o.paymentStatus,
      shippingAddress: o.shippingAddress,
      itemsCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      itemsSummary: o.items.map(i => `${i.productName} (x${i.quantity})`).join(', '),
      date: o.createdAt,
      notes: o.notes || '',
    };

    const filtered: Record<string, any> = {};
    activeKeys.forEach(k => {
      const col = orderExportColumns.find(c => c.key === k);
      const label = col ? col.label : k;
      filtered[label] = fullRow[k];
    });
    return filtered;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 20 }, { wch: 25 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 35 },
    { wch: 12 }, { wch: 40 }, { wch: 15 }, { wch: 25 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders');
  saveWorkbook(wb, fileName);
}

export function downloadOrdersTemplate() {
  const templateRows = [
    {
      'Order #': '#ORD-2001',
      'Customer Name': 'Kenji Sato',
      'Customer Email': 'kenji.sato@example.com',
      'Total Amount ($)': 89.99,
      'Subtotal ($)': 79.99,
      'Shipping ($)': 5.00,
      'Tax ($)': 5.00,
      'Order Status': 'completed',
      'Payment Status': 'paid',
      'Shipping Address': '7-8 Akihabara, Chiyoda-ku, Tokyo, Japan',
      'Notes': 'Gift wrapping requested',
    },
    {
      'Order #': '#ORD-2002',
      'Customer Name': 'Sakura Haruno',
      'Customer Email': 'sakura.h@example.com',
      'Total Amount ($)': 45.00,
      'Subtotal ($)': 40.00,
      'Shipping ($)': 0.00,
      'Tax ($)': 5.00,
      'Order Status': 'processing',
      'Payment Status': 'paid',
      'Shipping Address': '456 Cherry Blossom Blvd, Los Angeles, USA',
      'Notes': '',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(templateRows);
  ws['!cols'] = [
    { wch: 14 }, { wch: 20 }, { wch: 25 }, { wch: 16 }, { wch: 14 },
    { wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 15 }, { wch: 35 },
    { wch: 25 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Orders_Template');
  saveWorkbook(wb, 'orders_template.xlsx');
}

// ==================== EXPORT: PRODUCTS ====================

export const productExportColumns: ExportColumn[] = [
  { key: 'sku', label: 'SKU' },
  { key: 'name', label: 'Product Name' },
  { key: 'category', label: 'Category' },
  { key: 'price', label: 'Price ($)' },
  { key: 'compareAtPrice', label: 'Compare At Price ($)' },
  { key: 'stock', label: 'Stock Quantity' },
  { key: 'status', label: 'Status' },
  { key: 'rating', label: 'Rating' },
  { key: 'unitsSold', label: 'Units Sold' },
  { key: 'description', label: 'Description' },
];

export function exportProductsToExcel(products: Product[], fileName = 'products_export.xlsx', selectedColumns?: string[]) {
  const activeKeys = selectedColumns && selectedColumns.length > 0
    ? selectedColumns
    : productExportColumns.map(c => c.key);

  const rows = products.map(p => {
    const fullRow: Record<string, any> = {
      sku: p.sku,
      name: p.name,
      category: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice || '',
      stock: p.stock,
      status: p.status,
      rating: p.rating,
      unitsSold: p.unitsSold,
      description: p.description,
    };
    const filtered: Record<string, any> = {};
    activeKeys.forEach(k => {
      const col = productExportColumns.find(c => c.key === k);
      const label = col ? col.label : k;
      filtered[label] = fullRow[k];
    });
    return filtered;
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 20 },
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 45 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products');
  saveWorkbook(wb, fileName);
}

export function downloadProductsTemplate() {
  const templateRows = [
    {
      'SKU': 'FIG-101',
      'Product Name': 'Zoro Wano Samurai Figure',
      'Category': 'Figures & Statues',
      'Price ($)': 59.99,
      'Compare At Price ($)': 79.99,
      'Stock Quantity': 30,
      'Status': 'active',
      'Description': 'Premium Roronoa Zoro Three Sword Style action figure with detailed kimono pattern.',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateRows);
  ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 40 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Products_Template');
  saveWorkbook(wb, 'products_template.xlsx');
}

// ==================== EXPORT: CATEGORIES ====================

export function exportCategoriesToExcel(categories: Category[], fileName = 'categories_export.xlsx') {
  const rows = categories.map(c => ({
    'Category Name': c.name,
    'Slug': c.slug,
    'Description': c.description,
    'Products Count': c.productCount,
    'Status': c.status,
    'Created Date': c.createdAt,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 22 }, { wch: 20 }, { wch: 35 }, { wch: 15 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Categories');
  saveWorkbook(wb, fileName);
}

export function downloadCategoriesTemplate() {
  const templateRows = [
    {
      'Category Name': 'Gaming & Plushies',
      'Slug': 'gaming-plushies',
      'Description': 'Soft plushies and accessories from top anime games.',
      'Status': 'active',
    },
  ];
  const ws = XLSX.utils.json_to_sheet(templateRows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Categories_Template');
  saveWorkbook(wb, 'categories_template.xlsx');
}

// ==================== EXPORT: INVENTORY ====================

export function exportInventoryToExcel(inventory: InventoryItem[], fileName = 'inventory_export.xlsx') {
  const rows = inventory.map(i => ({
    'SKU': i.sku,
    'Product Name': i.productName,
    'Category': i.category,
    'Current Stock': i.currentStock,
    'Min Stock': i.minStock,
    'Max Stock': i.maxStock,
    'Status': i.status,
    'Last Restocked': i.lastRestocked,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
  saveWorkbook(wb, fileName);
}

// ==================== EXPORT: CUSTOMERS ====================

export function exportCustomersToExcel(customers: Customer[], fileName = 'customers_export.xlsx') {
  const rows = customers.map(c => ({
    'Customer Name': c.name,
    'Email Address': c.email,
    'Phone': c.phone,
    'Address': c.address,
    'City': c.city,
    'Country': c.country,
    'Total Orders': c.totalOrders,
    'Total Spent ($)': c.totalSpent,
    'Status': c.status,
    'Joined Date': c.joinedAt,
  }));
  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 18 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 14 }, { wch: 16 }, { wch: 12 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Customers');
  saveWorkbook(wb, fileName);
}

// ==================== PARSER ====================

export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  // Security size check: max 10MB
  const maxBytes = 10 * 1024 * 1024;
  if (file.size > maxBytes) {
    throw new Error('File exceeds the 10MB size limit.');
  }

  const validExts = ['.xlsx', '.xls'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExts.includes(ext)) {
    throw new Error('Invalid file format. Please upload an Excel (.xlsx or .xls) file.');
  }

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The uploaded Excel workbook contains no sheets.');
  }

  const worksheet = wb.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
  return rows;
}

// ==================== VALIDATORS ====================

// Normalizes object keys (lowercased, spaces/symbols stripped)
function normalizeRow(row: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  Object.keys(row).forEach(k => {
    const cleanKey = k.toLowerCase().replace(/[^a-z0-9]/g, '');
    clean[cleanKey] = row[k];
  });
  return clean;
}

export function validateOrdersImport(
  rawRows: Record<string, any>[],
  existingOrders: Order[]
): ValidationResult<Order> {
  const validRows: Order[] = [];
  const errorRows: ValidationError[] = [];
  const duplicates: { rowNumber: number; identifier: string; record: Order }[] = [];

  const existingMap = new Map(existingOrders.map(o => [o.orderNumber.toLowerCase(), o]));

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2; // +1 for 0-index, +1 for header row
    const row = normalizeRow(raw);

    // Find fields with various possible header names
    const orderNumber = (row['order'] || row['ordernumber'] || row['orderid'] || '').toString().trim();
    const customerName = (row['customername'] || row['customer'] || row['name'] || '').toString().trim();
    const customerEmail = (row['customeremail'] || row['email'] || '').toString().trim();
    const totalAmountRaw = row['totalamount'] || row['total'] || row['amount'];
    const subtotalRaw = row['subtotal'] || totalAmountRaw;
    const shippingRaw = row['shipping'] || row['shippingfee'] || 0;
    const taxRaw = row['tax'] || 0;
    const statusRaw = (row['orderstatus'] || row['status'] || 'pending').toString().toLowerCase().trim();
    const paymentStatusRaw = (row['paymentstatus'] || row['payment'] || 'pending').toString().toLowerCase().trim();
    const shippingAddress = (row['shippingaddress'] || row['address'] || '').toString().trim();
    const notes = (row['notes'] || '').toString().trim();

    // 1. Required fields
    if (!customerName) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Customer Name',
        value: customerName,
        error: 'Missing required field',
        suggestion: 'Provide customer full name (e.g. John Doe)',
      });
    }

    if (!customerEmail) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Customer Email',
        value: customerEmail,
        error: 'Missing required field',
        suggestion: 'Provide valid email address',
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Customer Email',
        value: customerEmail,
        error: 'Invalid email format',
        suggestion: 'Format as name@example.com',
      });
    }

    // 2. Numeric validation
    const totalAmount = parseFloat(totalAmountRaw);
    if (isNaN(totalAmount) || totalAmount < 0) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Total Amount',
        value: totalAmountRaw,
        error: 'Invalid numeric value',
        suggestion: 'Enter a valid positive number (e.g. 49.99)',
      });
    }

    // 3. Status validation
    const allowedStatuses = ['completed', 'processing', 'pending', 'cancelled'];
    const status = allowedStatuses.includes(statusRaw) ? statusRaw : 'pending';
    if (!allowedStatuses.includes(statusRaw)) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Order Status',
        value: statusRaw,
        error: `Invalid status "${statusRaw}"`,
        suggestion: 'Use: completed, processing, pending, or cancelled',
      });
    }

    const allowedPayment = ['paid', 'pending', 'refunded'];
    const paymentStatus = allowedPayment.includes(paymentStatusRaw) ? paymentStatusRaw : 'pending';

    // If row had errors, skip adding to valid
    const hasRowError = errorRows.some(e => e.rowNumber === rowNum);
    if (hasRowError) return;

    const finalOrderNumber = orderNumber || generateOrderNumber();
    const today = new Date().toISOString().split('T')[0];

    const parsedOrder: Order = {
      id: generateId(),
      orderNumber: finalOrderNumber,
      customer: {
        id: generateId(),
        name: customerName,
        email: customerEmail,
        avatar: '',
      },
      items: [
        {
          productId: 'prod-import',
          productName: 'Imported Order Items',
          productImage: '',
          quantity: 1,
          price: totalAmount,
          total: totalAmount,
        },
      ],
      subtotal: parseFloat(subtotalRaw) || totalAmount,
      shipping: parseFloat(shippingRaw) || 0,
      tax: parseFloat(taxRaw) || 0,
      totalAmount,
      status: status as Order['status'],
      paymentStatus: paymentStatus as Order['paymentStatus'],
      shippingAddress: shippingAddress || 'Standard Delivery',
      notes,
      createdAt: today,
      updatedAt: today,
    };

    // Check duplicate
    if (existingMap.has(finalOrderNumber.toLowerCase())) {
      duplicates.push({ rowNumber: rowNum, identifier: finalOrderNumber, record: parsedOrder });
    }

    validRows.push(parsedOrder);
  });

  return {
    validRows,
    errorRows,
    duplicates,
    totalRows: rawRows.length,
  };
}

export function validateProductsImport(
  rawRows: Record<string, any>[],
  existingProducts: Product[],
  categories: Category[]
): ValidationResult<Product> {
  const validRows: Product[] = [];
  const errorRows: ValidationError[] = [];
  const duplicates: { rowNumber: number; identifier: string; record: Product }[] = [];

  const existingSkuMap = new Map(existingProducts.map(p => [p.sku.toUpperCase(), p]));
  const catNames = new Set(categories.map(c => c.name.toLowerCase()));

  rawRows.forEach((raw, idx) => {
    const rowNum = idx + 2;
    const row = normalizeRow(raw);

    const sku = (row['sku'] || '').toString().trim().toUpperCase();
    const name = (row['productname'] || row['name'] || '').toString().trim();
    const categoryName = (row['category'] || '').toString().trim();
    const priceRaw = row['price'];
    const compareAtRaw = row['compareatprice'] || row['compareat'];
    const stockRaw = row['stockquantity'] || row['stock'];
    const statusRaw = (row['status'] || 'active').toString().toLowerCase().trim();
    const description = (row['description'] || '').toString().trim();

    if (!sku) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'SKU',
        value: sku,
        error: 'Missing required field',
        suggestion: 'Provide unique SKU like FIG-101',
      });
    }

    if (!name) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Product Name',
        value: name,
        error: 'Missing required field',
        suggestion: 'Enter product title',
      });
    }

    const price = parseFloat(priceRaw);
    if (isNaN(price) || price <= 0) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Price',
        value: priceRaw,
        error: 'Invalid price value',
        suggestion: 'Must be a number greater than 0',
      });
    }

    const stock = parseInt(stockRaw, 10);
    if (isNaN(stock) || stock < 0) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Stock Quantity',
        value: stockRaw,
        error: 'Invalid stock number',
        suggestion: 'Enter an integer 0 or greater',
      });
    }

    if (categoryName && !catNames.has(categoryName.toLowerCase())) {
      errorRows.push({
        rowNumber: rowNum,
        field: 'Category',
        value: categoryName,
        error: `Category "${categoryName}" does not exist`,
        suggestion: `Choose from: ${categories.map(c => c.name).join(', ')}`,
      });
    }

    const hasRowError = errorRows.some(e => e.rowNumber === rowNum);
    if (hasRowError) return;

    const matchedCat = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase()) || categories[0];
    const today = new Date().toISOString().split('T')[0];

    const parsedProduct: Product = {
      id: generateId(),
      sku,
      name,
      description: description || `${name} imported product.`,
      price,
      compareAtPrice: compareAtRaw ? parseFloat(compareAtRaw) : undefined,
      category: matchedCat ? matchedCat.name : 'Figures & Statues',
      categoryId: matchedCat ? matchedCat.id : 'cat-1',
      stock,
      status: ['active', 'draft', 'archived'].includes(statusRaw) ? (statusRaw as any) : 'active',
      images: [],
      rating: 0,
      reviewCount: 0,
      unitsSold: 0,
      tags: [],
      createdAt: today,
      updatedAt: today,
    };

    if (existingSkuMap.has(sku)) {
      duplicates.push({ rowNumber: rowNum, identifier: sku, record: parsedProduct });
    }

    validRows.push(parsedProduct);
  });

  return {
    validRows,
    errorRows,
    duplicates,
    totalRows: rawRows.length,
  };
}
