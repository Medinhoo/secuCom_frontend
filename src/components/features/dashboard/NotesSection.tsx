import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { StickyNote, Plus, Trash2, Clock, Check } from 'lucide-react';
import { useLocalNotes } from '@/hooks/useLocalNotes';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export const NotesSection: React.FC = () => {
  const { 
    notes, 
    updateNotes, 
    clearNotes, 
    formatLastModified, 
    isSaving 
  } = useLocalNotes();

  const [newTodo, setNewTodo] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      const savedTodos = localStorage.getItem('secretariat_todos');
      return savedTodos ? JSON.parse(savedTodos) : [];
    } catch {
      return [];
    }
  });

  const saveTodos = (newTodos: TodoItem[]) => {
    setTodos(newTodos);
    localStorage.setItem('secretariat_todos', JSON.stringify(newTodos));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
      };
      saveTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    saveTodos(updatedTodos);
  };

  const clearCompleted = () => {
    const updatedTodos = todos.filter(todo => !todo.completed);
    saveTodos(updatedTodos);
  };

  const completedCount = todos.filter(t => t.completed).length;
  const pendingCount = todos.filter(t => !t.completed).length;

  return (
    <Card className="border-0 shadow-sm bg-yellow-50 border-yellow-200 h-[320px] flex flex-col">
      <CardHeader className="pb-3flex-shrink-0">
        <CardTitle className="text-lg font-bold text-yellow-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            Todo List Secrétariat
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
                {pendingCount} à faire
              </span>
            )}
            {completedCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCompleted}
                className="h-7 px-2 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-200"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Nettoyer
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="bg-yellow-50 flex-1 overflow-hidden flex flex-col">
        {/* Add new todo */}
        <div className="flex gap-2 mb-3 flex-shrink-0">
          <Input
            placeholder="Ajouter une tâche..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            className="flex-1 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-white text-sm"
          />
          <Button
            onClick={addTodo}
            size="sm"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-3"
            disabled={!newTodo.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Todo list */}
        <div className="flex-1 overflow-y-auto space-y-2">
          {todos.length === 0 ? (
            <div className="text-center py-8">
              <StickyNote className="h-10 w-10 text-yellow-400 mx-auto mb-3" />
              <p className="text-sm text-yellow-700 mb-1">Aucune tâche</p>
              <p className="text-xs text-yellow-600">Ajoutez votre première tâche ci-dessus</p>
            </div>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  todo.completed 
                    ? 'bg-yellow-100 border-yellow-200 opacity-75' 
                    : 'bg-white border-yellow-300 shadow-sm'
                }`}
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-0.5 h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-yellow-400 hover:border-yellow-500'
                  }`}
                >
                  {todo.completed && <Check className="h-3 w-3" />}
                </button>
                
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-tight ${
                    todo.completed 
                      ? 'line-through text-yellow-600' 
                      : 'text-yellow-900'
                  }`}>
                    {todo.text}
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    {new Date(todo.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-yellow-600 hover:text-red-600 transition-colors p-1"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Notes section */}
        {notes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-yellow-200 flex-shrink-0">
            <div className="text-xs text-yellow-700 mb-2 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Notes: {formatLastModified()}
            </div>
            <Textarea
              placeholder="Notes libres..."
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
              className="h-16 resize-none border-yellow-300 focus:border-yellow-500 focus:ring-yellow-500 bg-white text-xs"
            />
          </div>
        )}
        
        {notes.length === 0 && todos.length > 0 && (
          <div className="mt-3 pt-3 border-t border-yellow-200 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => updateNotes(' ')}
              className="w-full text-yellow-700 hover:bg-yellow-100 text-xs"
            >
              + Ajouter des notes libres
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
