import React from 'react';
import { PerformanceMetric } from '../../types';
import ArrowUpIcon from '../icons/ArrowUpIcon';
import ArrowDownIcon from '../icons/ArrowDownIcon';

const PerformanceMetricChart: React.FC<{ data: PerformanceMetric }> = ({ data }) => {
  const isPositive = data.percentageChange ? data.percentageChange >= 0 : true;

  return (
    <div className="text-center">
      <p className="font-semibold text-perf-text-primary">{data.title}</p>
      
      {data.type === 'bar' && data.percentageChange && (
        <>
            <div className={`flex items-center justify-center font-bold mt-2 ${isPositive ? 'text-perf-positive' : 'text-perf-negative'}`}>
                <span>{data.value}</span>
                {isPositive ? <ArrowUpIcon className="w-4 h-4 ml-1"/> : <ArrowDownIcon className="w-4 h-4 ml-1"/>}
            </div>
            <div className="w-full h-16 flex items-end justify-center mt-2">
                <div className="w-1/3 bg-perf-bar-dark" style={{ height: `${Math.abs(data.percentageChange)}%` }}></div>
            </div>
        </>
      )}

      {data.type === 'bullet' && (
         <div className="w-full bg-perf-bar-light h-4 rounded-sm mt-2 relative">
            <div className="bg-perf-bar-dark h-4 rounded-sm" style={{ width: `${data.actual}%` }}></div>
            <div className="absolute top-0 bottom-0 border-l-2 border-red-500" style={{ left: `${data.target}%` }}></div>
        </div>
      )}

    </div>
  );
};

export default PerformanceMetricChart;