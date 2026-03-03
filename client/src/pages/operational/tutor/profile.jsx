var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
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
import { Upload, X, Loader2, Edit3, Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function TutorProfile() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading, authUser = _a.user;
    var toast = useToast().toast;
    var _b = useState(false), isEditing = _b[0], setIsEditing = _b[1];
    var _c = useState(false), isUploadingImage = _c[0], setIsUploadingImage = _c[1];
    var _d = useState(null), previewImage = _d[0], setPreviewImage = _d[1];
    var _e = useState({
        phone: "",
        bio: "",
    }), formData = _e[0], setFormData = _e[1];
    var _f = useQuery({
        queryKey: ["/api/tutor/user-profile"],
        enabled: isAuthenticated && !authLoading,
    }), user = _f.data, userLoading = _f.isLoading, userError = _f.error;
    useEffect(function () {
        if (!authLoading && !isAuthenticated) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [isAuthenticated, authLoading, toast]);
    useEffect(function () {
        if (userError && isUnauthorizedError(userError)) {
            toast({
                title: "Unauthorized",
                description: "You are logged out. Logging in again...",
                variant: "destructive",
            });
            setTimeout(function () {
                window.location.href = "/";
            }, 500);
        }
    }, [userError, toast]);
    useEffect(function () {
        if (user) {
            setFormData({
                phone: user.phone || "",
                bio: user.bio || "",
            });
        }
    }, [user]);
    var updateProfile = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("PUT", "/api/tutor/profile", {
                            phone: data.phone.trim() || null,
                            bio: data.bio.trim() || null,
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
            setIsEditing(false);
            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });
        },
        onError: function (error) {
            if (isUnauthorizedError(error)) {
                toast({
                    title: "Unauthorized",
                    description: "You are logged out. Logging in again...",
                    variant: "destructive",
                });
                setTimeout(function () {
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
    var uploadProfileImage = useMutation({
        mutationFn: function (file) { return __awaiter(_this, void 0, void 0, function () {
            var reader_1;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    console.log("Starting file upload for:", file.name, file.type, file.size);
                    reader_1 = new FileReader();
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            reader_1.onload = function () { return __awaiter(_this, void 0, void 0, function () {
                                var result, base64, response, data, error_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 3, , 4]);
                                            result = reader_1.result;
                                            base64 = result.split(',')[1];
                                            console.log("Base64 encoded, length:", base64.length);
                                            console.log("Sending POST to API_URL /api/tutor/profile/upload-image", API_URL);
                                            return [4 /*yield*/, fetch("".concat(API_URL, "/api/tutor/profile/upload-image"), {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({
                                                        imageBase64: base64,
                                                        imageMime: file.type || 'image/jpeg',
                                                    }),
                                                }).catch(function (fetchError) {
                                                    console.error("Fetch network error:", fetchError);
                                                    throw fetchError;
                                                })];
                                        case 1:
                                            response = _a.sent();
                                            console.log("Response received, status:", response.status);
                                            return [4 /*yield*/, response.json()];
                                        case 2:
                                            data = _a.sent();
                                            console.log("Response data:", data);
                                            if (!response.ok) {
                                                throw new Error(data.message || "Upload failed with status ".concat(response.status));
                                            }
                                            resolve(data);
                                            return [3 /*break*/, 4];
                                        case 3:
                                            error_1 = _a.sent();
                                            console.error("Upload error:", error_1);
                                            reject(error_1);
                                            return [3 /*break*/, 4];
                                        case 4: return [2 /*return*/];
                                    }
                                });
                            }); };
                            reader_1.onerror = function () {
                                console.error("FileReader error");
                                reject(new Error('Failed to read file'));
                            };
                            reader_1.readAsDataURL(file);
                        })];
                }
                catch (error) {
                    console.error("Upload error:", error);
                    throw error;
                }
                return [2 /*return*/];
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
            setPreviewImage(null);
            setIsUploadingImage(false);
            toast({
                title: "Success",
                description: "Profile picture updated successfully.",
            });
        },
        onError: function (error) {
            setIsUploadingImage(false);
            console.error("Upload mutation error:", error);
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to upload profile picture. Please try again.",
                variant: "destructive",
            });
        },
    });
    var removeProfileImage = useMutation({
        mutationFn: function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("DELETE", "/api/tutor/profile/image", {})];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/tutor/user-profile"] });
            toast({
                title: "Success",
                description: "Profile picture removed.",
            });
        },
        onError: function () {
            toast({
                title: "Error",
                description: "Failed to remove profile picture. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleImageSelect = function (e) { return __awaiter(_this, void 0, void 0, function () {
        var file, reader;
        var _a;
        return __generator(this, function (_b) {
            file = (_a = e.target.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return [2 /*return*/];
            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Error",
                    description: "Please select a valid image file.",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "Error",
                    description: "Image must be less than 5MB.",
                    variant: "destructive",
                });
                return [2 /*return*/];
            }
            reader = new FileReader();
            reader.onloadend = function () {
                setPreviewImage(reader.result);
                setIsUploadingImage(true);
                uploadProfileImage.mutate(file);
            };
            reader.readAsDataURL(file);
            return [2 /*return*/];
        });
    }); };
    var handleSubmit = function (e) {
        e.preventDefault();
        updateProfile.mutate(formData);
    };
    var getInitials = function () {
        if ((user === null || user === void 0 ? void 0 : user.firstName) && (user === null || user === void 0 ? void 0 : user.lastName)) {
            return "".concat(user.firstName[0]).concat(user.lastName[0]).toUpperCase();
        }
        if ((user === null || user === void 0 ? void 0 : user.name) && user.name.trim()) {
            return user.name
                .split(" ")
                .map(function (n) { return n[0]; })
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (user === null || user === void 0 ? void 0 : user.email) {
            return user.email[0].toUpperCase();
        }
        return "U";
    };
    var getFullName = function () {
        if ((user === null || user === void 0 ? void 0 : user.firstName) && (user === null || user === void 0 ? void 0 : user.lastName)) {
            return "".concat(user.firstName, " ").concat(user.lastName);
        }
        return (user === null || user === void 0 ? void 0 : user.name) || (user === null || user === void 0 ? void 0 : user.email) || "User";
    };
    if (authLoading || userLoading) {
        return (<DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-8 w-48"/>
          <Skeleton className="h-32 w-32 rounded-full"/>
          <Skeleton className="h-64"/>
        </div>
      </DashboardLayout>);
    }
    return (<DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your personal information and profile settings</p>
          </div>
          {!isEditing && (<Button onClick={function () { return setIsEditing(true); }} size="lg" className="gap-2">
              <Edit3 className="w-4 h-4"/>
              Edit Profile
            </Button>)}
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
                  <AvatarImage src={previewImage || (user === null || user === void 0 ? void 0 : user.profileImageUrl) || undefined} alt={getFullName()}/>
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-bold text-2xl">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (<div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white"/>
                  </div>)}
              </div>
              <div className="flex-1 space-y-4">
                {isEditing ? (<>
                    <div className="flex gap-2">
                      <label htmlFor="image-upload" className="cursor-pointer flex-1">
                        <Button type="button" variant="default" size="lg" className="w-full gap-2" disabled={isUploadingImage} asChild>
                          <span>
                            {isUploadingImage ? (<>
                                <Loader2 className="w-4 h-4 animate-spin"/>
                                Uploading...
                              </>) : (<>
                                <Upload className="w-4 h-4"/>
                                Upload Picture
                              </>)}
                          </span>
                        </Button>
                      </label>
                      <input id="image-upload" type="file" accept="image/*" onChange={handleImageSelect} disabled={isUploadingImage} className="hidden"/>
                      {(user === null || user === void 0 ? void 0 : user.profileImageUrl) && (<Button type="button" variant="outline" size="lg" className="gap-2 text-destructive" onClick={function () { return removeProfileImage.mutate(); }} disabled={removeProfileImage.isPending}>
                          <X className="w-4 h-4"/>
                          Remove
                        </Button>)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF (Max 5MB)
                    </p>
                    {!(user === null || user === void 0 ? void 0 : user.profileImageUrl) && (<Alert className="bg-blue-50 border-blue-200">
                        <AlertCircle className="h-4 w-4 text-blue-600"/>
                        <AlertDescription className="text-blue-800 text-sm">
                          No picture set yet? Your initials (<strong>{getInitials()}</strong>) will be displayed instead.
                        </AlertDescription>
                      </Alert>)}
                  </>) : (<div className="space-y-2">
                    {(user === null || user === void 0 ? void 0 : user.profileImageUrl) ? (<div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600"/>
                        <span className="text-sm text-green-800">Profile picture set</span>
                      </div>) : (<div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600"/>
                        <span className="text-sm text-amber-800">Showing initials (<strong>{getInitials()}</strong>)</span>
                      </div>)}
                    <p className="text-sm text-muted-foreground">
                      Click "Edit Profile" to upload or change your picture.
                    </p>
                  </div>)}
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
                <Input id="fullName" type="text" value={getFullName()} disabled className="bg-muted border-2 text-base h-11"/>
                <p className="text-xs text-muted-foreground">
                  Full name cannot be edited. Contact support to change.
                </p>
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                <Input id="email" type="email" value={(user === null || user === void 0 ? void 0 : user.email) || ""} disabled className="bg-muted border-2 text-base h-11"/>
                <p className="text-xs text-muted-foreground">
                  Email cannot be edited. Contact support to change.
                </p>
              </div>

              {/* Phone Number (Editable) */}
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                {isEditing ? (<Input id="phone" type="tel" placeholder="Enter your phone number" value={formData.phone} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { phone: e.target.value })); }} className="border-2 text-base h-11"/>) : (<div className="flex items-center gap-3 p-3 rounded-lg border-2 border-muted bg-muted/50">
                    <span className="text-base">{formData.phone || "Not provided"}</span>
                  </div>)}
              </div>

              {/* Bio/About (Editable) */}
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-base font-semibold">Bio</Label>
                {isEditing ? (<Textarea id="bio" placeholder="Tell us who you are + your personality" value={formData.bio} onChange={function (e) { return setFormData(__assign(__assign({}, formData), { bio: e.target.value })); }} rows={5} className="border-2 text-base resize-none"/>) : (<div className="flex items-start gap-3 p-4 rounded-lg border-2 border-muted bg-muted/50 min-h-32">
                    <span className="text-base leading-relaxed">{formData.bio || "Not provided"}</span>
                  </div>)}
              </div>

              {/* Action Buttons */}
              {isEditing && (<div className="flex gap-3 pt-6 border-t-2">
                  <Button type="submit" size="lg" disabled={updateProfile.isPending} className="flex-1 gap-2">
                    {updateProfile.isPending ? (<>
                        <Loader2 className="w-4 h-4 animate-spin"/>
                        Saving...
                      </>) : (<>
                        <Check className="w-4 h-4"/>
                        Save Changes
                      </>)}
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={function () {
                setIsEditing(false);
                if (user) {
                    setFormData({
                        phone: user.phone || "",
                        bio: user.bio || "",
                    });
                }
            }} disabled={updateProfile.isPending} className="flex-1 gap-2">
                    <X className="w-4 h-4"/>
                    Cancel
                  </Button>
                </div>)}
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>);
}
