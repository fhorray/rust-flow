import React, { useState } from 'react';
import { Loader2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { useStore } from '@nanostores/react';
import { $localSettings } from '../stores/user-store';

interface OpenInIdeButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  path: string;
  children?: React.ReactNode;
}

export function OpenInIdeButton({
  path,
  children,
  className,
  ...props
}: OpenInIdeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const localSettings = useStore($localSettings);

  const handleOpen = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch('/ide/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        console.error('Failed to open in IDE');
      }
    } catch (error) {
      console.error('Error opening IDE:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ideName = localSettings.ide || 'IDE';

  return (
    <button
      onClick={handleOpen}
      disabled={isLoading}
      title={`Open in ${ideName}`}
      className={cn(
        'relative cursor-pointer transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group',
        success ? 'text-emerald-400' : '',
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          'flex items-center gap-2',
          isLoading ? 'opacity-0' : 'opacity-100',
        )}
      >
        {children || (
          <>
            <span>Open in {ideName}</span>
            <ExternalLink className="w-3 h-3" />
          </>
        )}
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-3 h-3 animate-spin text-rust" />
        </div>
      )}
    </button>
  );
}
