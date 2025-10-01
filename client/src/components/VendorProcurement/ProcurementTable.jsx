import React from "react";
import {
  formatCurrency,
  calculateTotalWithGst,
} from "../../utils/formatHelpers";

const ProcurementTable = ({
  items,
  currentPage = 1,
  itemsPerPage = 10,
  totalItems = 0,
}) => {
  return (
    <div className="items-section">
      <div className="items-header">
        <h3>
          Procurement Items (Showing {items.length} of {totalItems})
        </h3>
      </div>

      <div className="table-container">
        <table className="items-table">
          <thead>
            <tr>
              <th>S.No.</th>
              <th>Stone Name/Type</th>
              <th>Dimensions</th>
              <th>Quantity</th>
              <th>Item Amount</th>
              <th>GST %</th>
              <th>Total Amount (After GST)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TableRow = ({ item, index, currentPage, itemsPerPage }) => {
  const totalAmount = calculateTotalWithGst(
    item.itemAmount,
    item.taxPercentage
  );

  return (
    <tr>
      <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
      <td>
        <div className="stone-info">
          <div className="stone-name">{item.stoneName}</div>
          <div className="stone-type">{item.stoneType}</div>
        </div>
      </td>
      <td>
        {item.lengthMm} × {item.widthMm}
        {item.thicknessMm && ` × ${item.thicknessMm}`} mm
      </td>
      <td>
        {item.quantity} {item.units}
      </td>
      <td className="amount">{formatCurrency(item.itemAmount)}</td>
      <td>{item.taxPercentage || 0}%</td>
      <td className="amount total-amount">{formatCurrency(totalAmount)}</td>
    </tr>
  );
};

export default ProcurementTable;
