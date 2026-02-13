import { createContext, useContext } from 'react';
import { useForm as useTanStackForm } from '@tanstack/react-form';
import { useStore } from '@tanstack/react-store';

export { useStore };

export const FieldContext = createContext<any>(null);

export const useFieldContext = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error('useFieldContext must be used within a FieldContext.Provider');
  }
  return context;
};

export function useForm(props: any) {
  const form = useTanStackForm(props);

  const OriginalField = form.Field;

  const WrappedField = (fieldProps: any) => {
    return (
      <OriginalField {...fieldProps}>
        {(fieldApi: any) => (
           <FieldContext.Provider value={fieldApi}>
              {typeof fieldProps.children === 'function'
                 ? fieldProps.children(fieldApi)
                 : fieldProps.children}
           </FieldContext.Provider>
        )}
      </OriginalField>
    );
  };

  return {
    ...form,
    Field: WrappedField,
  };
}

// Stub for compatibility if needed, or remove
export const formContext = createContext<any>(null);
export const useFormContext = () => useContext(formContext);
