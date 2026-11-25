import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import StatusBadge from '@/components/common/StatusBadge';
import Button from '@/components/common/Button';
import { formatCurrency, formatDate, getInitials } from '@/utils/formatters';

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, orders } = useApp();

  const customer = customers.find((c) => c.id === id);
  const customerOrders = orders.filter((o) => o.customer.email === customer?.email || o.customer.id === id);

  if (!customer) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold font-heading text-text-primary">Customer Not Found</h2>
        <p className="text-sm text-text-muted mt-1">The requested customer could not be found.</p>
        <Link to="/customers" className="mt-4 inline-block">
          <Button variant="secondary">Back to Customers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/customers')}
          className="p-2 rounded-xl bg-white border border-border-light hover:bg-secondary/40 text-text-secondary transition cursor-pointer"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-[24px] font-semibold text-text-primary">{customer.name}</h1>
            <StatusBadge status={customer.status} />
          </div>
          <p className="text-xs text-text-muted mt-0.5">Customer since {formatDate(customer.joinedAt)}</p>
        </div>
      </div>

      {/* Customer Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Total Orders</p>
            <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
              {customer.totalOrders}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-light text-success flex items-center justify-center">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Total Spent</p>
            <h3 className="text-[26px] font-bold text-text-primary mt-0.5 tabular-nums">
              {formatCurrency(customer.totalSpent)}
            </h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-border-light shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center">
            <Calendar size={22} />
          </div>
          <div>
            <p className="text-xs text-text-muted font-medium">Last Order Date</p>
            <h3 className="text-sm font-bold font-heading text-text-primary mt-1">
              {formatDate(customer.lastOrderAt)}
            </h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Customer Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-secondary text-primary font-bold flex items-center justify-center text-lg">
                {getInitials(customer.name)}
              </div>
              <div>
                <p className="font-bold text-base text-text-primary">{customer.name}</p>
                <p className="text-xs text-text-muted">{customer.status}</p>
              </div>
            </div>

            <div className="border-t border-border-light pt-4 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-text-secondary">
                <Mail size={16} className="text-text-muted" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <Phone size={16} className="text-text-muted" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <MapPin size={16} className="text-text-muted" />
                <span>
                  {customer.address}, {customer.city}, {customer.country}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Order History */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
            <h3 className="text-[18px] font-semibold text-text-primary mb-4">
              Order History ({customerOrders.length})
            </h3>

            {customerOrders.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">No recorded orders for this customer.</p>
            ) : (
              <div className="divide-y divide-border-light">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="py-3 flex items-center justify-between">
                    <div>
                      <Link
                        to={`/orders/${ord.id}`}
                        className="font-semibold text-primary text-sm hover:underline"
                      >
                        {ord.orderNumber}
                      </Link>
                      <p className="text-xs text-text-muted mt-0.5">{formatDate(ord.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-text-primary text-sm">
                        {formatCurrency(ord.totalAmount)}
                      </span>
                      <StatusBadge status={ord.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
