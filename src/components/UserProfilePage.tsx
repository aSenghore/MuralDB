import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Edit3, Trash2, Calendar, ExternalLink, Save, X, Shield, Upload, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { galleryService } from '../services/firebaseService';
import { FirebaseGallery } from '../types/firebase';
import { toast } from 'sonner';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';

interface UserProfilePageProps {
  user: {
    uid: string;
    email: string;
    firstName: string;
    lastName: string;
    screenName: string;
    profilePicture?: string;
  };
}

export function UserProfilePage({ user }: UserProfilePageProps) {
  const { updateUserProfile, logout } = useAuth();
  const [galleries, setGalleries] = useState<FirebaseGallery[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    screenName: user.screenName
  });
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user's galleries from Firebase
  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const userGalleries = await galleryService.getUserGalleries(user.uid);
        setGalleries(userGalleries);
      } catch (error) {
        console.error('Error loading galleries:', error);
        toast.error('Failed to load galleries');
      } finally {
        setIsLoading(false);
      }
    };

    loadGalleries();
  }, [user.uid]);

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      await updateUserProfile({
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        screenName: editForm.screenName,
        profilePicture: profilePicture
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      screenName: user.screenName
    });
    setProfilePicture(user.profilePicture || '');
    setIsEditing(false);
  };

  const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploadingImage(true);
    try {
      // Delete old profile picture if it exists
      if (profilePicture && profilePicture.includes('firebase')) {
        try {
          const oldImageRef = ref(storage, `profile-pictures/${user.uid}`);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.log('Old profile picture not found, continuing...');
        }
      }

      // Upload new profile picture
      const storageRef = ref(storage, `profile-pictures/${user.uid}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      setProfilePicture(downloadURL);
      toast.success('Profile picture uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    if (!profilePicture) return;

    try {
      if (profilePicture.includes('firebase')) {
        const imageRef = ref(storage, `profile-pictures/${user.uid}`);
        await deleteObject(imageRef);
      }
      
      setProfilePicture('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      toast.success('Profile picture removed');
    } catch (error: any) {
      console.error('Error removing profile picture:', error);
      toast.error('Failed to remove profile picture');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      toast.success('Account deletion would be implemented here');
      await logout();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    }
  };

  const handleDeleteGallery = async (galleryId: string) => {
    try {
      await galleryService.deleteGallery(galleryId);
      setGalleries(prev => prev.filter(g => g.id !== galleryId));
      toast.success('Gallery deleted successfully');
    } catch (error: any) {
      console.error('Error deleting gallery:', error);
      toast.error('Failed to delete gallery');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2">User Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button onClick={handleSaveChanges} size="sm" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              <Button onClick={handleCancelEdit} variant="outline" size="sm" disabled={isSaving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} size="sm">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="galleries">Galleries</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your basic account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture Section */}
              <div className="space-y-4">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profilePicture} alt="Profile" />
                    <AvatarFallback className="text-lg">
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                        >
                          {isUploadingImage ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                        {profilePicture && (
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            onClick={handleRemoveProfilePicture}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePictureUpload}
                          className="hidden"
                        />
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {profilePicture ? 'Profile picture uploaded' : 'No profile picture set'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 5MB.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                      placeholder="Enter your first name"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {user.firstName || 'Not set'}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={editForm.lastName}
                      onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                      placeholder="Enter your last name"
                    />
                  ) : (
                    <div className="p-3 bg-muted rounded-md">
                      {user.lastName || 'Not set'}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="screenName">Screen Name</Label>
                {isEditing ? (
                  <Input
                    id="screenName"
                    value={editForm.screenName}
                    onChange={(e) => setEditForm({ ...editForm, screenName: e.target.value })}
                    placeholder="Enter your screen name"
                  />
                ) : (
                  <div className="p-3 bg-muted rounded-md">
                    {user.screenName}
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  This is the name displayed when you're logged in
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="p-3 bg-muted rounded-md">
                  {user.email}
                </div>
                <p className="text-sm text-muted-foreground">
                  Email address cannot be changed. Contact support if needed.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="galleries" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Galleries</CardTitle>
              <CardDescription>
                A list of all galleries you have created
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 mx-auto animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading galleries...</p>
                </div>
              ) : galleries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You haven't created any galleries yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {galleries.map((gallery) => (
                    <div key={gallery.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{gallery.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {gallery.createdAt.toDate().toLocaleDateString()}
                          </span>
                          <Badge variant="secondary">
                            {gallery.images.length} images
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          View Gallery
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Gallery</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{gallery.name}"? This will permanently delete the gallery and all {gallery.images.length} images in it. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteGallery(gallery.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Gallery
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="p-4 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">
                    Password management is handled by Firebase Authentication. To change your password, you would need to implement password reset functionality.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-destructive">Danger Zone</h4>
                <div className="p-4 border border-destructive/20 rounded-md bg-destructive/5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">Delete Account</h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you absolutely sure you want to delete your account? This will permanently delete:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Your profile information</li>
                              <li>All your galleries and images</li>
                              <li>All your documents and folders</li>
                              <li>All your tags and metadata</li>
                            </ul>
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Account
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}