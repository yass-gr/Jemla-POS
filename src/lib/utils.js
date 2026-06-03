import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Create CSV header
  const headers = columns.map(col => col.header).join(',');
  
  // Create CSV rows
  const rows = data.map(item => {
    return columns.map(col => {
      const value = item[col.key];
      // Escape quotes and wrap in quotes if contains comma
      const escaped = String(value ?? '').replace(/"/g, '""');
      return escaped.includes(',') ? `"${escaped}"` : escaped;
    }).join(',');
  });
  
  // Combine header and rows
  const csv = [headers, ...rows].join('\n');
  
  // Create blob and download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF() {
  window.print();
}
