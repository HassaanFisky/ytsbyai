import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'done':
      return { label: 'Done', color: 'green' };
    case 'pending':
      return { label: 'Pending', color: 'yellow' };
    case 'failed':
      return { label: 'Failed', color: 'red' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
};

export const getPriorityInfo = (priority: string) => {
  switch (priority) {
    case 'high':
      return { label: 'High', color: 'red' };
    case 'medium':
      return { label: 'Medium', color: 'orange' };
    case 'low':
      return { label: 'Low', color: 'blue' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getCategoryInfo = (category: string) => {
  switch (category) {
    case 'ui_ux':
      return { label: 'UI/UX', color: 'blue' };
    case 'performance':
      return { label: 'Performance', color: 'green' };
    case 'security':
      return { label: 'Security', color: 'red' };
    case 'feature':
      return { label: 'Feature', color: 'purple' };
    case 'bug':
      return { label: 'Bug', color: 'orange' };
    default:
      return { label: 'Other', color: 'gray' };
  }
};

export const getDifficultyInfo = (difficulty: string) => {
  switch (difficulty) {
    case 'easy':
      return { label: 'Easy', color: 'green' };
    case 'medium':
      return { label: 'Medium', color: 'yellow' };
    case 'hard':
      return { label: 'Hard', color: 'red' };
    default:
      return { label: 'Unknown', color: 'gray' };
  }
}; 