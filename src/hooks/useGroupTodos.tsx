import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pb } from '../lib/pocketbase';
import { toast } from 'sonner';
import type { GroupTodosRecord, UsersRecord, GroupsRecord } from '../lib/pocketbase-types';

export interface GroupTodoWithAuthorAndGroup extends GroupTodosRecord {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  expand?: {
    author: UsersRecord;
    group: GroupsRecord;
  };
}

export interface TodoFormInput {
  title: string;
  description: string;
}

export function useGroupTodos(groupId: string | undefined, currentUserId: string | undefined, groupDetails?: GroupsRecord) {
  const queryClient = useQueryClient();
  const [editingTodo, setEditingTodo] = useState<GroupTodoWithAuthorAndGroup | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todosQuery = useQuery<GroupTodoWithAuthorAndGroup[]>({
    queryKey: ['groupTodos', groupId],
    queryFn: async () => {
      if (!groupId) return [];
      const records = await pb.collection('group_todos').getFullList({
        filter: `group = "${groupId}"`,
        sort: '-created',
        expand: 'author',
      });
      return records.map((record: any) => ({
        id: record.id,
        title: record.title,
        description: record.description,
        completed: record.completed,
        group: record.group,
        author: record.author,
        expand: record.expand,
        created: record.created,
        updated: record.updated,
      })) as GroupTodoWithAuthorAndGroup[];
    },
    enabled: !!groupId && !!currentUserId,
  });

  useEffect(() => {
    const subscribeToGroupTodos = async () => {
      if (!groupId || !currentUserId) return;
      await pb.collection('group_todos').subscribe('*', (e: { record: { group: string; }; action: string; }) => {
        if (e.record.group === groupId) {
          queryClient.invalidateQueries({ queryKey: ['groupTodos', groupId] });
          toast(
            `Group Todo ${e.action === 'create' ? 'Added!' : e.action === 'update' ? 'Updated!' : 'Removed!'}`,
            {
              description: `A todo in "${groupDetails?.name || 'this group'}" has been ${e.action}d.`,
            }
          );
        }
      });
    };
    subscribeToGroupTodos();
    return () => {
      pb.collection('group_todos').unsubscribe('*');
    };
  }, [groupId, currentUserId, queryClient, groupDetails?.name]);

  const createTodoMutation = useMutation({
    mutationFn: async (newTodo: TodoFormInput) => {
      if (!currentUserId || !groupId) throw new Error("User not authenticated or Group ID missing.");
      const record = await pb.collection('group_todos').create({
        ...newTodo,
        completed: false,
        group: groupId,
        author: currentUserId,
      });
      return record as GroupTodosRecord;
    },
    onSuccess: () => {
      toast("Group Todo Created", { description: "Your group todo has been added." });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast("Error Creating Group Todo", { description: error.message || "Failed to create group todo." });
    },
  });

  const updateTodoMutation = useMutation({
    mutationFn: async (updatedTodo: GroupTodoWithAuthorAndGroup) => {
      if (updatedTodo.expand?.author?.id !== currentUserId) {
        throw new Error("You are not authorized to edit this todo.");
      }
      const record = await pb.collection('group_todos').update(updatedTodo.id, updatedTodo);
      return record as GroupTodosRecord;
    },
    onSuccess: () => {
      toast("Group Todo Updated", { description: "The group todo has been updated." });
      setEditingTodo(null);
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      toast("Error Updating Group Todo", { description: error.message || "Failed to update group todo." });
    },
  });

  const deleteTodoMutation = useMutation({
    mutationFn: async (todo: GroupTodoWithAuthorAndGroup) => {
      if (todo.expand?.author?.id !== currentUserId) {
        throw new Error("You are not authorized to delete this todo.");
      }
      await pb.collection('group_todos').delete(todo.id);
    },
    onSuccess: () => {
      toast("Group Todo Deleted", { description: "The group todo has been removed." });
    },
    onError: (error: any) => {
      toast("Error Deleting Group Todo", { description: error.message || "Failed to delete group todo." });
    },
  });

  return {
    todos: todosQuery.data,
    isLoadingTodos: todosQuery.isLoading,
    isErrorTodos: todosQuery.isError,
    editingTodo,
    setEditingTodo,
    isModalOpen,
    setIsModalOpen,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
  };
}