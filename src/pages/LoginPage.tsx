import { useForm } from '@tanstack/react-form';
import { Link, useNavigate } from '@tanstack/react-router';
import { pb } from '../lib/pocketbase'; 
import {  toast } from 'sonner';
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

//  user login
function LoginPage() {
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      try {
        await pb.collection('users').authWithPassword(value.email, value.password);
        toast(
          "Login Successful",
          {
            description: "You have been successfully logged in.",
          }
        );
        navigate({ to: '/' });
      } catch (error: any) {
        console.error("Login failed:", error);
        toast(
          "Login Failed",
          {
            description: error.message || "An unexpected error occurred during login.",
          }
        );
      }
    },
  });

  const handleGoogleLogin = async () => {
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' });
      toast(
        "Google Login Successful",
        {
          description: "You have been successfully logged in with Google.",
        }
      );
      navigate({ to: '/' });
    } catch (error: any) {
      console.error("Google login failed:", error);
      toast(
        "Google Login Failed",
        {
          description: error.message || "An unexpected error occurred during Google login.",
        }
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Login</CardTitle>
          <CardDescription>Enter your email below to login to your account</CardDescription>
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
                  value.length < 6 ? 'Password must be at least 6 characters' : undefined,
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
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline text-right">
                    Forgot your password?
                  </Link>
                </div>
              )}
            </form.Field>

            <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
            Login with Google
          </Button>
        </CardContent>
        <CardFooter className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline ml-1">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default LoginPage;
