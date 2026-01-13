import React from 'react';
import { PerformanceDonutChartData } from '../../types';

const PerformanceDonutChart: React.FC<{ data: PerformanceDonutChartData }> = ({ data }) => {
  let cumulativePercent = 0;
  const gradients = data.segments.map((item) => {
    const start = cumulativePercent;
    cumulativePercent += item.value;
    const end = cumulativePercent;
    
    // Check if the color is one of our theme aliases
    let colorValue = item.color;
    if (colorValue === 'perf-bar-dark') colorValue = '#374151';
    else if (colorValue === 'perf-bar-light') colorValue = '#d1d5db';
    
    return `${colorValue} ${start}% ${end}%`;
  }).join(', ');

  const conicGradient = `conic-gradient(${gradients})`;

  return (
    <div className="text-center">
      <div
        className="w-32 h-32 rounded-full mx-auto relative flex items-center justify-center shadow-inner"
        style={{ background: conicGradient }}
      >
        {/* Inner white circle to create the "donut" effect */}
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-perf-text-secondary">Summary</span>
        </div>
      </div>
      <p className="font-semibold text-perf-text-primary mt-4">{data.title}</p>
      <div className="mt-2 space-y-1 text-xs text-perf-text-secondary">
        {data.segments.map(segment => (
          <div key={segment.label} className="flex items-center justify-center">
             <div
                className="w-3 h-3 mr-2"
                style={{ backgroundColor: segment.color === 'perf-bar-dark' ? 'var(--color-perf-bar-dark)' : 
                                         segment.color === 'perf-bar-light' ? 'var(--color-perf-bar-light)' : 
                                         segment.color }}
             ></div>
            <span>{segment.label}: {segment.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceDonutChart;