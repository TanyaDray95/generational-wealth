import { createClient } from '@supabase/supabase-js';
import { FinancialPerformanceData } from '../types';

// Provided Supabase credentials
const SUPABASE_URL = 'https://kcxzbszdvektalpgftve.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_1bFLLbddKFJ1dHJl5wqP4w_Cpq3zu1k';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface SavedReport {
  id: string;
  created_at: string;
  title: string;
  as_of_date: string;
  data: FinancialPerformanceData;
}

/**
 * Saves the analyzed report to the Supabase database.
 * Table Name: reports
 * Schema expected: id (uuid), created_at (timestamp), title (text), as_of_date (text), data (jsonb)
 */
export const saveReport = async (report: FinancialPerformanceData): Promise<void> => {
  try {
    const { error } = await supabase.from('reports').insert([
      { 
        title: report.title, 
        as_of_date: report.asOfDate, 
        data: report 
      }
    ]);
    
    if (error) {
      console.error('Supabase insert error:', error);
      throw error;
    }
  } catch (err) {
    // Fallback to LocalStorage if Supabase request fails (e.g., table not created yet)
    console.warn('Supabase save failed, falling back to LocalStorage', err);
    const reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
    reports.push({
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      title: report.title,
      as_of_date: report.asOfDate,
      data: report
    });
    localStorage.setItem('saved_reports', JSON.stringify(reports));
  }
};

/**
 * Fetches all saved reports from the database.
 */
export const fetchReports = async (): Promise<SavedReport[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.warn('Supabase fetch failed, falling back to LocalStorage', err);
    const reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
    return reports.reverse();
  }
};

/**
 * Deletes a specific report by ID.
 */
export const deleteReport = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
  } catch (err) {
    const reports = JSON.parse(localStorage.getItem('saved_reports') || '[]');
    const filtered = reports.filter((r: any) => r.id !== id);
    localStorage.setItem('saved_reports', JSON.stringify(filtered));
  }
};
