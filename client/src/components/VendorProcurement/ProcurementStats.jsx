import React from "react";
import { Package, Calendar } from "lucide-react";
import {
  formatCurrency,
  calculateTotalWithGst,
  formatNumber,
} from "../../utils/formatHelpers";

const ProcurementStats = ({ items, stats, totalItems = items.length }) => {
  const totalWithGst = items.reduce((total, item) => {
    return total + calculateTotalWithGst(item.itemAmount, item.taxPercentage);
  }, 0);

  return (
    <div className="stats-section">
      <div className="stats-grid">
        <StatCard
          icon={<Package size={24} />}
          value={totalItems}
          label="Total Items"
        />

        <StatCard
          icon={<Calendar size={24} />}
          value={formatNumber(stats.total_quantity || 0)}
          label="Total Quantity (Sq Meter)"
        />

        <StatCard
          value={formatCurrency(stats.total_amount || 0)}
          label="Total Amount"
        />

        <StatCard value={formatCurrency(totalWithGst)} label="Total with GST" />
      </div>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="stat-card">
    {icon && icon}
    <div className="stat-content">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default ProcurementStats;
