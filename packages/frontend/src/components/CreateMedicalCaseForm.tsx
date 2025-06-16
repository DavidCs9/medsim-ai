import React, { useState } from 'react';
import { z } from 'zod';
import {
  CreateMedicalCaseRequest,
  CreateMedicalCaseRequestSchema,
  ApiResponse,
  MedicalCase,
} from '@medsim-ai/shared-types';

interface FormErrors {
  title?: string[];
  description?: string[];
  difficulty?: string[];
  tags?: string[];
  general?: string;
}

export const CreateMedicalCaseForm: React.FC = () => {
  const [formData, setFormData] = useState<Partial<CreateMedicalCaseRequest>>({
    title: '',
    description: '',
    difficulty: 'beginner',
    tags: [],
    isPublished: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear field-specific errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Validate form data using Zod schema
      const validatedData: CreateMedicalCaseRequest = CreateMedicalCaseRequestSchema.parse(formData);

      // Make API call
      const response = await fetch('/api/medical-cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      const result: ApiResponse<MedicalCase> = await response.json();

      if (result.success) {
        // Handle success
        console.log('Medical case created:', result.data);
        alert('Medical case created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          difficulty: 'beginner',
          tags: [],
          isPublished: false,
        });
      } else {
        // Handle API error
        setErrors({ general: result.error });
      }

    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        const newErrors: FormErrors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as keyof FormErrors;
          if (!newErrors[field]) {
            newErrors[field] = [];
          }
          newErrors[field]!.push(err.message);
        });
        setErrors(newErrors);
      } else {
        console.error('Error creating medical case:', error);
        setErrors({ general: 'An unexpected error occurred' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Medical Case</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title || ''}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter case title"
          />
          {errors.title && (
            <div className="mt-1 text-sm text-red-600">
              {errors.title.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the medical case"
          />
          {errors.description && (
            <div className="mt-1 text-sm text-red-600">
              {errors.description.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty */}
        <div>
          <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty *
          </label>
          <select
            id="difficulty"
            name="difficulty"
            value={formData.difficulty || 'beginner'}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.difficulty ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          {errors.difficulty && (
            <div className="mt-1 text-sm text-red-600">
              {errors.difficulty.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.tags?.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          {errors.tags && (
            <div className="mt-1 text-sm text-red-600">
              {errors.tags.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
        </div>

        {/* Published */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            name="isPublished"
            checked={formData.isPublished || false}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-700">
            Publish immediately
          </label>
        </div>

        {/* General errors */}
        {errors.general && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm text-red-600">{errors.general}</div>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? 'Creating...' : 'Create Medical Case'}
        </button>
      </form>
    </div>
  );
};
