import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = 'Select an option',
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize options into { value, label, badge, subtitle }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: opt.value ?? opt.id ?? opt.name,
      label: opt.label ?? opt.name ?? String(opt.value),
      badge: opt.badge ?? opt.domain ?? opt.tag ?? null,
      subtitle: opt.subtitle ?? opt.email ?? null
    };
  });

  const selectedOption = normalizedOptions.find((o) => o.value === value) || normalizedOptions[0];

  const handleSelect = (optValue) => {
    if (onChange) {
      onChange(optValue);
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative select-none ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full min-w-[280px] p-4 bg-white border border-slate-200/90 hover:border-blue-500 rounded-2xl text-sm font-bold text-slate-800 shadow-xs transition-all cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-100"
      >
        <div className="flex items-center gap-2.5 truncate text-left">
          {selectedOption ? (
            <>
              <span className="truncate max-w-[220px] sm:max-w-xs text-sm font-black text-slate-900">{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                  {selectedOption.badge}
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </div>
        <ChevronDown 
          className={`w-4 h-4 text-slate-400 shrink-0 ml-2 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`} 
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-full min-w-[320px] sm:min-w-[380px] bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden z-50 p-2 space-y-1 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {normalizedOptions.length === 0 ? (
            <div className="px-3.5 py-2.5 text-xs font-medium text-slate-400 text-center">
              No options available
            </div>
          ) : (
            normalizedOptions.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelect(opt.value)}
                  className={`flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border border-blue-200/80 text-blue-900'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex flex-col truncate pr-2 text-left flex-1">
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate text-sm font-black text-slate-900">{opt.label}</span>
                      {opt.badge && (
                        <span className="shrink-0 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase rounded bg-slate-100 text-slate-600">
                          {opt.badge}
                        </span>
                      )}
                    </div>
                    {opt.subtitle && (
                      <span className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                        {opt.subtitle}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 stroke-[3]" />
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
