import { useEffect, useRef } from 'react';

interface UseFormTrackerProps {
  onFormChange?: (isDirty: boolean) => void;
  formRef?: React.RefObject<HTMLFormElement>;
}

export function useFormTracker({ onFormChange, formRef }: UseFormTrackerProps) {
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!formRef?.current || !onFormChange) return;

    const form = formRef.current;
    let initialValues: Record<string, FormDataEntryValue> = {};

    // Capture initial values
    const formData = new FormData(form);
    formData.forEach((value, key) => {
      initialValues[key] = value;
    });

    const checkFormChanges = () => {
      const currentFormData = new FormData(form);
      let hasChanges = false;

      // Check if any value has changed
      currentFormData.forEach((value, key) => {
        if (initialValues[key] !== value) {
          hasChanges = true;
        }
      });

      // Check if any field was removed
      Object.keys(initialValues).forEach((key) => {
        if (!currentFormData.has(key)) {
          hasChanges = true;
        }
      });

      if (hasChanges !== isDirtyRef.current) {
        isDirtyRef.current = hasChanges;
        onFormChange(hasChanges);
      }
    };

    // Listen to form changes
    const handleChange = () => checkFormChanges();
    const handleReset = () => {
      isDirtyRef.current = false;
      onFormChange(false);
      // Recapture initial values after reset
      setTimeout(() => {
        const formData = new FormData(form);
        initialValues = {};
        formData.forEach((value, key) => {
          initialValues[key] = value;
        });
      }, 0);
    };

    form.addEventListener('input', handleChange);
    form.addEventListener('change', handleChange);
    form.addEventListener('reset', handleReset);

    return () => {
      form.removeEventListener('input', handleChange);
      form.removeEventListener('change', handleChange);
      form.removeEventListener('reset', handleReset);
    };
  }, [formRef, onFormChange]);

  return {
    resetTracker: () => {
      isDirtyRef.current = false;
      onFormChange?.(false);
    },
  };
}