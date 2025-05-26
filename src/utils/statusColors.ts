import { DimonaStatus } from "@/types/DimonaTypes";

// Couleurs selon les spécifications
export const STATUS_COLORS = {
  [DimonaStatus.TO_CONFIRM]: {
    primary: '#FF9500',
    background: '#FFF4E6',
    border: '#FFD1A6',
    text: '#FF9500',
    lightBg: 'bg-orange-50',
    lightText: 'text-orange-700',
    lightBorder: 'border-orange-200'
  },
  [DimonaStatus.TO_SEND]: {
    primary: '#007AFF',
    background: '#F0F8FF',
    border: '#B3D9FF',
    text: '#007AFF',
    lightBg: 'bg-blue-50',
    lightText: 'text-blue-700',
    lightBorder: 'border-blue-200'
  },
  [DimonaStatus.IN_PROGRESS]: {
    primary: '#5856D6',
    background: '#F5F3FF',
    border: '#C4B5FD',
    text: '#5856D6',
    lightBg: 'bg-purple-50',
    lightText: 'text-purple-700',
    lightBorder: 'border-purple-200'
  },
  [DimonaStatus.REJECTED]: {
    primary: '#FF3B30',
    background: '#FEF2F2',
    border: '#FECACA',
    text: '#FF3B30',
    lightBg: 'bg-red-50',
    lightText: 'text-red-700',
    lightBorder: 'border-red-200'
  },
  [DimonaStatus.ACCEPTED]: {
    primary: '#34C759',
    background: '#F0FDF4',
    border: '#BBF7D0',
    text: '#34C759',
    lightBg: 'bg-green-50',
    lightText: 'text-green-700',
    lightBorder: 'border-green-200'
  }
} as const;

export const getStatusColor = (status: DimonaStatus) => {
  return STATUS_COLORS[status] || {
    primary: '#6B7280',
    background: '#F9FAFB',
    border: '#D1D5DB',
    text: '#6B7280',
    lightBg: 'bg-gray-50',
    lightText: 'text-gray-700',
    lightBorder: 'border-gray-200'
  };
};

export const getStatusClasses = (status: DimonaStatus) => {
  const colors = getStatusColor(status);
  return `${colors.lightBg} ${colors.lightText} ${colors.lightBorder}`;
};

export const getStatusTextClass = (status: DimonaStatus) => {
  const colors = getStatusColor(status);
  return colors.lightText.replace('text-', 'text-').replace('-700', '-600');
};
