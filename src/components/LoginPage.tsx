import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { ArrowLeft, Eye, EyeOff, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signin, signup, resetPassword } = useAuth();
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    screenName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    // Basic validation
    if (!loginData.email || !loginData.password) {
      setLoginError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!loginData.email.includes('@')) {
      setLoginError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      await signin(loginData.email, loginData.password);
      toast.success('Successfully signed in!');
      onNavigate('home');
    } catch (error: any) {
      setLoginError(error.message || 'Failed to sign in');
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    setIsLoading(true);

    // Basic validation
    if (!signupData.firstName || !signupData.lastName || !signupData.screenName || !signupData.email || !signupData.password || !signupData.confirmPassword) {
      setSignupError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    if (!signupData.email.includes('@')) {
      setSignupError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (signupData.password.length < 6) {
      setSignupError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate screen name format
    if (!/^[a-zA-Z0-9_]+$/.test(signupData.screenName)) {
      setSignupError('Screen name can only contain letters, numbers, and underscores');
      setIsLoading(false);
      return;
    }

    try {
      await signup(
          signupData.email,
          signupData.password,
          signupData.firstName,
          signupData.lastName,
          signupData.screenName
      );
      toast.success('Account created successfully!');
      onNavigate('home');
    } catch (error: any) {
      setSignupError(error.message || 'Failed to create account');
      toast.error(error.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsResetting(true);

    // Basic validation
    if (!resetEmail) {
      toast.error('Please enter your email address');
      setIsResetting(false);
      return;
    }

    if (!resetEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      setIsResetting(false);
      return;
    }

    try {
      await resetPassword(resetEmail);
      toast.success('Password reset email sent! Check your inbox.');
      setIsResetDialogOpen(false);
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email');
    } finally {
      setIsResetting(false);
    }
  };

  return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <Button
                variant="ghost"
                onClick={() => onNavigate('home')}
                className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-primary mb-2">MuralDB</h1>
              <p className="text-muted-foreground">Welcome to your gallery management system</p>
            </div>
          </div>

          <Card>
            <Tabs defaultValue="login" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <TabsContent value="login">
                <form onSubmit={handleLogin}>
                  <CardContent className="space-y-4">
                    <CardTitle>Sign in to your account</CardTitle>
                    <CardDescription>
                      Enter your email and password to access MuralDB
                    </CardDescription>

                    {loginError && (
                        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                          {loginError}
                        </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={loginData.password}
                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Signing In...
                          </>
                      ) : (
                          'Sign In'
                      )}
                    </Button>
                    <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="link"
                            className="text-sm text-primary"
                        >
                          Forgot your password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handlePasswordReset}>
                          <DialogHeader>
                            <DialogTitle>Reset Password</DialogTitle>
                            <DialogDescription>
                              Enter your email address and we'll send you a link to reset your password.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="reset-email">Email Address</Label>
                            <Input
                                id="reset-email"
                                type="email"
                                placeholder="Enter your email"
                                value={resetEmail}
                                onChange={(e) => setResetEmail(e.target.value)}
                                className="mt-2"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsResetDialogOpen(false)}
                                disabled={isResetting}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isResetting}>
                              {isResetting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Sending...
                                  </>
                              ) : (
                                  <>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Reset Link
                                  </>
                              )}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                    <div className="text-sm text-muted-foreground text-center">
                      Enter your credentials to access your account
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup}>
                  <CardContent className="space-y-4">
                    <CardTitle>Create your account</CardTitle>
                    <CardDescription>
                      Sign up to start managing your galleries and documents
                    </CardDescription>

                    {signupError && (
                        <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">
                          {signupError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-first-name">First Name</Label>
                        <Input
                            id="signup-first-name"
                            type="text"
                            placeholder="Enter your first name"
                            value={signupData.firstName}
                            onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-last-name">Last Name</Label>
                        <Input
                            id="signup-last-name"
                            type="text"
                            placeholder="Enter your last name"
                            value={signupData.lastName}
                            onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-screen-name">Screen Name</Label>
                      <Input
                          id="signup-screen-name"
                          type="text"
                          placeholder="Choose a display name"
                          value={signupData.screenName}
                          onChange={(e) => setSignupData({ ...signupData, screenName: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        This is the name that will be displayed when you're logged in
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Create a password (min 6 characters)"
                            value={signupData.password}
                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                            id="signup-confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={signupData.confirmPassword}
                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        />
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-3">
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Creating Account...
                          </>
                      ) : (
                          'Create Account'
                      )}
                    </Button>
                    <div className="text-sm text-muted-foreground text-center">
                      By signing up, you agree to our terms and conditions
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
  );
}