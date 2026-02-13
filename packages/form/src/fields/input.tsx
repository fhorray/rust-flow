'use client';

import { Input } from '@progy/ui/input';
import { Field, FieldDescription, FieldError, FieldLabel } from '@progy/ui/field';
import { useFieldContext } from '../use-form';
import { useStore } from '@tanstack/react-store';
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'> {
    label?: string;
    description?: string;
    icon?: LucideIcon;
}

const InputField = ({ label, icon: Icon, description, ...props }: InputProps) => {
    const field = useFieldContext();
    const { value, meta } = useStore(field.store, (state: any) => state);
    const { errors } = meta;
    const isInvalid = errors.length > 0;

    return (
        <Field>
            <div className="relative w-full">
                {Icon && (
                    <span className="absolute top-2.5 left-2 w-4 h-4 flex items-center justify-center pointer-events-none">
                        <Icon className="w-4 h-4 opacity-45" />
                    </span>
                )}

                <Input
                    id={field.name}
                    name={field.name}
                    value={(value as string) ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    className={Icon ? "pl-8" : ""}
                    {...props}
                />
            </div>

            {label && <FieldLabel className="sr-only">{label}</FieldLabel>}

            {description && (
                <FieldDescription className="text-sm opacity-45">
                    {description}
                </FieldDescription>
            )}
            <FieldError
                errors={errors.map((e: any) => ({
                    message: e?.message?.toString() || "Invalid",
                }))}
            />
        </Field>
    );
};

export default InputField;
