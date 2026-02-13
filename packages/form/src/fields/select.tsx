'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@progy/ui/field';
import { useFieldContext } from '../use-form';
import { cn } from '@progy/ui/lib/utils';
import { useStore } from '@tanstack/react-store';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@progy/ui/select';

interface SelectFieldProps extends Omit<React.ComponentProps<typeof Select>, 'value' | 'onValueChange'> {
    label?: string;
    description?: string;
    placeholder?: string;
    options: { value: string; label: string }[];
    className?: string;
    disabled?: boolean;
}

const SelectField = ({ label, description, placeholder = 'Select an option', options, disabled, className, ...props }: SelectFieldProps) => {
    const field = useFieldContext();
    const { value, meta } = useStore(field.store, (state: any) => state);
    const { errors } = meta;

    const handleValueChange = (newValue: string) => {
        field.handleChange(newValue);
    };

    return (
        <Field>
             {label && <FieldLabel>{label}</FieldLabel>}
            <Select
                value={(value as string) || ''}
                onValueChange={handleValueChange}
                disabled={disabled}
                {...props}
            >
                <SelectTrigger className={cn('w-full', className)}>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

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

export default SelectField;
