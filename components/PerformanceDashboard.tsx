
import React, { useRef, useState } from 'react';
import { FinancialPerformanceData } from '../types';
import ExportButton from './ExportButton';
import ChartBarIcon from './icons/ChartBarIcon';
import SparklesIcon from './icons/SparklesIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ScaleIcon from './icons/ScaleIcon';
import StarIcon from './icons/StarIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import MinusCircleIcon from './icons/MinusCircleIcon';
import TagIcon from './icons/TagIcon';
import LightBulbIcon from './icons/LightBulbIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';
import { saveReport } from '../services/databaseService';

interface PerformanceDashboardProps {
  data: FinancialPerformanceData;
}

const ProgressBar: React.FC<{ label: string; percentage: number }> = ({ label, percentage }) => {
  const isPositive = percentage >= 0;
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-semibold text-gray-700">{label}</span>
        <span className={`text-sm font-bold ${isPositive ? 'text-gray-800' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className={`${isPositive ? 'bg-green-600' : 'bg-red-500'} h-full transition-all duration-1000`} 
          style={{ width: `${Math.min(Math.max(Math.abs(percentage), 0), 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ data }) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSaveToDb = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await saveReport(data);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const valuationCards = [
    {
      title: "Dividend Yield",
      value: data.valuationRatios.dividendYield,
      formula: "= Annual_Dividend / Share_Price",
      interpretation: "Yield measures your annual cash return for every dollar invested, ignoring price changes."
    },
    {
      title: "Earnings Per Share (EPS)",
      value: data.valuationRatios.eps,
      formula: "= (Net_Income - Preferred_Div) / Shares_Outstanding",
      interpretation: "Represents the portion of a company's profit allocated to each individual share of stock."
    },
    {
      title: "P/E Ratio",
      value: data.valuationRatios.peRatio,
      formula: "= Share_Price / EPS",
      interpretation: "Indicates how many multiples of earnings investors are willing to pay for a stock."
    }
  ];

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div ref={dashboardRef} className="max-w-5xl mx-auto bg-white p-10 shadow-sm border border-gray-100 font-sans text-gray-900">
        
        {/* Header Action */}
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight text-gray-800">{data.title}</h1>
            <div data-html2canvas-ignore="true" className="no-print flex items-center gap-3">
              <button
                onClick={handleSaveToDb}
                disabled={isSaving}
                className={`flex items-center px-4 py-2 rounded-md transition-all duration-200 text-sm font-medium border
                  ${saveStatus === 'success' ? 'bg-green-100 border-green-200 text-green-700' : 
                    saveStatus === 'error' ? 'bg-red-100 border-red-200 text-red-700' :
                    'bg-white border-border text-primary-text hover:bg-gray-50'}`}
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-t-transparent border-accent rounded-full animate-spin mr-2"></div>
                ) : (
                  <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                )}
                {saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save to DB'}
              </button>
              <ExportButton dashboardRef={dashboardRef} filename={data.title.replace(/\s+/g, '_')} />
            </div>
        </div>

        {/* AI Generated Summary */}
        <section className="bg-gray-50 p-6 rounded-lg mb-10 border border-gray-100">
           <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-5 h-5 text-gray-600" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Summary from Marvenecca</h2>
           </div>
           <p className="text-sm text-gray-700 leading-relaxed italic">
             {data.summary}
           </p>
        </section>

        {/* Top Section: Metrics & Quality */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <ChartBarIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold">Key metrics</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">As of {data.asOfDate}</p>
            {data.keyMetrics.map((m, i) => (
              <ProgressBar key={i} label={m.metric} percentage={m.percentageChange} />
            ))}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <SparklesIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold">Quality</h2>
            </div>
            <p className="text-xs text-gray-500 mb-6">As of {data.asOfDate}</p>
            <div className="space-y-4">
              {data.quality.map((q, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-sm font-medium">{q.factor}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <StarIcon key={star} className={`w-4 h-4 ${star <= q.rating ? 'text-gray-800' : 'text-gray-200'}`} />
                    ))}
                    <span className="ml-2 text-sm font-bold">{q.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Valuation Ratios Section */}
        <section className="mb-12 border-t border-gray-100 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <CurrencyDollarIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold">Valuation Ratios</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {valuationCards.map((card, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-5 border border-gray-200 flex flex-col h-full min-h-[160px]">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-sm font-bold text-gray-600">{card.title}</h3>
                  <span className="text-2xl font-black text-green-700">{card.value}</span>
                </div>
                
                <div className="bg-white/50 px-3 py-1.5 rounded mb-3">
                  <code className="text-[10px] font-mono text-gray-500">{card.formula}</code>
                </div>
                
                <p className="text-xs text-gray-600 mb-2 leading-relaxed flex-grow italic">
                  {card.interpretation}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* DCF Model Analysis Section */}
        <section className="mb-12 border-t border-gray-100 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold">DCF Model Analysis</h2>
          </div>
          <div className="bg-gray-50 rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Key Excel Inputs</p>
              <div className="space-y-3">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-600">Current Earnings/Cash Flow (FCF)</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.currentEarnings}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-600">Short-term Growth Rate (5 Yrs)</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.shortTermGrowth}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-600">Long-term (Perpetual) Growth</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.longTermGrowth}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-600">Discount Rate (WACC / r)</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.discountRate}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-sm text-gray-600">Terminal Multiple (P/E)</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.terminalMultiple}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Projection Period (n)</span>
                  <span className="text-sm font-bold text-gray-800">{data.dcfAnalysis.timePeriod} Years</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center bg-white p-6 rounded shadow-inner border border-gray-100">
               <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 text-center">Intrinsic Value Results</p>
               <div className="text-center space-y-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Total DCF Intrinsic Value</p>
                    <p className="text-3xl font-black text-green-700">{data.dcfAnalysis.intrinsicValue}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-50">
                    <p className="text-xs text-gray-500 uppercase">Simple Valuation (EPS * P/E)</p>
                    <p className="text-xl font-bold text-gray-800">{data.dcfAnalysis.simpleValuation}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-4 leading-tight">
                    *Intrinsic value represents the present value of all expected future cash flows, discounted at the required rate of return.
                  </p>
               </div>
            </div>
          </div>
        </section>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 border-t border-gray-100 pt-10">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <LightBulbIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold">Pros & Cons</h2>
            </div>
            <div className="space-y-3">
              {data.pros.map((p, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <PlusCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{p}</span>
                </div>
              ))}
              {data.cons.map((c, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <MinusCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">{c}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-4">
              <TagIcon className="w-6 h-6 text-gray-600" />
              <h2 className="text-xl font-bold">Standard Ratios</h2>
            </div>
            <div className="space-y-6">
              {data.financialRatios.slice(0, 4).map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-bold">{r.metric}</span>
                    <span className="text-sm font-bold">{r.value}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{r.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Valuation Summary */}
        <section className="mb-12 border-t border-gray-100 pt-10">
          <div className="flex items-center gap-2 mb-6">
            <ScaleIcon className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-bold">Scenario Analysis</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            <div className="text-xs space-y-2">
              <p className="text-gray-500 font-medium mb-2">FCF growth at current price</p>
              {data.valuation.fcfScenario1?.map((v, i) => (
                <div key={i} className="flex justify-between border-b border-gray-50 pb-1">
                  <span>{v.label}</span>
                  <span className="font-bold">{v.value}</span>
                </div>
              ))}
            </div>
            <div className="text-xs space-y-2">
              <p className="text-gray-500 font-medium mb-2">Declining FCF growth scenario</p>
              {data.valuation.fcfScenario2?.map((v, i) => (
                <div key={i} className="flex justify-between border-b border-gray-50 pb-1">
                  <span>{v.label}</span>
                  <span className="font-bold">{v.value}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
             <div className="flex justify-between items-end">
                <div className="w-1/2">
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Achievability</p>
                   <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">{data.valuation.achievability}</span>
                      <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-600 h-full w-2/3"></div>
                      </div>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Fair value</p>
                   <div className="flex items-center gap-2 justify-end mt-1">
                      <span className="text-3xl font-bold">{data.valuation.fairValue}</span>
                      <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        +{data.valuation.undervaluationPercent}% undervalued
                      </span>
                   </div>
                </div>
             </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PerformanceDashboard;
