"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAuth } from '../hooks/use-auth';
import { api } from '../lib/api';
import { toast } from 'react-hot-toast';
import { 
  X, 
  Plus, 
  Upload, 
  Image as ImageIcon,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Sparkles,
  Heart,
  Award,
  Users,
  BookOpen,
  Zap,
  Volume2,
  Video,
  Camera,
  Mic,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Tag
} from 'lucide-react';

interface FeatureFormProps {
  onSuccess?: (feature: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

const categories = [
  { value: "beginner", label: "😊 For Beginners", emoji: "😊", description: "Easy to use features for new users" },
  { value: "pro", label: "⚡ For Pros", emoji: "⚡", description: "Advanced features for power users" },
  { value: "everyone", label: "🌟 For Everyone", emoji: "🌟", description: "Universal features for all users" }
];

const difficulties = [
  { value: "easy", label: "😮 Easy", emoji: "😮", description: "Simple to implement and use" },
  { value: "medium", label: "⚙️ Medium", emoji: "⚙️", description: "Moderate complexity" },
  { value: "hard", label: "🎓 Advanced", emoji: "🎓", description: "Complex features for experts" }
];

const audiences = [
  { value: "kids", label: "🧒 Kids", emoji: "🧒", description: "Child-friendly features" },
  { value: "beginners", label: "🌱 Beginners", emoji: "🌱", description: "New users learning the app" },
  { value: "pros", label: "🚀 Pros", emoji: "🚀", description: "Power users and developers" },
  { value: "elderly", label: "👴 Elderly", emoji: "👴", description: "Accessibility features for seniors" }
];

const priorities = [
  { value: "low", label: "Low", description: "Nice to have" },
  { value: "medium", label: "Medium", description: "Important but not urgent" },
  { value: "high", label: "High", description: "Important and urgent" },
  { value: "critical", label: "Critical", description: "Blocking or very important" }
];

const effortEstimates = [
  { value: "1-2 hours", label: "1-2 hours" },
  { value: "1-2 days", label: "1-2 days" },
  { value: "1 week", label: "1 week" },
  { value: "2-4 weeks", label: "2-4 weeks" },
  { value: "1-2 months", label: "1-2 months" },
  { value: "3+ months", label: "3+ months" }
];

const suggestedTags = [
  "video summary", "voice AI", "transcription", "translation", "dark mode", 
  "mobile app", "desktop app", "accessibility", "speed", "quality", 
  "export", "share", "collaboration", "templates", "customization"
];

const suggestedFeatures = [
  {
    title: "Dark Mode Support",
    description: "Add a dark theme option for better user experience in low-light environments",
    category: "everyone",
    tags: ["dark mode", "accessibility", "ui"]
  },
  {
    title: "Voice-to-Text Transcription",
    description: "Allow users to speak and get automatic text transcription",
    category: "beginner",
    tags: ["voice AI", "transcription", "accessibility"]
  },
  {
    title: "Multi-Language Support",
    description: "Add support for multiple languages in summaries and interface",
    category: "everyone",
    tags: ["translation", "international", "accessibility"]
  },
  {
    title: "Advanced API Integration",
    description: "Provide detailed API documentation and SDK for developers",
    category: "pro",
    tags: ["api", "developers", "integration"]
  }
];

export default function FeatureForm({ onSuccess, onCancel, initialData }: FeatureFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    feature_type: initialData?.feature_type || 'enhancement',
    category: initialData?.category || 'everyone',
    priority: initialData?.priority || 'medium',
    estimated_effort: initialData?.estimated_effort || '',
    tags: initialData?.tags || [],
    screenshot_url: initialData?.screenshot_url || '',
    audio_url: initialData?.audio_url || '',
    video_url: initialData?.video_url || '',
    difficulty_level: initialData?.difficulty_level || 'easy',
    target_audience: initialData?.target_audience || []
  });
  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [userType, setUserType] = useState<string>('unknown');

  useEffect(() => {
    if (user) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      const response = await api.get('/features/user/profile');
      setUserType(response.data.user_type);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-4">Please log in to share your ideas with the community</p>
            <Button onClick={onCancel}>Go Back</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    } else if (formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.priority) {
      newErrors.priority = 'Priority is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post('/features', {
        title: formData.title.trim(),
        description: formData.description.trim(),
        feature_type: formData.feature_type,
        category: formData.category,
        priority: formData.priority,
        estimated_effort: formData.estimated_effort || undefined,
        tags: formData.tags,
        screenshot_url: formData.screenshot_url || undefined,
        audio_url: formData.audio_url || undefined,
        video_url: formData.video_url || undefined,
        difficulty_level: formData.difficulty_level,
        target_audience: formData.target_audience
      });

