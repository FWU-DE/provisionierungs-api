'use client';

import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

type ToastTypes = 'success' | 'info' | 'warning' | 'error' | 'default';

interface ToastTriggerProps {
  message: string;
  description?: string;
  type?: ToastTypes;
}

/**
 * ToastTrigger
 *
 * Usage:
 *       <Suspense>
 *         <ToastTrigger message="Test message!" description="Test description!" type="default" />
 *         <ToastTrigger message="Test message!" description="Test description!" type="success" />
 *         <ToastTrigger message="Test message!" description="Test description!" type="error" />
 *         <ToastTrigger message="Test message!" description="Test description!" type="warning" />
 *         <ToastTrigger message="Test message!" description="Test description!" type="info" />
 *       </Suspense>
 *
 * @param message
 * @param description
 * @param type
 * @constructor
 */
export default function ToastTrigger({
  message,
  description,
  type = 'default',
}: ToastTriggerProps) {
  const didTrigger = useRef(false);

  useEffect(() => {
    if (didTrigger.current) return;

    didTrigger.current = true;

    const options = {
      description: description,
    };

    if (type === 'default') {
      toast(message, options);
    } else {
      const toastFn = toast[type as keyof typeof toast];
      if (typeof toastFn === 'function') {
        (toastFn as (message: string, data?: unknown) => string | number)(message, options);
      } else {
        toast(message, options);
      }
    }
  }, [description, message, type]);

  return null;
}
