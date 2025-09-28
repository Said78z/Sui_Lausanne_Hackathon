import { useCategories, useCreateEvent } from '@/api/queries/dashboardQueries';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreateEventDto } from '@shared/dto';
import { ArrowLeft, Loader2 } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: 'Event Name',
        startDate: '2024-09-27',
        startTime: '18:00',
        endDate: '2024-09-27',
        endTime: '19:00',
        location: '',
        description: '',
        category: '',
        priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH',
        maxAttendees: undefined as number | undefined,
    });

    // Get categories for the dropdown
    const { data: categoriesData, isLoading: isCategoriesLoading } = useCategories();
    const categories = categoriesData?.data?.categories || [];

    // Create event mutation
    const createEventMutation = useCreateEvent();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null); // Clear previous errors

        try {
            // Convert form data to match backend DTO
            const eventData: CreateEventDto = {
                title: formData.title,
                description: formData.description || undefined,
                location: formData.location || undefined,
                startTime: new Date(`${formData.startDate}T${formData.startTime}`).toISOString(),
                endTime:
                    formData.endDate && formData.endTime
                        ? new Date(`${formData.endDate}T${formData.endTime}`).toISOString()
                        : undefined,
                category: formData.category,
                priority: formData.priority,
                maxAttendees: formData.maxAttendees,
            };

            console.log('Creating event with data:', eventData);

            // Validate required fields
            if (!eventData.title.trim()) {
                throw new Error('Event title is required');
            }
            if (!eventData.category) {
                throw new Error('Category is required');
            }
            if (!eventData.startTime) {
                throw new Error('Start time is required');
            }

            const result = await createEventMutation.mutateAsync(eventData);
            console.log('✅ Event creation result:', result);

            console.log('✅ Event created successfully! Navigating to dashboard...');

            // Small delay to ensure cache invalidation completes
            setTimeout(() => {
                navigate('/dashboard');
            }, 500);
        } catch (error) {
            console.error('Failed to create event:', error);
            setErrorMessage(
                error instanceof Error ? error.message : 'Failed to create event. Please try again.'
            );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-blue-900/30 via-cyan-900/20 to-transparent" />

            <div className="relative z-50 border-b border-white/10 bg-white/5 backdrop-blur-sm">
                <div className="mx-auto max-w-7xl px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center space-x-2 text-white/80 transition-colors hover:text-white"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Back to Dashboard</span>
                            </button>
                        </div>
                        <h1 className="text-xl font-semibold text-white">Create Event</h1>
                        <div className="w-32"></div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-6xl p-6">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white">
                            <div className="relative z-10">
                                <div className="space-y-4 text-center">
                                    <div className="text-sm font-medium tracking-wider">Y O U</div>
                                    <div className="text-sm font-medium tracking-wider">A R E</div>
                                    <div className="text-sm font-medium tracking-wider">
                                        I N V I T E D
                                    </div>
                                </div>

                                <div className="mt-8 rounded-lg bg-white/20 p-1">
                                    <div className="inline-block rounded bg-white px-3 py-1 text-sm font-medium text-gray-900">
                                        Minimal
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                            <h2 className="mb-6 text-2xl font-bold text-white">Event Details</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {(createEventMutation.isError || errorMessage) && (
                                    <div className="rounded-lg border border-red-500/30 bg-red-500/20 p-4">
                                        <p className="text-sm text-red-400">
                                            {errorMessage ||
                                                'Failed to create event. Please check all fields and try again.'}
                                        </p>
                                    </div>
                                )}
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Event Name
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter event name"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            Start Date
                                        </label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            Start Time
                                        </label>
                                        <input
                                            type="time"
                                            name="startTime"
                                            value={formData.startTime}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            End Date
                                        </label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            End Time
                                        </label>
                                        <input
                                            type="time"
                                            name="endTime"
                                            value={formData.endTime}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add event location or virtual link"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Add description"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            Category
                                        </label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map((category) => (
                                                <option
                                                    key={category.id}
                                                    value={category.name}
                                                    className="bg-gray-800"
                                                >
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-white/80">
                                            Priority
                                        </label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleInputChange}
                                            className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="LOW" className="bg-gray-800">
                                                Low
                                            </option>
                                            <option value="MEDIUM" className="bg-gray-800">
                                                Medium
                                            </option>
                                            <option value="HIGH" className="bg-gray-800">
                                                High
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-white/80">
                                        Max Attendees (Optional)
                                    </label>
                                    <input
                                        type="number"
                                        name="maxAttendees"
                                        value={formData.maxAttendees || ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData((prev) => ({
                                                ...prev,
                                                maxAttendees: value ? parseInt(value) : undefined,
                                            }));
                                        }}
                                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Leave empty for unlimited"
                                        min="1"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={createEventMutation.isPending || !formData.category}
                                    className="flex w-full transform items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 py-4 text-lg font-semibold text-white transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-cyan-500 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {createEventMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Creating Event...
                                        </>
                                    ) : (
                                        'Create Event'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateEvent;
