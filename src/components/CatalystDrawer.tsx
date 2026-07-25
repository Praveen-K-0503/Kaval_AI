'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Server, X, ExternalLink, Cpu } from 'lucide-react';

interface Service {
  name: string;
  status: string;
  type: string;
}

interface CatalystDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
}

export default function CatalystDrawer({ isOpen, onClose, services }: CatalystDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 z-50 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg">
                    <Server className="w-6 h-6 text-blue-700" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">Zoho Catalyst Infrastructure</h2>
                    <p className="text-xs text-slate-500 font-medium">Integrated Cloud Architecture ({services.length} Services)</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status Badge */}
              <div className="my-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                  <span className="text-xs font-semibold text-emerald-900">Deployment Status: 100% Validated</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 text-xs rounded-md font-mono font-bold">AppSail OCI</span>
              </div>

              {/* Services List */}
              <div className="space-y-2.5 mt-4">
                {services.map((svc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 border border-slate-200 hover:border-blue-300 rounded-xl flex items-center justify-between transition-all shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <Cpu className="w-4 h-4 text-blue-700" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">{svc.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{svc.type}</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {svc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>Karnataka State Police Datathon 2026</span>
              <a
                href="https://catalyst.zoho.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 text-blue-700 hover:underline font-semibold"
              >
                <span>Catalyst Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
