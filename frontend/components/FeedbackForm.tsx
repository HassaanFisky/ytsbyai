'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  X, 
  Bug, 
  Lightbulb, 
  AlertTriangle, 
  Rocket, 
  Send,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
  pageUrl?: string;
}

interface FeedbackType {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const feedbackTypes: FeedbackType[] = [
  {
    value: 'bug',
    label: 'Bug Report',
    icon: <Bug className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 border-red-200'
  },
  {
    value: 'issue',
    label: 'Issue',
    icon: <AlertTriangle className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  {
    value: 'idea',
    label: 'Feature Idea',
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 border-green-200'
  },
  {
    value: 'feature',
    label: 'Feature Request',
    icon: <Rocket className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    value: 'general',
    label: 'General Feedback',
    icon: <MessageSquare className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 border-gray-200'
  }
];

const FeedbackForm: React.FC<FeedbackFormProps> = ({ isOpen, onClose, pageUrl }) => {
  const [feedbackType, setFeedbackType] = useState<string>('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (message.trim().length < 10) {
      toast.error('Please provide more details (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feedback_type: feedbackType,
          message: message.trim(),
          email: email.trim() || undefined,
          page_url: pageUrl || window.location.href
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        toast.success('Thank you for your feedback!');
        
        // Reset form after a delay
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFeedbackType('');
    setMessage('');
    setEmail('');
    setIsSubmitted(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const selectedType = feedbackTypes.find(type => type.value === feedbackType);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <CardTitle>Send Feedback</CardTitle>
          </div>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        {isSubmitted ? (
          <CardContent className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Thank You!</h3>
            <p className="text-gray-600">
              Your feedback has been submitted successfully. We'll review it and get back to you soon.
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Feedback Type */}
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback Type *</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedType && (
                  <Badge className={selectedType.color}>
                    <div className="flex items-center gap-1">
                      {selectedType.icon}
                      {selectedType.label}
                    </div>
                  </Badge>
                )}
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your feedback in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  {message.length}/500 characters (minimum 10)
                </p>
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500">
                  We'll use this to follow up on your feedback
                </p>
              </div>

              {/* Current Page */}
              {pageUrl && (
                <div className="space-y-2">
                  <Label>Current Page</Label>
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    {pageUrl}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !feedbackType || message.trim().length < 10}
                  className="flex-1"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Feedback
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default FeedbackForm; 