// src/App.tsx
import { useEffect, useState } from 'react';
import { Outlet } from '@tanstack/react-router';
import { pb } from './lib/pocketbase';
import { queryClient } from './lib/tanstack-query';
import { Toaster, toast } from 'sonner';
import { Button } from './components/ui/button'; // Shadcn Button component
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './components/ui/dropdown-menu'; // Shadcn DropdownMenu components
import { LogOut, User, Home, ListTodo, Users } from 'lucide-react'; // Lucide icons
import type { RecordModel } from 'pocketbase'; // Import RecordModel for Pocketbase user type
 // Import RecordModel for Pocketbase user type

// Define a type for the authenticated user model from Pocketbase
// This extends RecordModel to include common user fields like email and name
interface AuthUser extends RecordModel {
  email: string;
  name?: string; // Optional name field
  // Add any other custom fields you have on your Pocketbase 'users' collection
}

// Main application component
function App() {
  // Initialize user state with the current Pocketbase auth model, cast to AuthUser or null
  const [user, setUser] = useState<AuthUser | null>(pb.authStore.model as AuthUser | null);
  
  // Effect to listen for Pocketbase auth state changes
  useEffect(() => {
    // Subscribe to auth store changes
    const unsubscribe = pb.authStore.onChange(() => {
      // Update user state whenever the auth store changes
      setUser(pb.authStore.model as AuthUser | null);
      // Invalidate all queries related to user data when auth state changes
      queryClient.invalidateQueries();
    });

    // Clean up the subscription on component unmount
    return () => unsubscribe();
  }, []);

  // Handle user logout
  const handleLogout = async () => {
    try {
      pb.authStore.clear(); // Clear the authentication token
      toast.success("Logged out", {
        description: "You have been successfully logged out."
      });
      window.location.reload();
      // The router's protected routes will handle redirection to login page
    } catch (error: any) { // Type 'any' for error for now, can be refined
      console.error("Logout failed:", error);
      toast.error("Logout failed", {
        description: error.message || "An unexpected error occurred during logout."
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Todo App</h1>
          {user && (
            <nav className="hidden md:flex gap-4">
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600" asChild>
                <a href="/">
                  <Home className="mr-2 h-4 w-4" /> Dashboard
                </a>
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600" asChild>
                <a href="/private-todos">
                  <ListTodo className="mr-2 h-4 w-4" /> Private Todos
                </a>
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600" asChild>
                <a href="/public-todos">
                  <ListTodo className="mr-2 h-4 w-4" /> Public Todos
                </a>
              </Button>
              <Button variant="ghost" className="text-gray-700 hover:text-blue-600" asChild>
                <a href="/groups">
                  <Users className="mr-2 h-4 w-4" /> Groups
                </a>
              </Button>
            </nav>
          )}
        </div>

        {/* User authentication status and actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.name || "User"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div >
          
            </div>
          )}
        </div>
      </header>

      {/* Main content area, rendered by Tanstack Router */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Outlet />
      </main>

      {/* Sonner Toaster for displaying notifications */}
      <Toaster />
    </div>
  );
}

export default App;
