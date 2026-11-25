import { useState } from 'react';
import { Star, CheckCircle, EyeOff, Trash2, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { formatDate } from '@/utils/formatters';
import type { Review } from '@/types';

export default function ReviewList() {
  const { reviews, updateReviewStatus, deleteReview } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);

  const filteredReviews = reviews.filter((r) => {
    return selectedStatus === 'all' || r.status === selectedStatus;
  });

  const columns = [
    {
      key: 'productName',
      label: 'Product',
      sortable: true,
      render: (r: Review) => (
        <div>
          <p className="font-semibold text-text-primary">{r.productName}</p>
          <p className="text-xs text-text-muted">By {r.customerName}</p>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      render: (r: Review) => (
        <div className="flex items-center gap-1 text-amber-500">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
            />
          ))}
          <span className="text-xs font-bold text-text-primary ml-1">{r.rating}.0</span>
        </div>
      ),
    },
    {
      key: 'comment',
      label: 'Review',
      render: (r: Review) => (
        <div className="max-w-md">
          <p className="font-medium text-xs text-text-primary">{r.title}</p>
          <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{r.comment}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (r: Review) => <StatusBadge status={r.status} />,
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (r: Review) => <span className="text-text-muted text-xs">{formatDate(r.createdAt)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold text-text-primary">Reviews & Ratings</h1>
          {/* <p className="text-sm text-text-muted">Moderate customer feedback, approve ratings, and manage reviews</p> */}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm">
        <DataTable<Review>
          data={filteredReviews}
          columns={columns}
          searchKeys={['productName', 'customerName', 'comment', 'title']}
          searchPlaceholder="Search reviews..."
          itemsPerPage={8}
          filterSlot={
            <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-xs">
              <Filter size={14} className="text-text-muted" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-transparent border-none focus:outline-none cursor-pointer text-text-secondary font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
              </select>
            </div>
          }
          actions={(review) => (
            <div className="flex items-center justify-end gap-1">
              {review.status !== 'approved' && (
                <button
                  onClick={() => updateReviewStatus(review.id, 'approved')}
                  title="Approve Review"
                  className="p-1.5 rounded-lg hover:bg-success-light text-text-muted hover:text-success transition"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              {review.status !== 'hidden' && (
                <button
                  onClick={() => updateReviewStatus(review.id, 'hidden')}
                  title="Hide Review"
                  className="p-1.5 rounded-lg hover:bg-warning-light text-text-muted hover:text-warning transition"
                >
                  <EyeOff size={16} />
                </button>
              )}
              <button
                onClick={() => setDeleteTarget(review)}
                title="Delete Review"
                className="p-1.5 rounded-lg hover:bg-danger-light text-text-muted hover:text-danger transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteReview(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Delete Review"
        message="Are you sure you want to permanently delete this customer review?"
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
