import React from 'react';
import { IncomeStatementItem } from '../../types';
import ArrowUpIcon from '../icons/ArrowUpIcon';
import ArrowDownIcon from '../icons/ArrowDownIcon';

const IncomeStatementChart: React.FC<{ item: IncomeStatementItem }> = ({ item }) => {
  const formatValue = (val: number) => `$${val.toLocaleString()}`;
  const maxVal = Math.max(Math.abs(item.currentValue), Math.abs(item.previousValue), 1);
  const currentHeight = (Math.abs(item.currentValue) / maxVal) * 100;
  const previousHeight = (Math.abs(item.previousValue) / maxVal) * 100;
  const isPositive = item.percentageChange >= 0;

  return (
    <div className="flex flex-col items-center text-center">
      <div className={`flex items-center font-bold text-lg ${isPositive ? 'text-perf-positive' : 'text-perf-negative'}`}>
        {isPositive ? <ArrowUpIcon className="w-5 h-5 mr-1" /> : <ArrowDownIcon className="w-5 h-5 mr-1" />}
        <span>{isPositive ? '+' : ''}{item.percentageChange.toFixed(1)}%</span>
      </div>
      <div className="text-sm text-perf-text-secondary mb-2">{formatValue(item.currentValue)}</div>
      
      <div className="w-full h-32 flex items-end justify-center gap-2 px-2">
        <div className="w-1/2 bg-perf-bar-dark" style={{ height: `${previousHeight}%` }}></div>
        <div className={`w-1/2 ${isPositive ? 'bg-perf-bar-light' : 'bg-red-400'}`} style={{ height: `${currentHeight}%` }}></div>
      </div>
      
      <div className="w-full flex justify-center text-xs text-perf-text-secondary mt-1 border-t pt-1">
        <div className="w-1/2 text-center">{item.previousPeriod}</div>
        <div className="w-1/2 text-center">{item.currentPeriod}</div>
      </div>
      
      <p className="font-semibold text-sm text-perf-text-primary mt-2">{item.metric}</p>
    </div>
  );
};

export default IncomeStatementChart;