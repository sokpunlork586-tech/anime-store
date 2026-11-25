import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import type { Order } from '@/types';
import { formatCurrency, formatFullDateTime } from '@/utils/formatters';
import { useApp } from '@/contexts/AppContext';

interface AnimeInvoiceModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

// 8 fixed rows as seen on the A5 template
const TOTAL_TABLE_ROWS = 8;

export default function AnimeInvoiceModal({ order, isOpen, onClose }: AnimeInvoiceModalProps) {
  const { settings } = useApp();
  const printContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const dt = formatFullDateTime(order.createdAt);
  const emptyRowsCount = Math.max(0, TOTAL_TABLE_ROWS - order.items.length);

  // Exact color themes from original reference image:
  // Rows 1-2: Sky Blue
  // Rows 3-4: Pastel Pink
  // Rows 5-6: Pastel Purple/Lavender
  // Rows 7-8: Pastel Purple/Lavender
  const getRowTheme = (idx: number) => {
    if (idx < 2) {
      return { border: 'border-[#BEE3F8]', bg: 'bg-[#F2F9FD]' };
    } else if (idx < 4) {
      return { border: 'border-[#FED7E2]', bg: 'bg-[#FFF5F8]' };
    } else {
      return { border: 'border-[#E9D8FD]', bg: 'bg-[#FAF5FF]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#F0D9C4] flex flex-col max-h-[96vh] overflow-hidden print:max-w-none print:shadow-none print:border-none print:rounded-none print:max-h-none print:w-full">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-[#FDE8EF] via-[#F4EAFB] to-[#E6F4FE] border-b border-[#EAD7EC] print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <div>
              <h3 className="text-[18px] font-semibold text-[#4A2D4B] flex items-center gap-2">
                Anime World Invoice Template
                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-white/80 text-[#8B4D7E] border border-[#E0BFDF]">
                  A5 (148 x 210 mm)
                </span>
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#B85C38] to-[#E06D44] hover:from-[#9C4B2B] hover:to-[#C75A32] text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white text-text-muted hover:text-text-primary transition border border-[#EAD7EC] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Area */}
        <div className="overflow-y-auto p-3 sm:p-6 bg-[#F8F5F2] flex justify-center print:p-0 print:bg-white print:overflow-visible">
          {/* A5 Printable Sheet: 148 x 210 mm proportion */}
          <div
            ref={printContentRef}
            id="anime-printable-invoice"
            className="w-full max-w-[560px] bg-white rounded-2xl p-4 sm:p-6 border-2 border-[#E2D4E8] shadow-md text-[#2D211D] relative font-sans print:border-none print:shadow-none print:max-w-none print:p-6"
            style={{
              backgroundImage: 'radial-gradient(#D6C7E0 1.2px, transparent 1.2px)',
              backgroundSize: '12px 12px',
            }}
          >
            {/* White Paper Inner Container with neat solid border matching reference */}
            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-[#C9B5D8] relative overflow-hidden shadow-xs">
              {/* Corner Star Embellishments */}
              <span className="absolute top-2 left-2 text-[#C084FC] text-xs sm:text-sm select-none pointer-events-none">✦</span>
              <span className="absolute top-2 right-2 text-[#60A5FA] text-xs sm:text-sm select-none pointer-events-none">✧</span>
              <span className="absolute bottom-2 left-2 text-[#FBBF24] text-xs sm:text-sm select-none pointer-events-none">✧</span>
              <span className="absolute bottom-2 right-2 text-[#F472B6] text-xs sm:text-sm select-none pointer-events-none">✦</span>

              {/* 1. Header Section */}
              <div className="flex items-start justify-between gap-2 mb-3">
                {/* Brand Logo & Chibis */}
                <div className="flex items-center gap-2">
                  {/* Chibi Boy */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] select-none">💭</span>
                    <svg width="44" height="46" viewBox="0 0 60 65" className="flex-shrink-0">
                      <circle cx="30" cy="24" r="18" fill="#FFE2C6" />
                      <path d="M14 22 Q12 6 30 6 Q48 6 46 22 Q42 12 30 14 Q18 12 14 22 Z" fill="#5D3A1A" />
                      <ellipse cx="23" cy="24" rx="2.5" ry="3.5" fill="#2D211D" />
                      <ellipse cx="37" cy="24" rx="2.5" ry="3.5" fill="#2D211D" />
                      <circle cx="22" cy="22.5" r="1" fill="#FFF" />
                      <circle cx="36" cy="22.5" r="1" fill="#FFF" />
                      <ellipse cx="18" cy="28" rx="2.5" ry="1.2" fill="#FFAAA6" opacity="0.9" />
                      <ellipse cx="42" cy="28" rx="2.5" ry="1.2" fill="#FFAAA6" opacity="0.9" />
                      <path d="M27 30 Q30 33 33 30" stroke="#8C4A28" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <rect x="22" y="38" width="16" height="17" rx="3" fill="#3B82F6" />
                      <polygon points="28,38 30,44 32,38" fill="#EF4444" />
                      <rect x="23" y="53" width="6" height="8" fill="#1E3A8A" />
                      <rect x="31" y="53" width="6" height="8" fill="#1E3A8A" />
                    </svg>
                  </div>

                  {/* 3D Bubble Title: ANIME WORLD */}
                  <div className="flex flex-col items-center justify-center text-center px-1">
                    <div
                      className="text-2xl sm:text-3xl font-black uppercase tracking-wider leading-none select-none"
                      style={{
                        color: '#FF6384',
                        WebkitTextStroke: '1px #3E1F47',
                        textShadow: '2px 2px 0px #FFF, 3px 3px 0px #6366F1',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      ANIME
                    </div>
                    <div
                      className="text-xl sm:text-2xl font-black uppercase tracking-wider leading-none select-none mt-0.5"
                      style={{
                        color: '#38BDF8',
                        WebkitTextStroke: '1px #3E1F47',
                        textShadow: '2px 2px 0px #FFF, 3px 3px 0px #6366F1',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      {settings.storeName ? (settings.storeName.toUpperCase().replace(/^ANIME\s*/i, '') || 'WORLD') : 'WORLD'}
                    </div>
                  </div>

                  {/* Chibi Girl */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] select-none">💬</span>
                    <svg width="44" height="46" viewBox="0 0 60 65" className="flex-shrink-0">
                      <circle cx="30" cy="24" r="18" fill="#FFF0E6" />
                      <path d="M12 24 Q10 4 30 4 Q50 4 48 24 Q44 8 30 10 Q16 8 12 24 Z" fill="#3E202B" />
                      <circle cx="12" cy="18" r="4" fill="#FF6384" />
                      <circle cx="48" cy="18" r="4" fill="#FF6384" />
                      <ellipse cx="23" cy="24" rx="2.5" ry="3.5" fill="#3E202B" />
                      <ellipse cx="37" cy="24" rx="2.5" ry="3.5" fill="#3E202B" />
                      <circle cx="22" cy="22.5" r="1" fill="#FFF" />
                      <circle cx="36" cy="22.5" r="1" fill="#FFF" />
                      <ellipse cx="18" cy="28" rx="2.5" ry="1.2" fill="#FFAAA6" />
                      <ellipse cx="42" cy="28" rx="2.5" ry="1.2" fill="#FFAAA6" />
                      <path d="M26 30 Q30 34 34 30" stroke="#FF6384" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                      <polygon points="20,53 40,53 34,38 26,38" fill="#8B5CF6" />
                      <polygon points="28,38 30,44 32,38" fill="#FBBF24" />
                      <rect x="23" y="53" width="5" height="8" fill="#FFF0E6" />
                      <rect x="32" y="53" width="5" height="8" fill="#FFF0E6" />
                    </svg>
                  </div>
                </div>

                {/* Top Right: INVOICE Title & Meta */}
                <div className="text-right">
                  <h2
                    className="text-2xl sm:text-3xl font-black uppercase tracking-wider"
                    style={{
                      color: '#6366F1',
                      WebkitTextStroke: '1px #3E1F47',
                      textShadow: '2px 2px 0px #FFF, 3px 3px 0px #F472B6',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                  >
                    INVOICE
                  </h2>
                  <div className="mt-1 text-[11px] leading-tight space-y-0.5 text-text-secondary font-medium">
                    <p>
                      <strong className="text-text-primary">Invoice No:</strong>{' '}
                      <span className="font-mono font-bold text-[#6366F1]">{order.orderNumber}</span>
                    </p>
                    <p>
                      <strong className="text-text-primary">Date:</strong>{' '}
                      <span className="font-mono">{dt.date}</span>
                    </p>
                    <p>
                      <strong className="text-text-primary">Time:</strong>{' '}
                      <span className="font-mono text-text-muted">{dt.time || '12:00:00 AM'}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Bill To Information (Matching reference placement) */}
              <div className="mb-3 pl-1 text-[11px] leading-relaxed">
                <p className="font-extrabold text-[#3E1F47] text-xs mb-0.5">Bill To</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
                  <p>
                    <strong className="text-text-primary">Name:</strong> {order.customer.name}
                  </p>
                  <p>
                    <strong className="text-text-primary">Contact:</strong> {order.customer.email || '—'}
                  </p>
                  <p className="sm:col-span-2">
                    <strong className="text-text-primary">Address:</strong> {order.shippingAddress || 'Store Pickup'}
                  </p>
                </div>
              </div>

              {/* 3. Items Table - PIXEL-PERFECT ALIGNED GRID (12 Cols) */}
              <div className="mb-2">
                {/* Table Header Pills (Exact same 12-column grid and h-8 height) */}
                <div className="grid grid-cols-12 gap-1.5 mb-1.5 text-[10px] font-bold text-center">
                  <div className="col-span-1 h-8 rounded-lg border border-[#B8DFF7] bg-[#D0EBFB] text-[#1E5F8A] flex items-center justify-center">
                    No.
                  </div>
                  <div className="col-span-6 h-8 rounded-lg border border-[#B8DFF7] bg-[#D0EBFB] text-[#1E5F8A] flex items-center justify-center gap-1.5">
                    <span>⭐</span>
                    <span>Item Description</span>
                    <span>💬</span>
                  </div>
                  <div className="col-span-1 h-8 rounded-lg border border-[#B8DFF7] bg-[#D0EBFB] text-[#1E5F8A] flex items-center justify-center">
                    Qty
                  </div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#B8DFF7] bg-[#D0EBFB] text-[#1E5F8A] flex items-center justify-center">
                    Unit Price ($)
                  </div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#B8DFF7] bg-[#D0EBFB] text-[#1E5F8A] flex items-center justify-center">
                    Total ($)
                  </div>
                </div>

                {/* Table Body Pill Rows (All rows strictly h-8, equal height, equal proportions) */}
                <div className="space-y-1.5 text-[11px]">
                  {/* Filled Item Rows */}
                  {order.items.map((item, idx) => {
                    const rowColor = getRowTheme(idx);
                    return (
                      <div key={idx} className="grid grid-cols-12 gap-1.5 text-center">
                        <div
                          className={`col-span-1 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-center font-mono text-[10px] text-text-secondary`}
                        >
                          {idx + 1}
                        </div>
                        <div
                          className={`col-span-6 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-start px-3 text-left truncate font-medium text-text-primary`}
                        >
                          {item.productName}
                        </div>
                        <div
                          className={`col-span-1 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-center font-mono font-semibold text-text-primary`}
                        >
                          {item.quantity}
                        </div>
                        <div
                          className={`col-span-2 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-center font-mono text-text-secondary`}
                        >
                          {formatCurrency(item.price)}
                        </div>
                        <div
                          className={`col-span-2 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-center font-mono font-bold text-[#6366F1]`}
                        >
                          {formatCurrency(item.total)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty Aesthetic Placeholder Pill Rows (STRICTLY IDENTICAL h-8 HEIGHT) */}
                  {Array.from({ length: emptyRowsCount }).map((_, idx) => {
                    const rowIdx = order.items.length + idx;
                    const rowColor = getRowTheme(rowIdx);
                    return (
                      <div key={`empty-${idx}`} className="grid grid-cols-12 gap-1.5 text-center">
                        <div
                          className={`col-span-1 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg} flex items-center justify-center font-mono text-[10px] text-text-muted`}
                        >
                          {rowIdx + 1}
                        </div>
                        <div className={`col-span-6 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg}`}></div>
                        <div className={`col-span-1 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg}`}></div>
                        <div className={`col-span-2 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg}`}></div>
                        <div className={`col-span-2 h-8 rounded-lg border ${rowColor.border} ${rowColor.bg}`}></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 4. Subtotal, Tax, Grand Total Pill Rows - 100% DIRECTLY ALIGNED TO TABLE COLUMNS */}
              <div className="mt-2 space-y-1.5 text-[11px]">
                {/* Subtotal Row (Col 9-10 aligns with Unit Price, Col 11-12 aligns with Total) */}
                <div className="grid grid-cols-12 gap-1.5 text-center">
                  <div className="col-span-8"></div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#BEE3F8] bg-[#F0F8FF] flex items-center justify-center font-semibold text-[#2B6CB0]">
                    Subtotal
                  </div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#BEE3F8] bg-white flex items-center justify-center font-mono font-bold text-text-primary">
                    {formatCurrency(order.subtotal)}
                  </div>
                </div>

                {/* Tax Row */}
                <div className="grid grid-cols-12 gap-1.5 text-center">
                  <div className="col-span-8"></div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#BEE3F8] bg-[#F0F8FF] flex items-center justify-center font-semibold text-[#2B6CB0]">
                    Tax
                  </div>
                  <div className="col-span-2 h-8 rounded-lg border border-[#BEE3F8] bg-white flex items-center justify-center font-mono text-text-muted">
                    {formatCurrency((order.tax || 0) + (order.shipping || 0))}
                  </div>
                </div>

                {/* Grand Total Row (Pill borders match row height and column width) */}
                <div className="grid grid-cols-12 gap-1.5 text-center">
                  <div className="col-span-8"></div>
                  <div className="col-span-2 h-8 rounded-lg border-2 border-[#FEB2B2] bg-[#FFF5F5] flex items-center justify-center font-bold text-[#E53E3E]">
                    Grand Total
                  </div>
                  <div className="col-span-2 h-8 rounded-lg border-2 border-[#FEB2B2] bg-[#FFF5F5] flex items-center justify-center font-mono font-extrabold text-[#E53E3E] text-xs">
                    {formatCurrency(order.totalAmount)}
                  </div>
                </div>
              </div>

              {/* 5. Footer: Thank You & Cute Chibi Bowing + Contact Info */}
              <div className="border-t-2 border-dashed border-[#E2D4E8] mt-3 pt-3 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-3">
                {/* Left: Thank You & Bowing Chibis */}
                <div className="flex items-center gap-2">
                  {/* Bowing Boy Chibi */}
                  <svg width="40" height="42" viewBox="0 0 50 55" className="flex-shrink-0">
                    <circle cx="25" cy="22" r="14" fill="#FFE2C6" />
                    <path d="M12 20 Q10 8 25 8 Q40 8 38 20 Q34 10 25 12 Q16 10 12 20 Z" fill="#5D3A1A" />
                    <path d="M19 22 Q22 25 25 22" stroke="#2D211D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M27 22 Q30 25 33 22" stroke="#2D211D" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <ellipse cx="16" cy="25" rx="2" ry="1" fill="#FFAAA6" />
                    <ellipse cx="34" cy="25" rx="2" ry="1" fill="#FFAAA6" />
                    <path d="M16 36 Q25 44 34 36 L30 50 L20 50 Z" fill="#3B82F6" />
                  </svg>

                  <div>
                    <h3
                      className="text-base sm:text-lg font-black tracking-tight leading-none"
                      style={{
                        color: '#FF6384',
                        textShadow: '1px 1px 0px #FFF, 2px 2px 0px #6366F1',
                        fontFamily: "'Inter', system-ui, sans-serif",
                      }}
                    >
                      Thank You
                    </h3>
                    <p className="text-[10px] text-text-secondary font-medium mt-0.5">
                      Thank you for your purchase! Arigatou!
                    </p>
                    <p className="text-[9px] font-bold text-[#6366F1] flex items-center gap-1 mt-0.5">
                      <span className="px-1.5 py-0.2 rounded-full border border-[#D8B4FE] bg-[#F5F3FF]">You</span>
                      <span>Come back soon! 🌸✨</span>
                    </p>
                  </div>

                  {/* Cheerful Girl Chibi */}
                  <svg width="40" height="42" viewBox="0 0 50 55" className="flex-shrink-0">
                    <circle cx="25" cy="22" r="14" fill="#FFF0E6" />
                    <path d="M11 20 Q9 6 25 6 Q41 6 39 20 Q35 9 25 10 Q15 9 11 20 Z" fill="#3E202B" />
                    <circle cx="11" cy="16" r="3" fill="#FF6384" />
                    <circle cx="39" cy="16" r="3" fill="#FF6384" />
                    <path d="M19 22 Q22 19 25 22" stroke="#3E202B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M27 22 Q30 19 33 22" stroke="#3E202B" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <ellipse cx="16" cy="25" rx="2.5" ry="1" fill="#FFAAA6" />
                    <ellipse cx="34" cy="25" rx="2.5" ry="1" fill="#FFAAA6" />
                    <path d="M23 28 Q25 31 27 28" stroke="#FF6384" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <polygon points="17,48 33,48 29,35 21,35" fill="#8B5CF6" />
                  </svg>
                </div>

                {/* Right: Payment & Contact Info */}
                <div className="text-[10px] text-right space-y-0.5 text-text-muted">
                  <p>
                    <strong className="text-text-primary">Payment Info:</strong> {order.paymentMethod || 'Credit Card / ABA KHQR'}
                  </p>
                  <p>
                    <strong className="text-text-primary">Website:</strong> www.animestore.com
                  </p>
                  <p className="flex items-center justify-end gap-1.5 text-[9px] text-text-secondary font-medium pt-0.5">
                    <span>🌐 @otakuhaven</span>
                    <span>•</span>
                    <span>🐦 @otakuhaven</span>
                    <span>•</span>
                    <span>📷 @otakuhaven</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3 bg-white border-t border-border-light flex items-center justify-between print:hidden">
          <p className="text-xs text-text-muted">
            💡 <em>Tip: You can select "Save as PDF" or print directly on A5/A4 paper.</em>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl border border-border text-xs font-semibold text-text-secondary hover:bg-secondary/40 transition cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Template Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
