import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PackageCheck, Truck, XCircle, Printer, Clock, Calendar } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate, formatFullDateTime } from '@/utils/formatters';
import AnimeInvoiceModal from '@/components/orders/AnimeInvoiceModal';
import type { Order } from '@/types';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders, updateOrderStatus } = useApp();
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const decodedId = decodeURIComponent(id || '');
  const order = orders.find(
    (o) => o.id === id || o.id === decodedId || o.orderNumber === id || o.orderNumber === decodedId
  );

  if (!order) {
    return (
      <div className="text-center py-16">
        <h2 className="text-[24px] font-semibold text-text-primary">Order Not Found</h2>
        <p className="text-sm text-text-muted mt-1">The requested order does not exist or has been deleted.</p>
        <Link to="/orders" className="mt-4 inline-block">
          <Button variant="secondary">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 rounded-xl bg-white border border-border-light hover:bg-secondary/40 text-text-secondary transition cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-semibold text-text-primary">{order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs text-text-muted flex items-center gap-1">
                <Calendar size={13} className="text-primary flex-shrink-0" />
                Placed on {formatFullDateTime(order.createdAt).date}
              </span>
              <span className="text-xs text-text-muted">•</span>
              <span className="text-xs font-mono font-medium text-text-secondary flex items-center gap-1 bg-secondary/40 px-2 py-0.5 rounded-md">
                <Clock size={12} className="text-primary flex-shrink-0" />
                {formatFullDateTime(order.createdAt).time || '12:00:00 AM'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<Printer size={16} />}
            onClick={() => setIsInvoiceOpen(true)}
          >
            Print Invoice
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Items & Pricing */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
            <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3 mb-4">
              Order Items ({order.items.length})
            </h3>

            <div className="divide-y divide-border-light">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center text-xl font-bold text-primary">
                      📦
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-text-primary">{item.productName}</p>
                      <p className="text-xs text-text-muted">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-text-primary text-sm">{formatCurrency(item.total)}</span>
                </div>
              ))}
            </div>

            {/* Price Calculation Summary */}
            <div className="border-t border-border-light pt-4 mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-text-secondary">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'FREE' : formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-text-secondary">
                <span>Tax (Est.)</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-text-primary border-t border-border-light pt-2">
                <span>Total Amount</span>
                <span className="text-primary">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Quick Status Updater */}
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
            <h3 className="text-[18px] font-semibold text-text-primary mb-3">
              Update Order Status
            </h3>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={order.status === 'processing' ? 'primary' : 'outline'}
                size="sm"
                icon={<PackageCheck size={14} />}
                onClick={() => updateOrderStatus(order.id, 'processing')}
              >
                Processing
              </Button>
              <Button
                variant={order.status === 'completed' ? 'primary' : 'outline'}
                size="sm"
                icon={<CheckCircle size={14} />}
                onClick={() => updateOrderStatus(order.id, 'completed')}
              >
                Completed
              </Button>
              <Button
                variant={order.status === 'cancelled' ? 'danger' : 'outline'}
                size="sm"
                icon={<XCircle size={14} />}
                onClick={() => updateOrderStatus(order.id, 'cancelled')}
              >
                Cancelled
              </Button>
            </div>
          </div>
        </div>

        {/* Right: Customer & Shipping Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
            <h3 className="text-[18px] font-semibold text-text-primary border-b border-border-light pb-3">
              Customer Details
            </h3>
            <div>
              <p className="font-semibold text-text-primary">{order.customer.name}</p>
              <p className="text-xs text-text-muted mt-0.5">{order.customer.email}</p>
            </div>

            <div className="border-t border-border-light pt-3">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Truck size={14} /> Shipping Address
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed">{order.shippingAddress}</p>
            </div>

            <div className="border-t border-border-light pt-3">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Payment Status</h4>
              <StatusBadge status={order.paymentStatus} />
            </div>

            <div className="border-t border-border-light pt-3 space-y-1.5">
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Clock size={13} className="text-primary" /> Exact Order Timestamp
              </h4>
              <p className="text-sm font-semibold text-text-primary">
                {formatFullDateTime(order.createdAt).date}
              </p>
              <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                <Clock size={13} />
                <span>{formatFullDateTime(order.createdAt).time || '12:00:00 AM'}</span>
              </div>
            </div>

            {order.notes && (
              <div className="border-t border-border-light pt-3">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Customer Notes</h4>
                <p className="text-xs text-text-secondary italic">"{order.notes}"</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Anime World Printable Invoice Template Modal */}
      <AnimeInvoiceModal
        order={order}
        isOpen={isInvoiceOpen}
        onClose={() => setIsInvoiceOpen(false)}
      />
    </div>
  );
}
