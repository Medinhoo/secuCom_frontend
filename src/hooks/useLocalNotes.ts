import { useState, useEffect, useCallback } from 'react';

const NOTES_STORAGE_KEY = 'secretariat_dashboard_notes';

export const useLocalNotes = () => {
  const [notes, setNotes] = useState<string>('');
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem(NOTES_STORAGE_KEY);
    const savedTimestamp = localStorage.getItem(`${NOTES_STORAGE_KEY}_timestamp`);
    
    if (savedNotes) {
      setNotes(savedNotes);
    }
    
    if (savedTimestamp) {
      setLastModified(new Date(savedTimestamp));
    }
  }, []);

  // Debounced save function
  const saveNotes = useCallback(
    debounce((notesToSave: string) => {
      setIsSaving(true);
      try {
        localStorage.setItem(NOTES_STORAGE_KEY, notesToSave);
        localStorage.setItem(`${NOTES_STORAGE_KEY}_timestamp`, new Date().toISOString());
        setLastModified(new Date());
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des notes:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1000),
    []
  );

  const updateNotes = (newNotes: string) => {
    setNotes(newNotes);
    saveNotes(newNotes);
  };

  const clearNotes = () => {
    setNotes('');
    localStorage.removeItem(NOTES_STORAGE_KEY);
    localStorage.removeItem(`${NOTES_STORAGE_KEY}_timestamp`);
    setLastModified(null);
  };

  const formatLastModified = (): string => {
    if (!lastModified) return 'Jamais modifié';
    
    const now = new Date();
    const diffMs = now.getTime() - lastModified.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    
    return lastModified.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return {
    notes,
    updateNotes,
    clearNotes,
    lastModified,
    formatLastModified,
    isSaving,
  };
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
