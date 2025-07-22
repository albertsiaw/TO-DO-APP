import React from 'react';
import { useForm } from '@tanstack/react-form';
import { pb } from '../lib/pocketbase';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import {
  Card,
} from '../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { PlusCircle, Edit, Trash2, Loader2, Info } from 'lucide-react';
import { usePublicTodos } from '../hooks/usePublicTodos';

function PublicTodosPage() {
  const currentUserId = pb.authStore.model?.id;
  const {
    todos,
    isLoading,
    isError,
    editingTodo,
    setEditingTodo,
    isModalOpen,
    setIsModalOpen,
    createTodoMutation,
    updateTodoMutation,
    deleteTodoMutation,
  } = usePublicTodos(currentUserId);

  const form = useForm({
    defaultValues: {
      title: editingTodo?.title || '',
      description: editingTodo?.description || '',
    },
    onSubmit: async ({ value }) => {
      if (editingTodo) {
        updateTodoMutation.mutate({ ...editingTodo, ...value });
      } else {
        createTodoMutation.mutate(value);
      }
    },
  });

  React.useEffect(() => {
    form.setFieldValue('title', editingTodo?.title || '');
    form.setFieldValue('description', editingTodo?.description || '');
  }, [editingTodo]);

  const toggleTodoCompletion = async (todo: any) => {
    if (todo.expand?.author?.id !== currentUserId) {
      toast("Permission Denied", { description: "You can only change the completion status of your own public todos." });
      return;
    }
    updateTodoMutation.mutate({ ...todo, completed: !todo.completed });
  };

  const handleEditClick = (todo: any | null) => {
    if (todo && todo.expand?.author?.id !== currentUserId) {
      toast("Permission Denied", { description: "You can only edit your own public todos." });
      return;
    }
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (todo: any) => {
    if (todo.expand?.author?.id !== currentUserId) {
      toast("Permission Denied", { description: "You can only delete your own public todos." });
      return;
    }
    deleteTodoMutation.mutate(todo);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg text-gray-700">Loading public todos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500 text-lg">
        Failed to load public todos. Please try again.
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Public Todos</h1>

      {/* Add New Public Todo Button and Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => handleEditClick(null)} className="mb-6 flex items-center gap-2">
            <PlusCircle className="h-5 w-5" /> Add New Public Todo
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingTodo ? 'Edit Public Todo' : 'Create New Public Todo'}</DialogTitle>
            <DialogDescription>
              {editingTodo ? 'Make changes to this public todo here.' : 'Add a new public todo item for everyone to see.'}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid gap-4 py-4"
          >
            <form.Field name="title">
              {({ state, handleChange, handleBlur }) => (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="col-span-3"
                    required
                  />
                  {state.meta.errors && <p className="col-span-4 text-sm text-red-500">{state.meta.errors.join(', ')}</p>}
                </div>
              )}
            </form.Field>
            <form.Field name="description">
              {({ state, handleChange, handleBlur }) => (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    className="col-span-3"
                  />
                  {state.meta.errors && <p className="col-span-4 text-sm text-red-500">{state.meta.errors.join(', ')}</p>}
                </div>
              )}
            </form.Field>
            <DialogFooter>
              <Button type="submit" disabled={form.state.isSubmitting || createTodoMutation.isPending}>
                {(form.state.isSubmitting || createTodoMutation.isPending) ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {editingTodo ? 'Save Changes' : 'Create Todo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* List of Public Todos */}
      {todos && todos.length > 0 ? (
        <div className="grid gap-4">
          {todos.map((todo: any) => (
            <Card key={todo.id} className="p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={`todo-${todo.id}`}
                    checked={todo.completed}
                    onCheckedChange={() => toggleTodoCompletion(todo)}
                    disabled={updateTodoMutation.isPending || todo.expand?.author?.id !== currentUserId}
                  />
                  <Label
                    htmlFor={`todo-${todo.id}`}
                    className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}
                  >
                    {todo.title}
                    {todo.description && (
                      <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                    )}
                  </Label>
                </div>
                <div className="flex gap-2">
                  {todo.expand?.author?.id === currentUserId && (
                    <>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(todo)}>
                        <Edit className="h-5 w-5 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(todo)}
                        disabled={deleteTodoMutation.isPending}
                      >
                        {deleteTodoMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                        ) : (
                          <Trash2 className="h-5 w-5 text-red-500" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-500 mt-2 flex items-center justify-between">
                <div>
                  Authored by: <span className="font-semibold">
                    {todo.expand?.author?.name || todo.expand?.author?.email || 'Unknown'}
                  </span>
                </div>
                {todo.last_edited_at && (
                  <div className="flex items-center gap-1">
                    <Info className="h-4 w-4" />
                    Edited: {new Date(todo.last_edited_at).toLocaleString()}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 text-lg mt-10">
          No public todos available. Be the first to create one!
        </p>
      )}
    </div>
  );
}

export default PublicTodosPage;