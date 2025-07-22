import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import type { PrivateTodosRecord } from '../lib/pocketbase-types';
import { toast } from 'sonner';

export interface TodoFormInput {
  title: string;
  description: string;
}

export function usePrivateTodos(userId: string | undefined) {
  const queryClient = useQueryClient();
  const [editingTodo, setEditingTodo] = useState<PrivateTodosRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todosQuery = useQuery<PrivateTodosRecord[]>({
    queryKey: ['privateTodos', userId],
    queryFn: async () => {
      if (!userId) return [];
      const records = await pb.collection('private_todos').getFullList({
        filter: `user = "${userId}"`,
        sort: '-created',
      });
      return records as PrivateTodosRecord[];
    },
    enabled: !!userId,
  });

  const createTodoMutation = useMutation({
    mutationFn: async (newTodo: TodoFormInput) => {
      if (!userId) throw new Error("User not authenticated.");
      const record = await pb.collection('private_todos').create({
        ...newTodo,
        completed: false,
        user: userId,
      });
      return record as PrivateTodosRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateTodos', userId] });
      toast.success("Todo Created", {
        description: "Your private todo has been added.",
      });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error("Error Creating Todo", {
        description: error.message || "Failed to create todo.",
      });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedTodo: PrivateTodosRecord) => {
      const record = await pb.collection('private_todos').update(updatedTodo.id, updatedTodo);
      return record as PrivateTodosRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateTodos', userId] });
      toast.success("Todo Updated", {
        description: "Your private todo has been updated.",
      });
      setEditingTodo(null);
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast.error("Error Updating Todo", {
        description: error.message || "Failed to update todo.",
      });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (todoId: string) => {
      await pb.collection('private_todos').delete(todoId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privateTodos', userId] });
      toast.success("Todo Deleted", {
        description: "Your private todo has been removed.",
      });
    },
    onError: (error: any) => {
      toast.error("Error Deleting Todo", {
        description: error.message || "Failed to delete todo.",
      });
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