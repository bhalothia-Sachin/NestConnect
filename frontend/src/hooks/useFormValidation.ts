import { useState, useCallback } from 'react';

export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationRules {
  [key: string]: ValidationRule[];
}

export interface ValidationErrors {
  [key: string]: string | undefined;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((name: string, value: string): string | undefined => {
    const fieldRules = rules[name];
    if (!fieldRules) return undefined;

    for (const rule of fieldRules) {
      if (!rule.test(value)) {
        return rule.message;
      }
    }
    return undefined;
  }, [rules]);

  const validateForm = useCallback((formData: { [key: string]: string }): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, formData[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [rules, validateField]);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: undefined
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  const setFieldError = useCallback((fieldName: string, error: string) => {
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearFieldError,
    clearAllErrors,
    setFieldError
  };
};

// Common validation rules
export const commonValidations = {
  email: [
    {
      test: (value: string) => value.length > 0,
      message: 'Email is required'
    },
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    }
  ],
  password: [
    {
      test: (value: string) => value.length > 0,
      message: 'Password is required'
    }
  ],
  required: (fieldName: string) => [
    {
      test: (value: string) => value.length > 0,
      message: `${fieldName} is required`
    }
  ],
  minLength: (length: number, fieldName: string) => [
    {
      test: (value: string) => value.length >= length,
      message: `${fieldName} must be at least ${length} characters`
    }
  ],
  phone: [
    {
      test: (value: string) => value.length > 0,
      message: 'Phone number is required'
    },
    {
      test: (value: string) => /^[0-9]{10}$/.test(value.replace(/\D/g, '')),
      message: 'Please enter a valid 10-digit phone number'
    }
  ]
}; 