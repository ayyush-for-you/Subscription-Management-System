'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
}

interface ActionMenuProps {
  items: ActionMenuItem[];
}

export function ActionMenu({ items }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        title="More Actions"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 divide-y divide-slate-100 z-50 focus:outline-none animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="py-1">
            {items.map((item, index) => {
              if (item.href) {
                return (
                  <a
                    key={index}
                    href={item.href}
                    className={`flex items-center px-4 py-2 text-xs font-medium ${
                      item.danger
                        ? 'text-red-600 hover:bg-red-50'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <span className="mr-2 text-base">{item.icon}</span>}
                    {item.label}
                  </a>
                );
              }

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    if (item.onClick) item.onClick();
                  }}
                  className={`flex items-center w-full text-left px-4 py-2 text-xs font-medium ${
                    item.danger
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                >
                  {item.icon && <span className="mr-2 text-base">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

