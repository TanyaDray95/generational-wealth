import React from 'react';
import { BalanceSheetItem as BalanceSheetItemType } from '../../types';
import ArrowUpIcon from '../icons/ArrowUpIcon';
import ArrowDownIcon from '../icons/ArrowDownIcon';

const BalanceSheetItem: React.FC<{ item: BalanceSheetItemType }> = ({ item }) => {
  return (
    <div className="grid grid-cols-10 gap-4 items-center">
      <div className="col-span-4">
        <p className="font-semibold text-perf-text-primary">{item.metric}</p>
        <p className="text-sm text-perf-text-secondary">${item.value.toLocaleString()}</p>
      </div>
      <div className="col-span-4">
        <div className="w-full bg-perf-bar-light h-4 rounded-sm">
          <div className="bg-perf-bar-dark h-4 rounded-sm" style={{ width: `${item.barPercentage}%` }}></div>
        </div>
      </div>
      <div className="col-span-2 text-right">
        {item.changes.map((change, index) => (
          <div
            key={index}
            className={`flex items-center justify-end font-bold text-sm ${
              change.isPositive ? 'text-perf-positive' : 'text-perf-negative'
            }`}
          >
            <span>{change.value > 0 ? '+' : ''}{change.value.toFixed(1)}%</span>
            {change.isPositive ? (
              <ArrowUpIcon className="w-4 h-4 ml-1" />
            ) : (
              <ArrowDownIcon className="w-4 h-4 ml-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BalanceSheetItem;