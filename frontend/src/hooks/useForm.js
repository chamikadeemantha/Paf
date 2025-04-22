import { useState, useCallback } from 'react';

export const useForm = (initialState = {}, validationRules = {}) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  const validate = useCallback(() => {
    const validationErrors = {};
    Object.keys(validationRules).forEach(key => {
      const value = values[key];
      const rule = validationRules[key];
      const error = rule(value);
      if (error) {
        validationErrors[key] = error;
      }
    });
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = useCallback(async (submitFn) => {
    setIsSubmitting(true);
    try {
      if (validate()) {
        await submitFn(values);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    setValues,
    setIsSubmitting
  };
};