      toast.success('🎉 Your idea has been shared with the community!');
      onSuccess?.(response.data);
    } catch (error: any) {
      console.error('Error creating feature request:', error);
      toast.error(error.response?.data?.detail || 'Failed to create feature request');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove) 
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const selectSuggestion = (suggestion: any) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      tags: suggestion.tags
    }));
    setShowSuggestions(false);
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return "💡 What's your idea?";
      case 2: return "🎯 Who is this for?";
      case 3: return "📝 Tell us more";
      default: return "Submit your idea";
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <CardTitle className="text-2xl font-bold text-gray-900">
            Share Your Idea
          </CardTitle>
        </div>
        <p className="text-gray-600">
          Help us improve YTS by AI! What should the app do better?
        </p>
        
        {/* Progress Steps */}
        <div className="flex items-center justify-between mt-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 mx-2 ${
                  step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Basic Idea */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{getStepTitle(1)}</h3>
                
                {/* Quick Suggestions */}
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="mb-2"
                  >
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showSuggestions ? 'Hide' : 'Show'} Example Ideas
                  </Button>
                  
                  {showSuggestions && (
                    <div className="grid gap-2 mb-4">
                      {suggestedFeatures.map((suggestion, index) => (
                        <Card key={index} className="cursor-pointer hover:bg-blue-50" onClick={() => selectSuggestion(suggestion)}>
                          <CardContent className="p-3">
                            <div className="font-medium text-sm">{suggestion.title}</div>
                            <div className="text-xs text-gray-600">{suggestion.description}</div>
                            <div className="flex gap-1 mt-2">
                              {suggestion.tags.map((tag, tagIndex) => (
                                <Badge key={tagIndex} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      What should we call your idea? *
                    </div>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Dark Mode Support, Voice Transcription, etc."
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Tell us about your idea *
                    </div>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe what you want the app to do. What problem does it solve? How should it work?"
                    rows={4}
                    className={errors.description ? 'border-red-500' : ''}
                  />
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Be specific and detailed</span>
                    <span>{formData.description.length}/2000</span>
                  </div>
                  {errors.description && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Target Audience */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{getStepTitle(2)}</h3>
                
                {/* Category */}
                <div className="space-y-2 mb-4">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Who is this feature for? *
                    </div>
                  </Label>
                  <div className="grid gap-2">
                    {categories.map(category => (
                      <div
                        key={category.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.category === category.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('category', category.value)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.emoji}</span>
                          <div>
                            <div className="font-medium">{category.label}</div>
                            <div className="text-sm text-gray-600">{category.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Target Audience */}
                <div className="space-y-2 mb-4">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Specific audience (optional)
                    </div>
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {audiences.map(audience => (
                      <div
                        key={audience.value}
                        className={`p-2 border rounded-lg cursor-pointer transition-colors ${
                          formData.target_audience.includes(audience.value)
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          const newAudience = formData.target_audience.includes(audience.value)
                            ? formData.target_audience.filter((a: string) => a !== audience.value)
                            : [...formData.target_audience, audience.value];
                          handleInputChange('target_audience', newAudience);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{audience.emoji}</span>
                          <div className="text-sm">
                            <div className="font-medium">{audience.label}</div>
                            <div className="text-xs text-gray-600">{audience.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="space-y-2">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      How complex is this feature?
                    </div>
                  </Label>
                  <div className="grid gap-2">
                    {difficulties.map(difficulty => (
                      <div
                        key={difficulty.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          formData.difficulty_level === difficulty.value 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleInputChange('difficulty_level', difficulty.value)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{difficulty.emoji}</span>
                          <div>
                            <div className="font-medium">{difficulty.label}</div>
                            <div className="text-sm text-gray-600">{difficulty.description}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Additional Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">{getStepTitle(3)}</h3>
                
                {/* Priority and Effort */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4" />
                        How important is this? *
                      </div>
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: string) => handleInputChange('priority', value)}
                    >
                      <SelectTrigger className={errors.priority ? 'border-red-500' : ''}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map(priority => (
                          <SelectItem key={priority.value} value={priority.value}>
                            <div>
                              <div className="font-medium">{priority.label}</div>
                              <div className="text-sm text-gray-500">{priority.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.priority}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_effort">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Estimated effort (optional)
                      </div>
                    </Label>
                    <Select
                      value={formData.estimated_effort}
                      onValueChange={(value: string) => handleInputChange('estimated_effort', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select effort" />
                      </SelectTrigger>
                      <SelectContent>
                        {effortEstimates.map(effort => (
                          <SelectItem key={effort.value} value={effort.value}>
                            {effort.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2 mb-4">
                  <Label htmlFor="tags">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags to help categorize your idea
                    </div>
                  </Label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Add a tag (max 5)"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        disabled={!newTag.trim() || formData.tags.length >= 5}
                        variant="outline"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Suggested Tags */}
                    <div className="flex flex-wrap gap-1">
                      {suggestedTags.map((tag) => (
                        <Button
                          key={tag}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (!formData.tags.includes(tag) && formData.tags.length < 5) {
                              handleInputChange('tags', [...formData.tags, tag]);
                            }
                          }}
                          disabled={formData.tags.includes(tag) || formData.tags.length >= 5}
                        >
                          {tag}
                        </Button>
                      ))}
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {formData.tags.map((tag: string, index: number) => (
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="hover:text-red-500"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Media Uploads */}
                <div className="space-y-4">
                  <Label>
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4" />
                      Add media (optional)
                    </div>
                  </Label>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="screenshot_url">Screenshot URL</Label>
                      <Input
                        id="screenshot_url"
                        value={formData.screenshot_url}
                        onChange={(e) => handleInputChange('screenshot_url', e.target.value)}
                        placeholder="https://example.com/screenshot.png"
                        type="url"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="audio_url">Audio URL</Label>
                      <Input
                        id="audio_url"
                        value={formData.audio_url}
                        onChange={(e) => handleInputChange('audio_url', e.target.value)}
                        placeholder="https://example.com/audio.mp3"
                        type="url"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="video_url">Video URL</Label>
                      <Input
                        id="video_url"
                        value={formData.video_url}
                        onChange={(e) => handleInputChange('video_url', e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        type="url"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={loading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            )}
            
            <div className="flex-1" />
            
            {currentStep < 3 ? (
              <Button
                type="button"
                onClick={nextStep}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sharing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Share Your Idea
                  </>
                )}
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>

          {/* Help Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">Tips for a great idea:</span>
            </div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about what you want to achieve</li>
              <li>• Explain the problem it solves</li>
              <li>• Provide examples or use cases</li>
              <li>• Consider the impact on other users</li>
              <li>• Use clear, descriptive language</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 