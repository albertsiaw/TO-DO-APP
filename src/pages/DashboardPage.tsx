import { pb } from '../lib/pocketbase';
import { Link } from '@tanstack/react-router'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ListTodo, Users } from 'lucide-react'; 

// DashboardPage component - the main landing page after successful login
function DashboardPage() {
  const currentUser = pb.authStore.model;

  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
        Welcome, {currentUser?.email || 'User'}!
      </h1>

      <p className="text-lg text-gray-600 mb-10 text-center max-w-2xl mx-auto">
        This is your personalized dashboard. Manage your private tasks, collaborate on public lists,
        and organize group-specific todos all in one place.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">


        {/* Private Todos Card */}

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListTodo className="h-5 w-5 text-blue-600" /> Private Todos
            </CardTitle>
            <CardDescription>
              Your personal tasks, visible only to you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-gray-700">
              Keep track of your individual tasks and responsibilities.
              These todos are completely private and secure.
            </p>
            <Button asChild className="w-full">
              <Link to="/private-todos">Go to Private Todos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Public Todos Card */}


        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ListTodo className="h-5 w-5 text-green-600" /> Public Todos
            </CardTitle>
            <CardDescription>
              Tasks shared with everyone.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-gray-700">
              Collaborate and share tasks with other users.Your tasks are visible to all users of the app.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link to="/public-todos">Go to Public Todos</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Group Todos Card */}


        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-5 w-5 text-purple-600" /> Group Todos
            </CardTitle>
            <CardDescription>
              Manage tasks within your defined groups.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-gray-700">
              Create and manage groups, assign members, and create tasks visible only to group members.
            </p>
            <Button asChild variant="secondary" className="w-full">
              <Link to="/groups">Manage Groups</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Todo App. All rights reserved.</p>
      </div>
    </div>
  );
}

export default DashboardPage;
