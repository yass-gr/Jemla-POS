import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function exportToCSV(data, filename, columns) {
  if (!data || data.length === 0) return;
  const headers = columns.map(col => col.header).join(',');
  const rows = data.map(item => columns.map(col => {
    const value = item[col.key];
    const escaped = String(value ?? '').replace(/"/g, '""');
    return escaped.includes(',') ? `"${escaped}"` : escaped;
  }).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF() {
  window.print();
}

/**
 * Format currency with proper localization
 */
export function formatCurrency(amount, currency = 'DH') {
  if (amount === null || amount === undefined) return `0 ${currency}`;
  return `${Number(amount).toFixed(2)} ${currency}`;
}

/**
 * Format date with proper localization
 */
export function formatDate(date, locale = 'fr-MA') {
  if (!date) return '-';
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime with proper localization
 */
export function formatDateTime(date, locale = 'fr-MA') {
  if (!date) return '-';
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Get status color based on value
 */
export function getStatusColor(value, thresholds = { low: 10, medium: 20 }) {
  if (value < thresholds.low) return 'destructive';
  if (value < thresholds.medium) return 'warning';
  return 'success';
}
