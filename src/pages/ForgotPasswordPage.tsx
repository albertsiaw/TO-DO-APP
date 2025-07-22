
import { Link} from '@tanstack/react-router';
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

 import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';

function ForgotPasswordPage() {
  const form = useForgotPasswordForm();

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
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

            <Button type="submit" className="w-full" disabled={form.state.isSubmitting}>
              {form.state.isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-sm mt-4">
          Remember your password?{" "}
          <Link to="/login" className="text-blue-600 hover:underline ml-1">
            Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

export default ForgotPasswordPage;