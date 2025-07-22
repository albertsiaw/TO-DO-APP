import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { pb } from '../lib/pocketbase';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
function RegisterPage() {
    const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await pb.collection('users').create({
          email: value.email,
          password: value.password,
          passwordConfirm: value.passwordConfirm,
          username: value.email.split('@')[0],
        });

        // verification
        await pb.collection('users').requestVerification(value.email);

        // automatic login
        await pb.collection('users').authWithPassword(value.email, value.password);

        toast.success("Registration Successful", {
          description: "You have been logged in. Please check your email to verify your account."
        });
        navigate({ to: '/' }); 
      } catch (error: any) {
        console.error("Registration failed:", error);
        toast.error("Registration Failed", {
          description: error.message || "An unexpected error occurred during registration."
        });
      }
    },
  });

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Register</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="grid gap-4"
          >
            {/* Email Field */}
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  value.length < 5 ? 'Email must be at least 5 characters' : undefined,
                onChangeAsync: async ({ value }) => {
                  await new Promise((resolve) => setTimeout(resolve, 500));
                  return value.includes('@') ? undefined : 'Email must contain "@"';
                },
              }}
            >
              {({ state, handleChange, handleBlur }) => (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    required
                  />
                  {state.meta.errors && (
                    <p className="text-sm text-red-500">{state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password Field */}
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  value.length < 8 ? 'Password must be at least 8 characters' : undefined,
              }}
            >
              {({ state, handleChange, handleBlur }) => (
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    required
                  />
                  {state.meta.errors && (
                    <p className="text-sm text-red-500">{state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Password Confirm Field */}
            <form.Field
              name="passwordConfirm"
              validators={{
                onChange: ({ value }) =>
                  value !== form.state.values.password ? 'Passwords do not match' : undefined,
              }}
            >
              {({ state, handleChange, handleBlur }) => (
                <div className="grid gap-2">
                  <Label htmlFor="passwordConfirm">Confirm Password</Label>
                  <Input
                    id="passwordConfirm"
                    type="password"
                    value={state.value}
                    onChange={(e) => handleChange(e.target.value)}
                    onBlur={handleBlur}
                    required
                  />
                  {state.meta.errors && (
                    <p className="text-sm text-red-500">{state.meta.errors.join(', ')}</p>
                  )}
                </div>
              )}
            </form.Field>

            <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline ml-1">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default RegisterPage;

