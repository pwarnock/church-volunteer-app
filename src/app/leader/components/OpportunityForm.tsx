/**
 * Opportunity Form Component
 *
 * Domain: Leader dashboard UI
 * Responsibility: Handle opportunity creation form
 * Boundaries: Form UI only, no data fetching
 */

'use client';

import { useState } from 'react';
import { OpportunityFormData } from '../types/leader.types';

interface OpportunityFormProps {
  onSubmit: (
    data: OpportunityFormData
  ) => Promise<{ success: boolean; error?: string }>;
  onCancel: () => void;
  initialData?: Partial<OpportunityFormData>;
}

export default function OpportunityForm({
  onSubmit,
  onCancel,
  initialData,
}: OpportunityFormProps) {
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    ministry: initialData?.ministry || '',
    location: initialData?.location || '',
    requirements: initialData?.requirements || '',
    timeCommitment: initialData?.timeCommitment || '',
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Parse requirements from comma-separated string to array
      const requirementsArray = Array.isArray(formData.requirements)
        ? formData.requirements
        : formData.requirements
            .split(',')
            .map((req: string) => req.trim())
            .filter((req: string) => req.length > 0);

      const submissionData = {
        ...formData,
        requirements: requirementsArray,
      };

      const result = await onSubmit(submissionData);

      if (result.success) {
        // Reset form on success
        setFormData({
          title: '',
          description: '',
          ministry: '',
          location: '',
          requirements: '',
          timeCommitment: '',
          startDate: '',
          endDate: '',
        });
        onCancel();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">
        {initialData ? 'Edit Opportunity' : 'Create New Opportunity'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Opportunity Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Youth Ministry Assistant"
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the opportunity and responsibilities..."
          />
        </div>

        <div>
          <label
            htmlFor="ministry"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ministry Area
          </label>
          <select
            id="ministry"
            name="ministry"
            value={formData.ministry}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a ministry</option>
            <option value="Youth Ministry">Youth Ministry</option>
            <option value="Worship">Worship</option>
            <option value="Outreach">Outreach</option>
            <option value="Facilities">Facilities</option>
            <option value="Hospitality">Hospitality</option>
            <option value="Children's Ministry">Children's Ministry</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Main Church Building"
          />
        </div>

        <div>
          <label
            htmlFor="requirements"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Requirements (comma-separated)
          </label>
          <input
            type="text"
            id="requirements"
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Background check, Love for youth, Weekly availability"
          />
        </div>

        <div>
          <label
            htmlFor="timeCommitment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Time Commitment
          </label>
          <input
            type="text"
            id="timeCommitment"
            name="timeCommitment"
            value={formData.timeCommitment}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 3 hours per week"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="endDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              End Date (optional)
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Creating...' : 'Create Opportunity'}
          </button>
        </div>
      </form>
    </div>
  );
}
