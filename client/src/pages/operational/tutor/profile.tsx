import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { API_URL } from "@/lib/config";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User } from "@shared/schema";
import { Upload, X, Loader2, Edit3, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TutorProfile() {
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    bio: "",
  });

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useQuery<User>({
    queryKey: ["/api/tutor/user-profile"],
    enabled: isAuthenticated && !authLoading,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [isAuthenticated, authLoading, toast]);

  useEffect(() => {
    if (userError && isUnauthorizedError(userError)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
    }
  }, [userError, toast]);

  useEffect(() => {
    if (user) {
      setFormData({
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const updateProfile = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest("PUT", "/api/tutor/profile", {
        phone: data.phone.trim() || null,
        bio: data.bio.trim() || null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Profile updated successfully.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadProfileImage = useMutation({
    mutationFn: async (file: File) => {
      try {
        console.log("Starting file upload for:", file.name, file.type, file.size);
        
        // Simple base64 encoding without compression
        const reader = new FileReader();
        return new Promise((resolve, reject) => {
          reader.onload = async () => {
            try {
              const result = reader.result as string;
              const base64 = result.split(',')[1];
              console.log("Base64 encoded, length:", base64.length);
              
              console.log("Sending POST to API_URL /api/tutor/profile/upload-image", API_URL);
              const response = await fetch(`${API_URL}/api/tutor/profile/upload-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  imageBase64: base64,
                  imageMime: file.type || 'image/jpeg',
                }),
              }).catch((fetchError) => {
                console.error("Fetch network error:", fetchError);
                throw fetchError;
              });
              
              console.log("Response received, status:", response.status);
              const data = await response.json();
              console.log("Response data:", data);
              
              if (!response.ok) {
                throw new Error(data.message || `Upload failed with status ${response.status}`);
              }
              resolve(data);
            } catch (error) {
              console.error("Upload error:", error);
              reject(error);
            }
          };
          reader.onerror = () => {
            console.error("FileReader error");
            reject(new Error('Failed to read file'));
          };
          reader.readAsDataURL(file);
        });
      } catch (error) {
        console.error("Upload error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
      setPreviewImage(null);
      setIsUploadingImage(false);
      toast({
        title: "Success",
        description: "Profile picture updated successfully.",
      });
    },
    onError: (error) => {
      setIsUploadingImage(false);
      console.error("Upload mutation error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeProfileImage = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/tutor/profile/image", {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
      toast({
        title: "Success",
        description: "Profile picture removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
      setIsUploadingImage(true);
      uploadProfileImage.mutate(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const getInitials = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.name && user.name.trim()) {
      return user.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getFullName = (): string => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.name || user?.email || "User";
  };

  if (authLoading || userLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-32 rounded-full" />
          <Skeleton className="h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and profile settings</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} size="lg" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Picture Section */}
        <Card className="border-2 overflow-hidden hover:border-primary/30 transition-colors">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-lg">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <div className="flex items-center gap-8">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg">
                  <AvatarImage src={previewImage || user?.profileImageUrl || undefined} alt={getFullName()} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div className="flex gap-2">
                      <label htmlFor="image-upload" className="cursor-pointer flex-1">
                        <Button
                          type="button"
                          variant="default"
                          size="lg"
                          className="w-full gap-2"
                          disabled={isUploadingImage}
                          asChild
                        >
                          <span>
                            {isUploadingImage ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload Picture
                              </>
                            )}
                          </span>
                        </Button>
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                      {user?.profileImageUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          size="lg"
                          className="gap-2 text-destructive"
                          onClick={() => removeProfileImage.mutate()}
                          disabled={removeProfileImage.isPending}
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF (Max 5MB)
                    </p>
                    {!user?.profileImageUrl && (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800 text-sm">
                          No picture set yet? Your initials (<strong>{getInitials()}</strong>) will be displayed instead.
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    {user?.profileImageUrl ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-800">Profile picture set</span>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span className="text-sm text-amber-800">Showing initials (<strong>{getInitials()}</strong>)</span>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Click "Edit Profile" to upload or change your picture.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information */}
        <Card className="border-2 hover:border-primary/30 transition-colors">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardTitle className="text-lg">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Full Name (Read-only) */}
              <div className="space-y-3">
                <Label htmlFor="fullName" className="text-base font-semibold">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={getFullName()}
                  disabled
                  className="bg-muted border-2 text-base h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Full name cannot be edited. Contact support to change.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted border-2 text-base h-11"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be edited. Contact support to change.
                </p>
              </div>

              {/* Phone Number (Editable) */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-2 text-base h-11"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted bg-muted/50">
                    <span className="text-base">{formData.phone || "Not provided"}</span>
                  </div>
                )}
              </div>

              {/* Bio/About (Editable) */}
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
                {isEditing ? (
                  <Textarea
                    id="bio"
                    placeholder="Tell us who you are + your personality"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={5}
                    className="border-2 text-base resize-none"
                  />
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-lg border-2 border-muted bg-muted/50 min-h-32">
                    <span className="text-base leading-relaxed">{formData.bio || "Not provided"}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-6 border-t-2">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={updateProfile.isPending}
                    className="flex-1 gap-2"
                  >
                    {updateProfile.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => {
                      setIsEditing(false);
                      if (user) {
                        setFormData({
                          phone: user.phone || "",
                          bio: user.bio || "",
                        });
                      }
                    }}
                    disabled={updateProfile.isPending}
                    className="flex-1 gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
