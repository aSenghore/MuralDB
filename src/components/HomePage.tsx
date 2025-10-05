import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { RecentUploads } from './RecentUploads';
import { BookOpen, Image, ArrowRight, FileText, LogIn, UserPlus } from 'lucide-react';

interface User {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface HomePageProps {
  onNavigate: (page: string) => void;
  user?: User | null;
}

export function HomePage({ onNavigate, user }: HomePageProps) {
  return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-medium text-foreground">
            {user ? `Welcome back, ${user.screenName}!` : 'Welcome to MuralDB'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive digital workspace for organizing visual references, artwork, and project documents.
            Streamline your creative workflow with intuitive galleries and smart document management.
          </p>

          {!user && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
                <Button
                    size="lg"
                    onClick={() => onNavigate('login')}
                    className="gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In to Get Started
                </Button>
                <p className="text-muted-foreground">
                  New to MuralDB? Create an account in seconds
                </p>
              </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>References</CardTitle>
                  <CardDescription>
                    Curated collections of design references and inspiration materials
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                  onClick={() => onNavigate('references')}
                  className="w-full gap-2"
              >
                Explore References
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Image className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Art</CardTitle>
                  <CardDescription>
                    Beautiful artwork and photography collections from various artists
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                  onClick={() => onNavigate('art')}
                  className="w-full gap-2"
              >
                Browse Art Gallery
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Documents</CardTitle>
                  <CardDescription>
                    Organize project files, specifications, and important documents
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                  onClick={() => onNavigate('documents')}
                  className="w-full gap-2"
              >
                Manage Documents
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {user && (
            <div className="max-w-6xl mx-auto">
              <RecentUploads onNavigate={onNavigate} user={user} />
            </div>
        )}

        <div className="text-center">
          <p className="text-muted-foreground">
            {user
                ? 'Start by exploring our collections, create custom galleries, or organize your project documents.'
                : 'Sign in to access all features including personal galleries, document management, and more.'
            }
          </p>
        </div>
      </div>
  );
}