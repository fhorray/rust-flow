'use client';

import { Field, FieldDescription, FieldError, FieldLabel } from '@progy/ui/field';
import { useFieldContext } from '../use-form';
import { Textarea } from '@progy/ui/textarea';
import React from 'react';

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'value' | 'onChange' | 'onBlur'> {
    label?: string;
    description?: string;
}

const TextareaField = ({ label, description, ...props }: TextareaProps) => {
    const field = useFieldContext();
    const { value, meta } = field.state;
    const { errors } = meta;
    const isInvalid = errors.length > 0;

    return (
        <Field>
            {label && <FieldLabel>{label}</FieldLabel>}

            <div className="relative w-full">
                <Textarea
                    id={field.name}
                    name={field.name}
                    value={(value as string) ?? ''}
                    onBlur={field.handleBlur}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    autoComplete="off"
                    {...props}
                />
            </div>

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

export default TextareaField;
