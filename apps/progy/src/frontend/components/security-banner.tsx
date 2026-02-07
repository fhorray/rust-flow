import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useStore } from '@nanostores/react';
import { $isOfficial } from '../stores/user-store';

export function SecurityBanner() {
  const isOfficial = useStore($isOfficial);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show if explicitly unofficial
    if (isOfficial === false) {
      const accepted = sessionStorage.getItem('progy_security_accepted');
      if (!accepted) setVisible(true);
    }
  }, [isOfficial]);

  const handleAccept = () => {
    sessionStorage.setItem('progy_security_accepted', 'true');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-orange-500/10 border-b border-orange-500/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">

        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-orange-200">
              Community Course Detected
            </p>
            <p className="text-xs text-orange-200/70 font-medium mt-0.5">
              This course is from a community repository. Please verify the <code className="bg-orange-950/30 px-1 py-0.5 rounded text-orange-300">course.json</code> and runner scripts before proceeding.
            </p>
          </div>
        </div>

        <button
          onClick={handleAccept}
          className="w-full sm:w-auto px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm shadow-orange-900/20"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          I have verified this course
        </button>
      </div>
    </div>
  );
}
