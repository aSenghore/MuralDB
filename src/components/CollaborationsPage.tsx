import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { Users, Share2, Mail, Eye, Edit, Trash2, UserPlus, Calendar, Clock, Check, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  email: string;
  firstName: string;
  lastName: string;
  screenName: string;
  profilePicture?: string;
}

interface Gallery {
  id: string;
  name: string;
  description: string;
  imageCount: number;
  thumbnail: string;
  owner: string;
  sharedWith: string[];
  permissions: 'view' | 'edit';
  sharedDate: Date;
  tags: string[];
}

interface Invitation {
  id: string;
  galleryId: string;
  galleryName: string;
  from: string;
  fromName: string;
  permissions: 'view' | 'edit';
  message?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'declined';
}

interface CollaborationsPageProps {
  user: User | null;
}

export function CollaborationsPage({ user }: CollaborationsPageProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [selectedGallery, setSelectedGallery] = useState<string>('');
  const [invitePermissions, setInvitePermissions] = useState<'view' | 'edit'>('view');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  // Mock data for shared galleries
  const [sharedGalleries] = useState<Gallery[]>([
    {
      id: '1',
      name: 'Character Concept Art',
      description: 'Collection of character designs and concept sketches',
      imageCount: 24,
      thumbnail: '/api/placeholder/300/200',
      owner: 'alice.artist@example.com',
      sharedWith: ['bob.designer@example.com', 'charlie.dev@example.com'],
      permissions: 'edit',
      sharedDate: new Date('2024-01-15'),
      tags: ['Characters', 'Concept Art', 'Fantasy']
    },
    {
      id: '2',
      name: 'Environmental Studies',
      description: 'Reference photos and studies of various environments',
      imageCount: 18,
      thumbnail: '/api/placeholder/300/200',
      owner: 'bob.designer@example.com',
      sharedWith: ['alice.artist@example.com'],
      permissions: 'view',
      sharedDate: new Date('2024-01-20'),
      tags: ['Environment', 'Reference', 'Landscapes']
    },
    {
      id: '3',
      name: 'UI/UX References',
      description: 'Design inspiration and interface examples',
      imageCount: 32,
      thumbnail: '/api/placeholder/300/200',
      owner: 'charlie.dev@example.com',
      sharedWith: ['alice.artist@example.com', 'bob.designer@example.com'],
      permissions: 'view',
      sharedDate: new Date('2024-01-10'),
      tags: ['UI', 'UX', 'Design', 'Interface']
    }
  ]);

  // Mock data for owned galleries that are shared with others
  const [ownedSharedGalleries] = useState<Gallery[]>([
    {
      id: '4',
      name: 'My Portfolio Work',
      description: 'Personal portfolio pieces shared with collaborators',
      imageCount: 15,
      thumbnail: '/api/placeholder/300/200',
      owner: user?.email || '',
      sharedWith: ['mentor@example.com', 'colleague@example.com'],
      permissions: 'view',
      sharedDate: new Date('2024-01-25'),
      tags: ['Portfolio', 'Personal Work']
    },
    {
      id: '5',
      name: 'Team Project Assets',
      description: 'Shared assets for ongoing team project',
      imageCount: 42,
      thumbnail: '/api/placeholder/300/200',
      owner: user?.email || '',
      sharedWith: ['team1@example.com', 'team2@example.com', 'team3@example.com'],
      permissions: 'edit',
      sharedDate: new Date('2024-02-01'),
      tags: ['Team', 'Project', 'Assets']
    }
  ]);

  // Mock data for pending invitations
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: '1',
      galleryId: '6',
      galleryName: 'Animation References',
      from: 'animator@example.com',
      fromName: 'Alex Animator',
      permissions: 'view',
      message: 'Would love to share my animation reference collection with you!',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending'
    },
    {
      id: '2',
      galleryId: '7',
      galleryName: 'Digital Painting Workshop',
      from: 'instructor@example.com',
      fromName: 'Maria Instructor',
      permissions: 'edit',
      message: 'Join our collaborative digital painting workshop gallery.',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'pending'
    }
  ]);

  // Mock list of user's own galleries for invitation
  const [myGalleries] = useState([
    { id: '4', name: 'My Portfolio Work' },
    { id: '5', name: 'Team Project Assets' },
    { id: '8', name: 'Study Sketches' },
    { id: '9', name: 'Digital Paintings' }
  ]);

  const handleSendInvite = () => {
    if (!inviteEmail || !selectedGallery) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate sending invitation
    toast.success(`Invitation sent to ${inviteEmail}`);
    setInviteEmail('');
    setInviteMessage('');
    setSelectedGallery('');
    setInvitePermissions('view');
    setIsInviteDialogOpen(false);
  };

  const handleInvitationResponse = (invitationId: string, action: 'accept' | 'decline') => {
    setInvitations(prev =>
        prev.map(inv =>
            inv.id === invitationId
                ? { ...inv, status: action === 'accept' ? 'accepted' : 'declined' }
                : inv
        )
    );

    toast.success(
        action === 'accept'
            ? 'Invitation accepted! Gallery added to your collaborations.'
            : 'Invitation declined.'
    );
  };

  if (!user) {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="text-center space-y-4 py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground" />
            <h2 className="text-2xl font-medium">Sign In Required</h2>
            <p className="text-muted-foreground">
              Please sign in to view and manage your gallery collaborations.
            </p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-medium text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Collaborations
            </h1>
            <p className="text-muted-foreground">
              Manage shared galleries and collaborate with other artists
            </p>
          </div>

          {/* Invite Someone Button */}
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Someone
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite to Gallery</DialogTitle>
                <DialogDescription>
                  Share one of your galleries with another artist
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gallery-select">Select Gallery</Label>
                  <select
                      id="gallery-select"
                      value={selectedGallery}
                      onChange={(e) => setSelectedGallery(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="">Choose a gallery...</option>
                    {myGalleries.map((gallery) => (
                        <option key={gallery.id} value={gallery.id}>
                          {gallery.name}
                        </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-email">Email Address</Label>
                  <Input
                      id="invite-email"
                      type="email"
                      placeholder="artist@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Permissions</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                          type="radio"
                          name="permissions"
                          value="view"
                          checked={invitePermissions === 'view'}
                          onChange={(e) => setInvitePermissions(e.target.value as 'view' | 'edit')}
                      />
                      <span className="text-sm">View Only</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                          type="radio"
                          name="permissions"
                          value="edit"
                          checked={invitePermissions === 'edit'}
                          onChange={(e) => setInvitePermissions(e.target.value as 'view' | 'edit')}
                      />
                      <span className="text-sm">Can Edit</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-message">Message (Optional)</Label>
                  <textarea
                      id="invite-message"
                      placeholder="Add a personal message..."
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background min-h-[80px] resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSendInvite} className="flex-1">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                  <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Invitations */}
        {invitations.filter(inv => inv.status === 'pending').length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Pending Invitations
                </CardTitle>
                <CardDescription>
                  Gallery invitations waiting for your response
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {invitations
                    .filter(inv => inv.status === 'pending')
                    .map((invitation) => (
                        <Alert key={invitation.id} className="p-4">
                          <AlertDescription>
                            <div className="flex items-center justify-between">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {invitation.fromName} invited you to "{invitation.galleryName}"
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {invitation.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {invitation.timestamp.toLocaleDateString()} at {invitation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                                  <Badge variant={invitation.permissions === 'edit' ? 'default' : 'secondary'} className="text-xs">
                                    {invitation.permissions === 'edit' ? 'Can Edit' : 'View Only'}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    onClick={() => handleInvitationResponse(invitation.id, 'accept')}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleInvitationResponse(invitation.id, 'decline')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            </div>
                          </AlertDescription>
                        </Alert>
                    ))}
              </CardContent>
            </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Galleries Shared With Me */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                Shared With Me
              </CardTitle>
              <CardDescription>
                Galleries that others have shared with you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sharedGalleries.length > 0 ? (
                  <div className="space-y-3">
                    {sharedGalleries.map((gallery) => (
                        <div key={gallery.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{gallery.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {gallery.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Shared by {gallery.owner}
                              </p>
                            </div>
                            <Badge variant={gallery.permissions === 'edit' ? 'default' : 'secondary'} className="text-xs">
                              {gallery.permissions === 'edit' ? 'Can Edit' : 'View Only'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {gallery.imageCount} images
                        </span>
                              <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                                {gallery.sharedDate.toLocaleDateString()}
                        </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {gallery.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                            ))}
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Gallery
                            </Button>
                            {gallery.permissions === 'edit' && (
                                <Button size="sm" variant="outline">
                                  <Edit className="h-3 w-3 mr-1" />
                                  Edit
                                </Button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8 space-y-3">
                    <Eye className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No shared galleries yet</p>
                    <p className="text-sm text-muted-foreground">
                      When others share galleries with you, they'll appear here
                    </p>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* My Shared Galleries */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5 text-primary" />
                My Shared Galleries
              </CardTitle>
              <CardDescription>
                Galleries you've shared with others
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownedSharedGalleries.length > 0 ? (
                  <div className="space-y-3">
                    {ownedSharedGalleries.map((gallery) => (
                        <div key={gallery.id} className="border border-border rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h4 className="font-medium">{gallery.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {gallery.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Shared with {gallery.sharedWith.length} {gallery.sharedWith.length === 1 ? 'person' : 'people'}
                              </p>
                            </div>
                            <Badge variant={gallery.permissions === 'edit' ? 'default' : 'secondary'} className="text-xs">
                              {gallery.permissions === 'edit' ? 'Can Edit' : 'View Only'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {gallery.imageCount} images
                        </span>
                              <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                                {gallery.sharedDate.toLocaleDateString()}
                        </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {gallery.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                            ))}
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">SHARED WITH:</p>
                            <div className="space-y-1">
                              {gallery.sharedWith.map((email, index) => (
                                  <div key={index} className="flex items-center justify-between text-xs">
                                    <span>{email}</span>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button size="sm" variant="outline" className="flex-1">
                              <Eye className="h-3 w-3 mr-1" />
                              View Gallery
                            </Button>
                            <Button size="sm" variant="outline">
                              <UserPlus className="h-3 w-3 mr-1" />
                              Invite More
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
              ) : (
                  <div className="text-center py-8 space-y-3">
                    <Share2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">No shared galleries yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start collaborating by sharing your galleries with others
                    </p>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Collaboration Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Collaboration Tips</CardTitle>
            <CardDescription>
              Make the most out of your gallery collaborations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Sharing Best Practices</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Organize your galleries before sharing</li>
                  <li>• Use descriptive gallery names and descriptions</li>
                  <li>• Add relevant tags to make content discoverable</li>
                  <li>• Consider permissions carefully</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Communication</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Include messages with invitations</li>
                  <li>• Set clear expectations for collaboration</li>
                  <li>• Discuss editing permissions beforehand</li>
                  <li>• Provide context for shared references</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Privacy & Security</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Only share with trusted collaborators</li>
                  <li>• Review who has access regularly</li>
                  <li>• Remove access when collaboration ends</li>
                  <li>• Keep sensitive work in private galleries</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}