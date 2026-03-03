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
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MessageSquare, Send, Bold, Italic, List, ListOrdered, Quote } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
// Rich text editor toolbar component
function EditorToolbar(_a) {
    var editor = _a.editor;
    if (!editor)
        return null;
    return (<div className="flex flex-wrap gap-1 mb-3 sm:mb-4 p-1.5 sm:p-2 border rounded-lg bg-muted/50">
      <Button size="sm" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={function () { return editor.chain().focus().toggleBold().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2">
        <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
      </Button>
      <Button size="sm" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={function () { return editor.chain().focus().toggleItalic().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2">
        <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
      </Button>
      <div className="w-px bg-border mx-0.5 sm:mx-1"/>
      <Button size="sm" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={function () { return editor.chain().focus().toggleBulletList().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2">
        <List className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
      </Button>
      <Button size="sm" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={function () { return editor.chain().focus().toggleOrderedList().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2">
        <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
      </Button>
      <div className="w-px bg-border mx-0.5 sm:mx-1"/>
      <Button size="sm" variant={editor.isActive("blockquote") ? "default" : "ghost"} onClick={function () { return editor.chain().focus().toggleBlockquote().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2">
        <Quote className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>
      </Button>
      <div className="w-px bg-border mx-0.5 sm:mx-1"/>
      <Button size="sm" variant="ghost" onClick={function () { return editor.chain().focus().clearNodes().run(); }} className="h-7 sm:h-8 px-1.5 sm:px-2 text-xs">
        Clear
      </Button>
    </div>);
}
export default function COOBroadcast() {
    var _this = this;
    var _a = useAuth(), isAuthenticated = _a.isAuthenticated, authLoading = _a.isLoading;
    var toast = useToast().toast;
    var _b = useState(""), subject = _b[0], setSubject = _b[1];
    var _c = useState("all"), visibility = _c[0], setVisibility = _c[1];
    var editor = useEditor({
        extensions: [StarterKit],
        content: "",
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert min-h-48 max-h-96 w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 overflow-y-auto",
            },
        },
    });
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
    var sendBroadcast = useMutation({
        mutationFn: function (data) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, apiRequest("POST", "/api/coo/broadcast", {
                            subject: data.subject,
                            message: data.message,
                            visibility: data.visibility,
                            senderRole: "coo",
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); },
        onSuccess: function () {
            queryClient.invalidateQueries({ queryKey: ["/api/broadcasts"] });
            setSubject("");
            editor === null || editor === void 0 ? void 0 : editor.commands.clearContent();
            setVisibility("all");
            toast({
                title: "Broadcast sent",
                description: "Your message has been sent to the selected audience.",
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
                description: "Failed to send broadcast. Please try again.",
                variant: "destructive",
            });
        },
    });
    var handleSubmit = function (e) {
        e.preventDefault();
        if (!subject.trim()) {
            toast({
                title: "Validation Error",
                description: "Please enter a subject.",
                variant: "destructive",
            });
            return;
        }
        if (!(editor === null || editor === void 0 ? void 0 : editor.getText().trim())) {
            toast({
                title: "Validation Error",
                description: "Please enter a message.",
                variant: "destructive",
            });
            return;
        }
        var htmlContent = (editor === null || editor === void 0 ? void 0 : editor.getHTML()) || "";
        sendBroadcast.mutate({ subject: subject.trim(), message: htmlContent, visibility: visibility });
    };
    return (<DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Broadcast Message</h1>

        <Card className="p-4 sm:p-6 border">
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary"/>
              </div>
              <div>
                <h2 className="font-semibold text-base sm:text-lg">Send System-Wide Update</h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Communicate important updates with rich formatting
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visibility">Audience *</Label>
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger data-testid="select-visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone (All users)</SelectItem>
                  <SelectItem value="tutors">Tutors Only</SelectItem>
                  <SelectItem value="tds">Territory Directors Only</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                  <SelectItem value="students">Students Only</SelectItem>
                  <SelectItem value="affiliates">Affiliates Only</SelectItem>
                  <SelectItem value="od">Outreach Directors Only</SelectItem>
                  <SelectItem value="hr">HR Only</SelectItem>
                  <SelectItem value="ceo">CEO Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <input id="subject" type="text" placeholder="Enter broadcast subject..." value={subject} onChange={function (e) { return setSubject(e.target.value); }} className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" data-testid="input-subject"/>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message * (with formatting)</Label>
              <EditorToolbar editor={editor}/>
              <EditorContent editor={editor} data-testid="input-message"/>
              <p className="text-xs text-muted-foreground mt-2">
                This message will be visible to{" "}
                {visibility === "all"
            ? "all users"
            : visibility === "tutors"
                ? "all tutors"
                : visibility === "tds"
                    ? "all territory directors"
                    : visibility === "parents"
                        ? "all parents"
                        : visibility === "students"
                            ? "all students"
                            : visibility === "affiliates"
                                ? "all affiliates"
                                : visibility === "od"
                                    ? "all outreach directors"
                                    : visibility === "hr"
                                        ? "all HR staff"
                                        : visibility === "ceo"
                                            ? "the CEO"
                                            : "selected users"}
                .
              </p>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={sendBroadcast.isPending} data-testid="button-send-broadcast">
              <Send className="w-4 h-4"/>
              {sendBroadcast.isPending ? "Sending..." : "Send Broadcast"}
            </Button>
          </form>
        </Card>
      </div>
    </DashboardLayout>);
}
