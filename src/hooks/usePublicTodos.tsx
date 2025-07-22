import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import type { PublicTodosRecord, UsersRecord } from '../lib/pocketbase-types';
import { toast } from 'sonner';

export interface PublicTodoWithAuthor extends PublicTodosRecord {
  id: string;
  expand?: {
    author: UsersRecord;
  };
}

export interface TodoFormInput {
  title: string;
  description: string;
}

export function usePublicTodos(currentUserId: string | undefined) {
  const queryClient = useQueryClient();
  const [editingTodo, setEditingTodo] = useState<PublicTodoWithAuthor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todosQuery = useQuery<PublicTodoWithAuthor[]>({
    queryKey: ['publicTodos'],
    queryFn: async () => {
      const records = await pb.collection('public_todos').getFullList({
        sort: '-created',
        expand: 'author',
      });
      return records as PublicTodoWithAuthor[];
    },
    enabled: !!currentUserId,
  });

  useEffect(() => {
    const subscribeToPublicTodos = async () => {
      if (!currentUserId) return;
      await pb.collection('public_todos').subscribe('*', (e: { action: string; record: { title: any; }; }) => {
        queryClient.invalidateQueries({ queryKey: ['publicTodos'] });
        if (e.action === 'create') {
          toast("New Public Todo!", { description: `A new todo "${e.record.title}" has been added.` });
        } else if (e.action === 'update') {
          toast("Public Todo Updated!", { description: `"${e.record.title}" has been updated.` });
        } else if (e.action === 'delete') {
          toast("Public Todo Removed!", { description: `A public todo has been removed.` });
        }
      });
    };
    subscribeToPublicTodos();
    return () => {
      pb.collection('public_todos').unsubscribe('*');
    };
  }, [queryClient, currentUserId]);

  const createTodoMutation = useMutation({
    mutationFn: async (newTodo: TodoFormInput) => {
      if (!currentUserId) throw new Error("User not authenticated.");
      const record = await pb.collection('public_todos').create({
        ...newTodo,
        completed: false,
        author: currentUserId,
      });
      return record as PublicTodosRecord;
    },
    onSuccess: () => {
      toast("Public Todo Created", { description: "Your public todo has been added." });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast("Error Creating Public Todo", { description: error.message || "Failed to create public todo." });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedTodo: PublicTodoWithAuthor) => {
      if (updatedTodo.expand?.author?.id !== currentUserId) {
        throw new Error("You are not authorized to edit this todo.");
      }
      const record = await pb.collection('public_todos').update(updatedTodo.id, {
        ...updatedTodo,
        last_edited_at: new Date().toISOString(),
      });
      return record as PublicTodosRecord;
    },
    onSuccess: () => {
      toast("Public Todo Updated", { description: "The public todo has been updated." });
      setEditingTodo(null);
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast("Error Updating Public Todo", { description: error.message || "Failed to update public todo." });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (todo: PublicTodoWithAuthor) => {
      if (todo.expand?.author?.id !== currentUserId) {
        throw new Error("You are not authorized to delete this todo.");
      }
      await pb.collection('public_todos').delete(todo.id);
    },
    onSuccess: () => {
      toast("Public Todo Deleted", { description: "The public todo has been removed." });
    },
    onError: (error: any) => {
      toast("Error Deleting Public Todo", { description: error.message || "Failed to delete public todo." });
    },
  });

  return {
    todos: todosQuery.data,
    isLoading: todosQuery.isLoading,
    isError: todosQuery.isError,
    editingTodo,
    setEditingTodo,
    isModalOpen,
    setIsModalOpen,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
  };
}