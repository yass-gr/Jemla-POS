import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';

const keys = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['0', '.', '⌫'],
];

export default function NumpadModal({ open, title, value, allowDecimal, onConfirm, onClose }) {
  const [display, setDisplay] = useState('');

  useEffect(() => {
    if (open) setDisplay(value !== undefined && value !== null ? String(value) : '');
  }, [open, value]);

  const handleKey = useCallback((key) => {
    if (key === '⌫') {
      setDisplay(prev => prev.slice(0, -1));
      return;
    }
    if (key === '.' && !allowDecimal) return;
    if (key === '.' && display.includes('.')) return;
    if (key === '0' && display === '0') return;
    setDisplay(prev => {
      if (prev === '0' && key !== '.') return key;
      return prev + key;
    });
  }, [allowDecimal, display]);

  const handleConfirm = () => {
    const parsed = parseFloat(display);
    if (isNaN(parsed)) return;
    onConfirm(allowDecimal ? parsed : Math.floor(parsed));
    setDisplay('');
  };

  const handleClose = () => {
    setDisplay('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50">
      <div className="w-full max-w-sm bg-surface rounded-t-3xl sm:rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 dark:bg-muted dark:border-border">
        <div className="p-6 text-center border-b border-outline-variant/30 dark:border-border">
          <p className="text-headline-sm font-headline-sm text-on-surface mb-1 dark:text-foreground">{title}</p>
          <div className="text-3xl font-bold text-primary tabular-nums tracking-wider min-h-[3rem]">
            {display || '0'}
          </div>
        </div>

        <div className="p-4">
          <div className="grid gap-3">
            {keys.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-3">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKey(key)}
                    className={`h-16 rounded-2xl text-2xl font-bold transition-all active:scale-90 select-none ${
                      key === '⌫'
                        ? 'bg-surface-container-high text-on-surface-variant dark:bg-muted dark:text-muted-foreground'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high dark:bg-muted dark:text-foreground dark:hover:bg-accent'
                    }`}
                  >
                    {key === '⌫' ? (
                      <span className="material-symbols-outlined text-2xl">backspace</span>
                    ) : key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button variant="outline" onClick={handleClose} className="h-14 rounded-2xl text-base">
              Annuler
            </Button>
            <Button onClick={handleConfirm} className="h-14 rounded-2xl text-base">
              Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
