// src/router/index.tsx
import {
  RootRoute,
  Route,
  Router,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { pb } from '../lib/pocketbase';
import App from '../App';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import PrivateTodosPage from '../pages/PrivateTodosPage';
import PublicTodosPage from '../pages/PublicTodosPage';
import GroupManagementPage from '../pages/GroupManagementPage';
import GroupTodosPage from '../pages/GroupTodoPage';

// Create a root route
const rootRoute = new RootRoute({
  component: () => (
    <>
      {/* App component acts as the main layout, containing header and Outlet */}
      <App />
    </>
  ),
});

// Authentication Routes
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  // If user is already authenticated, redirect to dashboard
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: '/' });
    }
  },
});

const registerRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: RegisterPage,
  // If user is already authenticated, redirect to dashboard
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: '/' });
    }
  },
});

const forgotPasswordRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
  // If user is already authenticated, redirect to dashboard
  beforeLoad: () => {
    if (pb.authStore.isValid) {
      throw redirect({ to: '/' });
    }
  },
});

// Authenticated Routes (Protected Routes)
const authenticatedRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'authenticated', // Unique ID for this route segment
  // Before loading any child route, check if the user is authenticated
  beforeLoad: () => {
    if (!pb.authStore.isValid) {
      // If not authenticated, redirect to the login page
      throw redirect({ to: '/login' });
    }
  },
  // This route itself doesn't render anything directly, it just provides an Outlet for its children
  component: () => <Outlet />,
});

const dashboardRoute = new Route({
  getParentRoute: () => authenticatedRoute,
  path: '/',
  component: DashboardPage,
});

const privateTodosRoute = new Route({
  getParentRoute: () => authenticatedRoute,
  path: '/private-todos',
  component: PrivateTodosPage,
});

const publicTodosRoute = new Route({
  getParentRoute: () => authenticatedRoute,
  path: '/public-todos',
  component: PublicTodosPage,
});

const groupManagementRoute = new Route({
  getParentRoute: () => authenticatedRoute,
  path: '/groups',
  component: GroupManagementPage,
});

const groupTodosRoute = new Route({
  getParentRoute: () => authenticatedRoute,
  path: '/groups/$groupId', // Dynamic segment for group ID
  component: GroupTodosPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  forgotPasswordRoute,
  authenticatedRoute.addChildren([
    dashboardRoute,
    privateTodosRoute,
    publicTodosRoute,
    groupManagementRoute,
    groupTodosRoute,
  ]),
]);

// Create the router instance
export const router = new Router({ routeTree });

// Register the router for type safety (optional, but good practice)
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
