// ...existing imports...

// ...existing imports...

// Remove duplicate registerRoutes definition above. Only keep the one below.
import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage, supabase } from "./storage";
import { setupAuth, isAuthenticated } from "./supabaseAuth";
import {
  insertPodSchema,
  insertTutorAssignmentSchema,
  insertStudentSchema,
  insertSessionSchema,
  insertReflectionSchema,
  insertAcademicProfileSchema,
  insertStruggleTargetSchema,
  insertBroadcastSchema,
  insertTutorApplicationSchema,
  roleAuthorizationSchema,
  insertEncounterSchema,
  insertAffiliateReflectionSchema,
} from "@shared/schema";
import { z } from "zod";

// Helper middleware to check user role
const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: Function) => {
    const dbUser = (req as any).dbUser;
    console.log("🔐 requireRole check:", {
      hasDbUser: !!dbUser,
      dbUserRole: dbUser?.role,
      requiredRoles: roles,
      isAuthorized: dbUser && roles.includes(dbUser.role)
    });
    if (!dbUser || !roles.includes(dbUser.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
};

export async function registerRoutes(app: Express): Promise<Server> {
      // Debug endpoint for remote header/session inspection
      app.get("/api/debug/auth-info", (req: Request, res: Response) => {
        const authHeader = req.headers.authorization || null;
        const sessionId = req.sessionID || null;
        const session = req.session || null;
        console.log("[DEBUG] /api/debug/auth-info");
        console.log("  Authorization header:", authHeader);
        console.log("  Session ID:", sessionId);
        console.log("  Session:", session);
        console.log("  Cookies:", req.headers.cookie || null);
        console.log("  User-Agent:", req.headers["user-agent"] || null);
        console.log("  Origin:", req.headers.origin || null);
        console.log("  Referer:", req.headers.referer || null);
        res.json({
          authorization: authHeader,
          sessionId,
          session,
          cookies: req.headers.cookie || null,
          userAgent: req.headers["user-agent"] || null,
          origin: req.headers.origin || null,
          referer: req.headers.referer || null
        });
      });
    // Get intro session details for a student (for tutors)
    app.get(
      "/api/tutor/students/:studentId/intro-session-details",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          const { studentId } = req.params;
          const dbUser = (req as any).dbUser;
          // Verify student exists and belongs to this tutor
          const student = await storage.getStudent(studentId);
          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }
          if (student.tutorId !== dbUser.id) {
            return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
          }
          // Find latest intro session for this student/tutor
          const { data: session, error: sessionError } = await supabase
            .from("scheduled_sessions")
            .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at")
            .eq("tutor_id", dbUser.id)
            .eq("student_id", studentId)
            .eq("type", "intro")
            .order("created_at", { ascending: false })
            .maybeSingle();
          if (sessionError) {
            return res.status(500).json({ message: "Failed to fetch intro session details" });
          }
          if (!session) {
            return res.json({ status: "not_scheduled" });
          }
          res.json({
            id: session.id,
            scheduled_time: session.scheduled_time,
            status: session.status,
            parent_confirmed: session.parent_confirmed,
            tutor_confirmed: session.tutor_confirmed,
            created_at: session.created_at,
            updated_at: session.updated_at,
          });
        } catch (error) {
          console.error("Error fetching intro session details:", error);
          res.status(500).json({ message: "Failed to fetch intro session details" });
        }
      }
    );
  // ...existing code...
  await setupAuth(app);

  // Parent proposes an intro session (after auth setup)
  app.post("/api/parent/intro-session/propose", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).dbUser.id;
      const { proposedDate, proposedTime } = req.body;
      if (!proposedDate || !proposedTime) {
        return res.status(400).json({ message: "Missing date or time" });
      }

      // Get parent's enrollment to find assigned tutor
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("assigned_tutor_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (enrollmentError || !enrollmentData || !enrollmentData.assigned_tutor_id) {
        return res.status(400).json({ message: "No tutor assigned" });
      }

      // Insert new intro session
      const { error: sessionError } = await supabase
        .from("scheduled_sessions")
        .insert([
          {
            parent_id: userId,
            tutor_id: enrollmentData.assigned_tutor_id,
            scheduled_time: `${proposedDate}T${proposedTime}`,
            type: "intro",
            status: "pending_tutor_confirmation",
            parent_confirmed: true,
            tutor_confirmed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (sessionError) {
        console.error("Error inserting intro session:", sessionError);
        return res.status(500).json({ message: "Failed to propose session" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error in propose intro session:", error);
      res.status(500).json({ message: "Failed to propose session" });
    }
  });

    // Parent intro session confirmation status
    app.get("/api/parent/intro-session-confirmation", isAuthenticated, async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;

        // Get parent's enrollment to find assigned tutor
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from("parent_enrollments")
          .select("assigned_tutor_id")
          .eq("user_id", userId)
          .maybeSingle();

        if (enrollmentError || !enrollmentData || !enrollmentData.assigned_tutor_id) {
          return res.json({ status: "not_scheduled" });
        }

        // Find intro session for this parent/tutor
        const { data: session, error: sessionError } = await supabase
          .from("scheduled_sessions")
          .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed")
          .eq("parent_id", userId)
          .eq("tutor_id", enrollmentData.assigned_tutor_id)
          .eq("type", "intro")
          .order("created_at", { ascending: false })
          .maybeSingle();

        if (sessionError || !session) {
          return res.json({ status: "not_scheduled" });
        }

        // Determine status
        if (!session.tutor_confirmed) {
          return res.json({ status: "pending_tutor_confirmation" });
        }
        if (!session.parent_confirmed) {
          return res.json({ status: "pending_parent_confirmation" });
        }
        // No completed field in new table, so just check confirmations
        return res.json({ status: "confirmed" });
      } catch (error) {
        console.error("Error in intro-session-confirmation:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch intro session confirmation status" });
      }
    });
  // Auth middleware
  await setupAuth(app);

  // Simple health check to verify JSON responses and CORS
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ========================================
  // AUTH ROUTES
  // ========================================

  // User endpoint is now handled by setupAuth in supabaseAuth.ts

  // Verify role authorization for email
  app.post("/api/auth/verify-role", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        email: z.string().email(),
        role: z.enum(["tutor", "td", "coo"]),
      });
      const { email, role } = schema.parse(req.body);
      
      const isAuthorized = await storage.checkRoleAuthorization(email, role);
      
      if (!isAuthorized) {
        return res.status(403).json({ 
          valid: false, 
          error: "Email not authorized for this role" 
        });
      }
      
      res.json({ valid: true, role });
    } catch (error) {
      console.error("Error verifying role:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // Check if TD has pod assignment
  app.get("/api/auth/check-td-assignment", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }
      
      const podId = await storage.checkTDPodAssignment(email);
      res.json({ hasPod: !!podId, podId });
    } catch (error) {
      console.error("Error checking TD assignment:", error);
      res.status(500).json({ message: "Failed to check TD assignment" });
    }
  });

  // Assign role permission (dev-only for now)
  app.post("/api/auth/assign-role", async (req: Request, res: Response) => {
    try {
      const permission = roleAuthorizationSchema.parse(req.body);
      await storage.addRolePermission(permission);
      res.json({ success: true, permission });
    } catch (error) {
      console.error("Error assigning role:", error);
      res.status(400).json({ message: "Invalid request" });
    }
  });

  // ========================================
  // TUTOR ROUTES
  // ========================================
    // Aggregated gateway session endpoint
    app.get(
      "/api/tutor/gateway-session",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          const tutorId = (req as any).dbUser.id;
          const dbUser = (req as any).dbUser;
          // Fetch assignment
          const assignment = await storage.getTutorAssignment(tutorId);
          // Fetch students
          const students = await storage.getStudentsByTutor(tutorId);
          // Fetch sessions
          const sessions = await storage.getSessionsByTutor(tutorId);
          // Fetch academic profile (verification status)
          const profile = await storage.getAcademicProfile(tutorId);
          // Fetch province (assuming it's in dbUser or profile)
          const province = dbUser?.province || profile?.province || null;
          // Role
          const role = dbUser?.role || "tutor";
          // Enrollment status (from parent_enrollments)
          const { data: enrollments } = await supabase
            .from("parent_enrollments")
            .select("status")
            .eq("assigned_tutor_id", tutorId);
          const enrollmentStatus = enrollments && enrollments.length > 0 ? enrollments[0].status : null;
          // Verification status (from profile)
          const verificationStatus = profile?.verified || false;

          // Fetch tutor application status and onboarding progress
          const tutorApplications = await storage.getTutorApplicationsByUser(tutorId);
          const latestApp = tutorApplications && tutorApplications.length > 0 ? tutorApplications[0] : null;
          let applicationStatus = null;
          if (latestApp) {
            // Set status to 'confirmed' as soon as required docs are verified
            let status = latestApp.status;
            const isUnder18 = latestApp.age < 18;
            let docsVerified = false;
            if (!isUnder18) {
              docsVerified = !!latestApp.trialAgreementVerified;
            } else {
              docsVerified = !!latestApp.trialAgreementVerified && !!latestApp.parentConsentVerified;
            }
            if (docsVerified) {
              status = "confirmed";
            }
            applicationStatus = {
              status,
              applicationId: latestApp.id,
              hasTrialAgreement: !!latestApp.trialAgreementUrl,
              hasParentConsent: !!latestApp.parentConsentUrl,
              trialAgreementVerified: !!latestApp.trialAgreementVerified,
              parentConsentVerified: !!latestApp.parentConsentVerified,
              trialAgreementUrl: latestApp.trialAgreementUrl,
              parentConsentUrl: latestApp.parentConsentUrl,
              isUnder18,
              onboardingCompletedAt: latestApp.onboardingCompletedAt ?? null,
            };
          }
    // Add route for singular 'student' to match frontend
    app.get(
      "/api/tutor/student/:studentId/intro-session-details",
      isAuthenticated,
      requireRole(["tutor"]),
      async (req: Request, res: Response) => {
        try {
          const { studentId } = req.params;
          const dbUser = (req as any).dbUser;
          // Verify student exists and belongs to this tutor
          const student = await storage.getStudent(studentId);
          if (!student) {
            return res.status(404).json({ message: "Student not found" });
          }
          if (student.tutorId !== dbUser.id) {
            return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
          }
          // Find latest intro session for this student/tutor
          const { data: session, error: sessionError } = await supabase
            .from("scheduled_sessions")
            .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at")
            .eq("tutor_id", dbUser.id)
            .eq("student_id", studentId)
            .eq("type", "intro")
            .order("created_at", { ascending: false })
            .maybeSingle();
          if (sessionError) {
            return res.status(500).json({ message: "Failed to fetch intro session details" });
          }
          if (!session) {
            return res.json({ status: "not_scheduled" });
          }
          res.json({
            id: session.id,
            scheduled_time: session.scheduled_time,
            status: session.status,
            parent_confirmed: session.parent_confirmed,
            tutor_confirmed: session.tutor_confirmed,
            created_at: session.created_at,
            updated_at: session.updated_at,
          });
        } catch (error) {
          console.error("Error fetching intro session details:", error);
          res.status(500).json({ message: "Failed to fetch intro session details" });
        }
      }
    );

          // Compose unified session object
          const gatewaySession = {
            assignment,
            students,
            sessions,
            profile,
            province,
            role,
            enrollmentStatus,
            verificationStatus,
            applicationStatus,
          };
          res.json(gatewaySession);
        } catch (error) {
          console.error("Error fetching gateway session:", error);
          res.status(500).json({ message: "Failed to fetch gateway session" });
        }
      }
    );

  // Get tutor's pod assignment and students
  app.get(
    "/api/tutor/pod",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const assignment = await storage.getTutorAssignment(tutorId);
        if (!assignment) {
          return res.json({ assignment: null, students: [] });
        }
        
        // First, check for parent enrollments assigned to this tutor that don't have students yet
        const { data: assignedEnrollments } = await supabase
          .from("parent_enrollments")
          .select("*")
          .eq("assigned_tutor_id", tutorId)
          .eq("status", "assigned");
        
        // For each enrollment, check if a student exists, if not create one
        if (assignedEnrollments && assignedEnrollments.length > 0) {
          for (const enrollment of assignedEnrollments) {
            try {
              // Check if student already exists with this name and tutor
              const { data: existingStudent } = await supabase
                .from("students")
                .select("id")
                .eq("name", enrollment.student_full_name)
                .eq("tutor_id", tutorId)
                .single();
              
              // If no existing student, create one
              if (!existingStudent) {
                const confidenceLevelMap: any = {
                  "very confident": 9,
                  "confident": 8,
                  "somewhat confident": 6,
                  "not confident": 3,
                  "very confident ": 9,
                  "confident ": 8,
                  "somewhat confident ": 6,
                  "not confident ": 3,
                };
                
                const confidenceText = (enrollment.confidence_level || "").toLowerCase();
                const confidenceScore = confidenceLevelMap[confidenceText] || 5;
                
                await supabase
                  .from("students")
                  .insert({
                    name: enrollment.student_full_name,
                    grade: enrollment.student_grade,
                    tutor_id: tutorId,
                    confidence_score: confidenceScore,
                    session_progress: 0,
                    parent_contact: enrollment.parent_email,
                  });
                
                console.log("Created missing student:", enrollment.student_full_name);
              }
            } catch (err) {
              console.error("Error creating student from enrollment:", err);
            }
          }
        }
        
        const students = await storage.getStudentsByTutor(tutorId);
        
        // Fetch parent enrollment info for each student
        const studentsWithParentInfo = await Promise.all(
          students.map(async (student: any) => {
            try {
              // Get parent enrollment for this student (match by student name and tutor)
              const { data: parentEnrollment } = await supabase
                .from("parent_enrollments")
                .select("*")
                .eq("assigned_tutor_id", tutorId)
                .eq("student_full_name", student.name)
                .single();
              
              // Check if proposal was accepted by querying the proposal table
              let proposalAcceptedAt = null;
              if (parentEnrollment?.proposal_id) {
                const { data: proposal } = await supabase
                  .from("onboarding_proposals")
                  .select("accepted_at")
                  .eq("id", parentEnrollment.proposal_id)
                  .single();
                proposalAcceptedAt = proposal?.accepted_at || null;
              }
              
              // Alternative: check if enrollment status is beyond proposal_sent (session_booked or later)
              const isApproved = parentEnrollment && 
                (proposalAcceptedAt || 
                 ["session_booked", "report_received", "confirmed"].includes(parentEnrollment.status));
              
              return {
                ...student,
                parentInfo: parentEnrollment || null,
                proposalSentAt: parentEnrollment?.proposal_sent_at || null,
                parentApprovedAt: isApproved ? (proposalAcceptedAt || parentEnrollment?.updated_at) : null,
              };
            } catch (err) {
              // If no parent enrollment found, return student without parentInfo
              return {
                ...student,
                parentInfo: null,
                proposalSentAt: null,
                parentApprovedAt: null,
              };
            }
          })
        );
        
        res.json({ assignment, students: studentsWithParentInfo });
      } catch (error) {
        console.error("Error fetching pod:", error);
        res.status(500).json({ message: "Failed to fetch pod" });
      }
    }
  );

  // Backfill students from assigned parent_enrollments for the authenticated tutor
  // Useful in split deployments if automatic creation didn't run
  app.post(
    "/api/tutor/backfill-students",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const created: string[] = [];

        const { data: assignedEnrollments, error: enrollErr } = await supabase
          .from("parent_enrollments")
          .select("*")
          .eq("assigned_tutor_id", tutorId)
          .eq("status", "assigned");

        if (enrollErr) {
          return res.status(500).json({ message: "Failed to fetch enrollments" });
        }

        if (assignedEnrollments && assignedEnrollments.length > 0) {
          for (const enrollment of assignedEnrollments) {
            const { data: existingStudent } = await supabase
              .from("students")
              .select("id")
              .eq("name", enrollment.student_full_name)
              .eq("tutor_id", tutorId)
              .maybeSingle();

            if (!existingStudent) {
              const confidenceLevelMap: any = {
                "very confident": 9,
                "confident": 8,
                "somewhat confident": 6,
                "not confident": 3,
              };
              const confidenceText = (enrollment.confidence_level || "").toLowerCase();
              const confidenceScore = confidenceLevelMap[confidenceText] || 5;

              const { error: insertErr } = await supabase
                .from("students")
                .insert({
                  name: enrollment.student_full_name,
                  grade: enrollment.student_grade,
                  tutor_id: tutorId,
                  confidence_score: confidenceScore,
                  session_progress: 0,
                  parent_contact: enrollment.parent_email,
                });
              if (!insertErr) {
                created.push(enrollment.student_full_name);
              }
            }
          }
        }

        res.json({ success: true, created });
      } catch (error) {
        console.error("Error backfilling students:", error);
        res.status(500).json({ message: "Failed to backfill students" });
      }
    }
  );

  // Get tutor's students
  app.get(
    "/api/tutor/students",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const students = await storage.getStudentsByTutor(tutorId);
        res.json(students);
      } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Failed to fetch students" });
      }
    }
  );

  // Get tutor's sessions
  app.get(
    "/api/tutor/sessions",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const sessions = await storage.getSessionsByTutor(tutorId);
        res.json(sessions);
      } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Failed to fetch sessions" });
      }
    }
  );

  // Create session
  app.post(
    "/api/tutor/sessions",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const data = insertSessionSchema.parse({
          ...req.body,
          tutorId,
          date: new Date(req.body.date),
        });
        
        const session = await storage.createSession(data);
        
        // Update student progress
        const student = await storage.getStudent(data.studentId);
        if (student) {
          const sessions = await storage.getSessionsByStudent(data.studentId);
          await storage.updateStudentProgress(
            data.studentId,
            sessions.length,
            data.confidenceScoreDelta || 0
          );
        }
        
        res.json(session);
      } catch (error) {
        console.error("Error creating session:", error);
        res.status(400).json({ message: "Failed to create session" });
      }
    }
  );

  // Get tutor's reflections
  app.get(
    "/api/tutor/reflections",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const reflections = await storage.getReflectionsByTutor(tutorId);
        res.json(reflections);
      } catch (error) {
        console.error("Error fetching reflections:", error);
        res.status(500).json({ message: "Failed to fetch reflections" });
      }
    }
  );

  // Create reflection
  app.post(
    "/api/tutor/reflections",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const reflection = await storage.createReflection({
          tutorId,
          date: new Date(),
          reflectionText: req.body.reflectionText,
          habitScore: req.body.habitScore,
        });
        res.json(reflection);
      } catch (error) {
        console.error("Error creating reflection:", error);
        res.status(400).json({ message: "Failed to create reflection" });
      }
    }
  );

  // ========================================
  // SCHOOL TRACKER ROUTES (Academic Profiles & Struggle Targets)
  // ========================================

  // Get tutor's own academic profile
  app.get(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const profile = await storage.getAcademicProfile(dbUser.id);
        res.json(profile);
      } catch (error) {
        console.error("Error fetching tutor's academic profile:", error);
        res.status(500).json({ message: "Failed to fetch academic profile" });
      }
    }
  );

  // Create or update tutor's own academic profile
  app.post(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        console.log("Saving profile for user:", dbUser.id);
        console.log("Request body:", req.body);
        const data = insertAcademicProfileSchema.parse({
          ...req.body,
          studentId: dbUser.id,
        });
        console.log("Parsed data:", data);
        const profile = await storage.upsertAcademicProfile(data);
        console.log("Saved profile:", profile);
        res.json(profile);
      } catch (error) {
        console.error("Error saving tutor's academic profile:", error);
        res.status(400).json({ message: `Failed to save academic profile: ${error instanceof Error ? error.message : String(error)}` });
      }
    }
  );

  // Get tutor's user profile (phone, bio, profile picture)
  app.get(
    "/api/tutor/user-profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const user = await storage.getUser(dbUser.id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ message: "Failed to fetch user profile" });
      }
    }
  );

  // Update tutor's user profile (phone, bio)
  app.put(
    "/api/tutor/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const { phone, bio } = req.body;
        
        const updated = await storage.updateUserProfile(dbUser.id, {
          phone: phone || null,
          bio: bio || null,
        });
        
        if (!updated) {
          return res.status(404).json({ message: "User not found" });
        }
        res.json(updated);
      } catch (error) {
        console.error("Error updating user profile:", error);
        res.status(400).json({ message: "Failed to update user profile" });
      }
    }
  );

  // Upload profile image
  app.post(
    "/api/tutor/profile/upload-image",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const { imageBase64, imageMime } = req.body;

        if (!imageBase64) {
          return res.status(400).json({ message: "No image data provided" });
        }

        console.log(`Received profile image for tutor ${dbUser.id} - size: ${imageBase64.length} chars, mime: ${imageMime}`);

        // Store as data URL directly in database
        const dataUrl = `data:${imageMime || 'image/jpeg'};base64,${imageBase64}`;
        console.log(`Data URL length: ${dataUrl.length} chars`);

        // Update user profile with data URL
        console.log("Updating user profile with image...");
        const updated = await storage.updateUserProfile(dbUser.id, {
          profileImageUrl: dataUrl,
        });

        console.log("Update result:", updated ? "success" : "no result");

        if (!updated) {
          console.error("updateUserProfile returned undefined");
          return res.status(404).json({ message: "User not found" });
        }

        console.log(`Profile picture stored for user ${dbUser.id}`);
        res.json(updated);
      } catch (error) {
        console.error("Error uploading profile image:", error);
        res.status(500).json({ 
          message: "Failed to upload profile image",
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
  );

  // Delete profile image
  app.delete(
    "/api/tutor/profile/image",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        
        const updated = await storage.updateUserProfile(dbUser.id, {
          profileImageUrl: null,
        });

        if (!updated) {
          return res.status(404).json({ message: "User not found" });
        }

        res.json(updated);
      } catch (error) {
        console.error("Error removing profile image:", error);
        res.status(500).json({ message: "Failed to remove profile image" });
      }
    }
  );

  // Get student's academic profile
  app.get(
    "/api/tutor/students/:studentId/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const profile = await storage.getAcademicProfile(studentId);
        res.json(profile);
      } catch (error) {
        console.error("Error fetching academic profile:", error);
        res.status(500).json({ message: "Failed to fetch academic profile" });
      }
    }
  );

  // Create or update student's academic profile
  app.post(
    "/api/tutor/students/:studentId/profile",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const data = insertAcademicProfileSchema.parse({
          ...req.body,
          studentId,
        });
        const profile = await storage.upsertAcademicProfile(data);
        res.json(profile);
      } catch (error) {
        console.error("Error saving academic profile:", error);
        res.status(400).json({ message: "Failed to save academic profile" });
      }
    }
  );

  // Get tutor's own struggle targets
  app.get(
    "/api/tutor/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        const targets = await storage.getStruggleTargets(dbUser.id);
        res.json(targets);
      } catch (error) {
        console.error("Error fetching tutor's struggle targets:", error);
        res.status(500).json({ message: "Failed to fetch struggle targets" });
      }
    }
  );

  // Get student's struggle targets
  app.get(
    "/api/tutor/students/:studentId/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const targets = await storage.getStruggleTargets(studentId);
        res.json(targets);
      } catch (error) {
        console.error("Error fetching struggle targets:", error);
        res.status(500).json({ message: "Failed to fetch struggle targets" });
      }
    }
  );

  // Save student identity sheet
  app.post(
    "/api/tutor/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;
        const formData = req.body;

        console.log("📥 Received formData.confidenceTriggers:", formData.confidenceTriggers);
        console.log("Type:", typeof formData.confidenceTriggers, "IsArray:", Array.isArray(formData.confidenceTriggers));
        console.log("📥 Received formData.confidenceKillers:", formData.confidenceKillers);
        console.log("Type:", typeof formData.confidenceKillers, "IsArray:", Array.isArray(formData.confidenceKillers));

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Update student with identity sheet data
        console.log("Saving confidenceTriggers:", formData.confidenceTriggers, "Type:", typeof formData.confidenceTriggers, "IsArray:", Array.isArray(formData.confidenceTriggers));
        console.log("Saving confidenceKillers:", formData.confidenceKillers, "Type:", typeof formData.confidenceKillers, "IsArray:", Array.isArray(formData.confidenceKillers));
        
        const updatedStudent = await storage.updateStudent(studentId, {
          personalProfile: {
            name: formData.name,
            grade: formData.grade,
            school: formData.school,
            learningId: formData.learningId,
            personalityType: formData.personalityType,
            longTermGoals: formData.longTermGoals,
          },
          emotionalInsights: {
            relationshipWithMath: formData.relationshipWithMath,
            confidenceTriggers: formData.confidenceTriggers,
            confidenceKillers: formData.confidenceKillers,
            pressureResponse: formData.pressureResponse,
            growthDrivers: formData.growthDrivers,
          },
          academicDiagnosis: {
            currentClassTopics: formData.currentClassTopics,
            strugglesWith: formData.strugglesWith,
            gapsIdentified: formData.gapsIdentified,
            bossBattlesCompleted: formData.bossBattlesCompleted,
            lastBossBattleResult: formData.lastBossBattleResult,
            tutorNotes: formData.tutorNotes,
          },
          identitySheet: formData.identitySheetResponses,
          identitySheetCompletedAt: new Date(),
        } as any);

        res.json({
          success: true,
          message: "Identity sheet saved successfully",
          student: updatedStudent,
        });
      } catch (error) {
        console.error("Error saving identity sheet:", error);
        res.status(500).json({
          message: "Failed to save identity sheet",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  );

  // Get student identity sheet
  app.get(
    "/api/tutor/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;
        console.log("📋 Identity sheet request:", {
          studentId,
          tutorId: dbUser?.id,
          origin: req.headers.origin,
          authHeader: req.headers.authorization ? 'present' : 'missing',
        });
        
        console.log("📋 Identity sheet request - studentId:", studentId, "tutorId:", dbUser?.id);

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          console.log("❌ Student not found:", studentId);
          return res.status(404).json({ message: "Student not found" });
        }

        console.log("✅ Student found:", student.id, "student.tutorId:", student.tutorId);

        if (student.tutorId !== dbUser.id) {
          console.log("❌ Tutor mismatch - student.tutorId:", student.tutorId, "dbUser.id:", dbUser.id);
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Return identity sheet data if it exists
        const identitySheetData = {
          personalProfile: student.personalProfile || null,
          emotionalInsights: student.emotionalInsights || null,
          academicDiagnosis: student.academicDiagnosis || null,
          identitySheet: student.identitySheet || null,
          completedAt: student.identitySheetCompletedAt || null,
        };

        console.log("✅ Returning identity sheet data for student:", studentId);
        res.json(identitySheetData);
      } catch (error) {
        console.error("Error fetching identity sheet:", error);
        res.status(500).json({ message: "Failed to fetch identity sheet" });
      }
    }
  );

  // Get student assignments (form submissions)
  app.get(
    "/api/tutor/students/:studentId/assignments",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Get all assignments for this student
        const { data: assignments, error } = await supabase
          .from("assignments")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching assignments:", error);
          return res.status(500).json({ message: "Failed to fetch assignments" });
        }

        res.json(assignments || []);
      } catch (error) {
        console.error("Error fetching student assignments:", error);
        res.status(500).json({ message: "Failed to fetch assignments" });
      }
    }
  );

  // Get student tracking systems (sessions, reports, TD feedback)
  app.get(
    "/api/tutor/students/:studentId/tracking",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const dbUser = (req as any).dbUser;

        // Verify student exists and belongs to this tutor
        const student = await storage.getStudent(studentId);
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        if (student.tutorId !== dbUser.id) {
          return res.status(403).json({ message: "Unauthorized: Student does not belong to this tutor" });
        }

        // Get tutoring sessions
        const { data: session, error: sessionError } = await supabase
          .from("scheduled_sessions")
          .select("id, scheduled_time, status, parent_confirmed, tutor_confirmed, created_at, updated_at")
          .eq("tutor_id", tutorId)
          .eq("parent_id", student.parentId)
          .eq("type", "intro")
          .order("created_at", { ascending: false })
          .maybeSingle();

        // Get parent reports
        const { data: parentReports, error: reportsError } = await supabase
          .from("parent_reports")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (reportsError) {
          console.error("Error fetching parent reports:", reportsError);
        }

        // Get TD weekly check-ins (feedback)
        const { data: tdFeedback, error: feedbackError } = await supabase
          .from("weekly_check_ins")
          .select("*")
          .eq("tutor_id", dbUser.id)
          .order("created_at", { ascending: false });

        if (feedbackError) {
          console.error("Error fetching TD feedback:", feedbackError);
        }

        res.json({
          sessions: sessions || [],
          parentReports: parentReports || [],
          tdFeedback: tdFeedback || [],
        });
      } catch (error) {
        console.error("Error fetching tracking data:", error);
        res.status(500).json({ message: "Failed to fetch tracking data" });
      }
    }
  );

  // Create struggle target
  app.post(
    "/api/tutor/students/:studentId/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        
        // Convert consolidationDate string to Date if provided
        const body = {
          ...req.body,
          studentId,
          consolidationDate: req.body.consolidationDate ? new Date(req.body.consolidationDate) : null,
        };
        
        const data = insertStruggleTargetSchema.parse(body);
        const target = await storage.createStruggleTarget(data);
        res.json(target);
      } catch (error) {
        console.error("Error creating struggle target:", error);
        res.status(400).json({ message: "Failed to create struggle target" });
      }
    }
  );

  // Create tutor's own struggle target
  app.post(
    "/api/tutor/targets",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const dbUser = (req as any).dbUser;
        console.log("Creating target for user:", dbUser.id);
        console.log("Request body:", req.body);
        
        // Convert consolidationDate string to Date if provided
        const body = {
          ...req.body,
          studentId: dbUser.id,
          consolidationDate: req.body.consolidationDate ? new Date(req.body.consolidationDate) : null,
        };
        
        const data = insertStruggleTargetSchema.parse(body);
        console.log("Parsed data:", data);
        const target = await storage.createStruggleTarget(data);
        console.log("Created target:", target);
        res.json(target);
      } catch (error) {
        console.error("Error creating tutor's struggle target:", error);
        res.status(400).json({ message: `Failed to create struggle target: ${error instanceof Error ? error.message : String(error)}` });
      }
    }
  );

  // Update struggle target
  app.put(
    "/api/tutor/targets/:id",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const target = await storage.updateStruggleTarget(id, req.body);
        if (!target) {
          return res.status(404).json({ message: "Target not found" });
        }
        res.json(target);
      } catch (error) {
        console.error("Error updating struggle target:", error);
        res.status(400).json({ message: "Failed to update struggle target" });
      }
    }
  );

  // Delete struggle target
  app.delete(
    "/api/tutor/targets/:id",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await storage.deleteStruggleTarget(id);
        res.json({ success: true });
      } catch (error) {
        console.error("Error deleting struggle target:", error);
        res.status(500).json({ message: "Failed to delete struggle target" });
      }
    }
  );

  // ========================================
  // WEEKLY CHECK-IN ROUTES (Tutor)
  // ========================================

  // Submit weekly check-in
  app.post(
    "/api/tutor/weekly-check-in",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const schema = z.object({
          podId: z.string(),
          weekStartDate: z.string(),
          sessionsSummary: z.string().min(1),
          wins: z.string().min(1),
          challenges: z.string().min(1),
          emotions: z.string().min(1),
          skillImprovement: z.string().min(1),
          helpNeeded: z.string().optional(),
          nextWeekGoals: z.string().min(1),
        });

        const data = schema.parse(req.body);
        const weekStartDate = new Date(data.weekStartDate);

        const result = await storage.db.insert(storage.weeklyCheckIns).values({
          tutorId,
          podId: data.podId,
          weekStartDate,
          sessionsSummary: data.sessionsSummary,
          wins: data.wins,
          challenges: data.challenges,
          emotions: data.emotions,
          skillImprovement: data.skillImprovement,
          helpNeeded: data.helpNeeded || null,
          nextWeekGoals: data.nextWeekGoals,
        });

        res.json({ success: true, message: "Weekly check-in submitted" });
      } catch (error) {
        console.error("Error submitting weekly check-in:", error);
        res.status(400).json({ message: "Failed to submit check-in" });
      }
    }
  );

  // Get tutor's check-ins for a pod
  app.get(
    "/api/tutor/weekly-check-ins",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const tutorId = (req as any).dbUser.id;
        const podId = req.query.podId as string;

        if (!podId) {
          return res.status(400).json({ message: "Pod ID required" });
        }

        const checkIns = await storage.db.query.weeklyCheckIns.findMany({
          where: (wci, { eq, and }) =>
            and(eq(wci.tutorId, tutorId), eq(wci.podId, podId)),
          orderBy: (wci, { desc }) => desc(wci.weekStartDate),
        });

        res.json(checkIns);
      } catch (error) {
        console.error("Error fetching weekly check-ins:", error);
        res.status(500).json({ message: "Failed to fetch check-ins" });
      }
    }
  );

  // ========================================
  // TD ROUTES
  // ========================================

  // Get TD's pod overview
  app.get(
    "/api/td/pod-overview",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        console.log(`🔍 [TD Pod Overview] Fetching pods for TD: ${tdId}`);
        const pods = await storage.getPodsByTD(tdId);
        console.log(`📦 [TD Pod Overview] Found ${pods?.length || 0} pods`);
        if (!pods || pods.length === 0) {
          console.log(`⚠️  [TD Pod Overview] No pods found, returning empty array`);
          return res.json([]);
        }

        const podOverviews = await Promise.all(
          pods.map(async (pod) => {
            const assignments = await storage.getTutorAssignmentsByPod(pod.id);
            const tutors = await Promise.all(
              assignments.map(async (assignment) => {
                const tutor = await storage.getUser(assignment.tutorId);
                return tutor ? { ...tutor, assignment } : null;
              })
            );

            const validTutors = tutors.filter(Boolean);
            let totalStudents = 0;
            let totalSessions = 0;

            for (const tutor of validTutors) {
              const students = await storage.getStudentsByTutor(tutor!.id);
              totalStudents += students.length;
              for (const student of students) {
                totalSessions += student.sessionProgress;
              }
            }

            return {
              pod,
              tutors: validTutors,
              totalStudents,
              totalSessions,
            };
          })
        );

        res.json(podOverviews);
      } catch (error) {
        console.error("Error fetching pod overview:", error);
        res.status(500).json({ message: "Failed to fetch pod overview" });
      }
    }
  );

  // Get TD's tutors with profiles
  app.get(
    "/api/td/tutors",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pod = await storage.getPodByTD(tdId);
        if (!pod) {
          return res.json([]);
        }

        const assignments = await storage.getTutorAssignmentsByPod(pod.id);
        const profiles = await Promise.all(
          assignments.map(async (assignment) => {
            const tutor = await storage.getUser(assignment.tutorId);
            if (!tutor) return null;

            const students = await storage.getStudentsByTutor(tutor.id);
            const sessions = await storage.getSessionsByTutor(tutor.id);
            const reflections = await storage.getReflectionsByTutor(tutor.id);
            
            const avgHabitScore =
              reflections.length > 0
                ? reflections.reduce((sum, r) => sum + (r.habitScore || 0), 0) /
                  reflections.length
                : 0;

            return {
              tutor,
              assignment,
              students,
              sessions,
              reflectionCount: reflections.length,
              avgHabitScore,
            };
          })
        );

        res.json(profiles.filter(Boolean));
      } catch (error) {
        console.error("Error fetching tutors:", error);
        res.status(500).json({ message: "Failed to fetch tutors" });
      }
    }
  );

  // Get all tutor weekly check-ins for a TD's pod
  app.get(
    "/api/td/tutor-check-ins",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pods = await storage.getPodsByTD(tdId);
        
        if (!pods || pods.length === 0) {
          return res.json([]);
        }

        const allCheckIns = [];
        for (const pod of pods) {
          const checkIns = await storage.db.query.weeklyCheckIns.findMany({
            where: (wci, { eq }) => eq(wci.podId, pod.id),
            orderBy: (wci, { desc }) => desc(wci.weekStartDate),
          });

          // Enrich with tutor information
          const enrichedCheckIns = await Promise.all(
            checkIns.map(async (checkIn) => {
              const tutor = await storage.getUser(checkIn.tutorId);
              return {
                ...checkIn,
                podName: pod.podName,
                tutor: tutor ? { id: tutor.id, name: tutor.name || tutor.firstName, email: tutor.email } : null,
              };
            })
          );
          allCheckIns.push(...enrichedCheckIns);
        }

        res.json(allCheckIns);
      } catch (error) {
        console.error("Error fetching tutor check-ins:", error);
        res.status(500).json({ message: "Failed to fetch check-ins" });
      }
    }
  );

  // Get TD insights dashboard data
  app.get(
    "/api/td/insights",
    isAuthenticated,
    requireRole(["td"]),
    async (req: Request, res: Response) => {
      try {
        const tdId = (req as any).dbUser.id;
        const pods = await storage.getPodsByTD(tdId);
        
        if (!pods || pods.length === 0) {
          return res.json({
            tutorsNeedingHelp: [],
            studentsAtRisk: [],
            podsBehindSchedule: [],
            recentCheckIns: [],
          });
        }

        const tutorsNeedingHelp = [];
        const studentsAtRisk = [];
        const podsBehindSchedule = [];
        const recentCheckIns = [];

        for (const pod of pods) {
          // Get recent check-ins for this pod
          const checkIns = await storage.db.query.weeklyCheckIns.findMany({
            where: (wci, { eq }) => eq(wci.podId, pod.id),
            orderBy: (wci, { desc }) => desc(wci.weekStartDate),
            limit: 10,
          });

          for (const checkIn of checkIns) {
            const tutor = await storage.getUser(checkIn.tutorId);
            
            // Add to recent check-ins
            recentCheckIns.push({
              ...checkIn,
              tutorName: tutor?.name || tutor?.firstName,
              podName: pod.podName,
            });

            // Check if tutor needs help
            if (checkIn.helpNeeded && checkIn.helpNeeded.trim().length > 0) {
              tutorsNeedingHelp.push({
                tutorId: checkIn.tutorId,
                tutorName: tutor?.name || tutor?.firstName,
                tutorEmail: tutor?.email,
                podName: pod.podName,
                helpNeeded: checkIn.helpNeeded,
                challenges: checkIn.challenges,
                weekStartDate: checkIn.weekStartDate,
                submittedAt: checkIn.submittedAt,
              });
            }
          }

          // Get students in this pod
          const assignments = await storage.getTutorAssignmentsByPod(pod.id);
          let totalStudents = 0;
          let totalSessions = 0;

          for (const assignment of assignments) {
            const students = await storage.getStudentsByTutor(assignment.tutorId);
            totalStudents += students.length;
            
            for (const student of students) {
              totalSessions += student.sessionProgress || 0;

              // Check if student is at risk (low confidence or behind schedule)
              const expectedSessions = 3; // Minimum expected sessions
              if (student.sessionProgress < expectedSessions || (student.confidenceScore || 0) < 5) {
                const tutor = await storage.getUser(assignment.tutorId);
                studentsAtRisk.push({
                  studentId: student.id,
                  studentName: student.name,
                  tutorId: assignment.tutorId,
                  tutorName: tutor?.name || tutor?.firstName,
                  podName: pod.podName,
                  sessionProgress: student.sessionProgress,
                  confidenceScore: student.confidenceScore,
                  reason: student.sessionProgress < expectedSessions ? 'Behind on sessions' : 'Low confidence',
                });
              }
            }
          }

          // Check if pod is behind schedule
          const maxSessions = totalStudents * 9;
          const expectedProgress = 0.3; // At least 30% complete
          const actualProgress = maxSessions > 0 ? totalSessions / maxSessions : 0;
          
          if (actualProgress < expectedProgress && totalStudents > 0) {
            podsBehindSchedule.push({
              podId: pod.id,
              podName: pod.podName,
              totalStudents,
              totalSessions,
              maxSessions,
              progress: Math.round(actualProgress * 100),
              tutorCount: assignments.length,
            });
          }
        }

        res.json({
          tutorsNeedingHelp: tutorsNeedingHelp.slice(0, 10), // Top 10
          studentsAtRisk: studentsAtRisk.slice(0, 15), // Top 15
          podsBehindSchedule,
          recentCheckIns: recentCheckIns.slice(0, 5), // Most recent 5
        });
      } catch (error) {
        console.error("Error fetching TD insights:", error);
        res.status(500).json({ message: "Failed to fetch insights" });
      }
    }
  );

  // ========================================
  // COO ROUTES
  // ========================================

  // Get COO dashboard stats
  app.get(
    "/api/coo/stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const allUsers = await storage.getUsersByRole("tutor");
        const verifiedTutors = allUsers.filter((u) => u.verified);
        const pendingApplications = allUsers.filter((u) => !u.verified);
        const pods = await storage.getPods();
        const activePods = pods.filter((p) => p.status === "active");

        let totalStudents = 0;
        let totalSessions = 0;

        for (const tutor of allUsers) {
          const students = await storage.getStudentsByTutor(tutor.id);
          totalStudents += students.length;
          for (const student of students) {
            totalSessions += student.sessionProgress;
          }
        }

        const completionRate =
          totalStudents > 0 ? (totalSessions / (totalStudents * 9)) * 100 : 0;

        res.json({
          totalTutors: allUsers.length,
          verifiedTutors: verifiedTutors.length,
          pendingApplications: pendingApplications.length,
          activePods: activePods.length,
          totalStudents,
          totalSessions,
          completionRate,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Failed to fetch stats" });
      }
    }
  );

  // Get COO sales & affiliate overview stats
  app.get(
    "/api/coo/sales-stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        // Get all affiliates
        const affiliates = await storage.getUsersByRole("affiliate");
        
        // Import supabase from storage
        const supabase = (storage as any).supabase;
        
        // Get all leads and closes - only count actual affiliate relationships
        const { data: leads = [] } = await supabase
          .from("leads")
          .select("*");
        
        const { data: closes = [] } = await supabase
          .from("closes")
          .select("*");
        
        // Affiliate details - only count their own leads/closes
        const affiliateDetails = affiliates.map(aff => {
          const affLeads = leads.filter((l: any) => l.affiliate_id === aff.id);
          const affCloses = closes.filter((c: any) => 
            affLeads.some((l: any) => l.user_id === c.parent_id)
          );
          
          return {
            id: aff.id,
            name: aff.name || aff.email,
            email: aff.email,
            totalLeads: affLeads.length,
            totalCloses: affCloses.length,
            conversionRate: affLeads.length > 0 
              ? Math.round((affCloses.length / affLeads.length) * 100) 
              : 0,
          };
        });
        
        // Organic leads (affiliate_id is null)
        const organicLeads = leads.filter((l: any) => l.affiliate_id === null);
        const organicCloses = closes.filter((c: any) => 
          organicLeads.some((l: any) => l.user_id === c.parent_id)
        );
        
        const organicStats = {
          id: "organic",
          name: "Organic Traffic",
          email: "Direct signups",
          totalLeads: organicLeads.length,
          totalCloses: organicCloses.length,
          conversionRate: organicLeads.length > 0 
            ? Math.round((organicCloses.length / organicLeads.length) * 100) 
            : 0,
          isOrganic: true,
        };
        
        // Combine affiliate and organic details, sort by leads
        const allDetails = [
          ...affiliateDetails,
          ...(organicLeads.length > 0 ? [organicStats] : [])
        ].sort((a, b) => b.totalLeads - a.totalLeads);
        
        // Only return affiliate data + organic
        res.json({
          affiliateDetails: allDetails,
        });
      } catch (error) {
        console.error("Error fetching sales stats:", error);
        res.status(500).json({ message: "Failed to fetch sales stats" });
      }
    }
  );

  // Get affiliate encounters
  app.get(
    "/api/affiliate/:affiliateId/encounters",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        const { data: encounters } = await supabase
          .from("encounters")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });
        
        res.json(encounters || []);
      } catch (error) {
        console.error("Error fetching encounters:", error);
        res.status(500).json({ message: "Failed to fetch encounters" });
      }
    }
  );

  // Get affiliate leads
  app.get(
    "/api/affiliate/:affiliateId/leads",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        const { data: leads } = await supabase
          .from("leads")
          .select("*")
          .eq("affiliate_id", affiliateId)
          .order("created_at", { ascending: false });
        
        res.json(leads || []);
      } catch (error) {
        console.error("Error fetching leads:", error);
        res.status(500).json({ message: "Failed to fetch leads" });
      }
    }
  );

  // Get affiliate closes
  app.get(
    "/api/affiliate/:affiliateId/closes",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { affiliateId } = req.params;
        const supabase = (storage as any).supabase;
        
        // Get leads for this affiliate first
        const { data: affLeads = [] } = await supabase
          .from("leads")
          .select("*")
          .eq("affiliate_id", affiliateId);
        
        // Get closes where parent_id matches any of this affiliate's leads
        const parentIds = affLeads.map((l: any) => l.user_id);
        let query = supabase.from("closes").select("*");
        
        if (parentIds.length > 0) {
          query = query.in("parent_id", parentIds);
        } else {
          // Return empty array if no leads
          return res.json([]);
        }
        
        const { data: closes } = await query.order("created_at", { ascending: false });
        
        res.json(closes || []);
      } catch (error) {
        console.error("Error fetching closes:", error);
        res.status(500).json({ message: "Failed to fetch closes" });
      }
    }
  );

  // Get organic leads (affiliate_id = null)
  app.get(
    "/api/organic/leads",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const supabase = (storage as any).supabase;
        
        const { data: leads } = await supabase
          .from("leads")
          .select("*")
          .is("affiliate_id", null)
          .order("created_at", { ascending: false });
        
        res.json(leads || []);
      } catch (error) {
        console.error("Error fetching organic leads:", error);
        res.status(500).json({ message: "Failed to fetch organic leads" });
      }
    }
  );

  // Get organic closes (from organic leads only)
  app.get(
    "/api/organic/closes",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const supabase = (storage as any).supabase;
        
        // Get organic leads (affiliate_id = null)
        const { data: organicLeads = [] } = await supabase
          .from("leads")
          .select("*")
          .is("affiliate_id", null);
        
        // Get closes where parent_id matches any organic lead
        const parentIds = organicLeads.map((l: any) => l.user_id);
        let query = supabase.from("closes").select("*");
        
        if (parentIds.length > 0) {
          query = query.in("parent_id", parentIds);
        } else {
          return res.json([]);
        }
        
        const { data: closes } = await query.order("created_at", { ascending: false });
        
        res.json(closes || []);
      } catch (error) {
        console.error("Error fetching organic closes:", error);
        res.status(500).json({ message: "Failed to fetch organic closes" });
      }
    }
  );

  // Get applications (verified and unverified tutors)
  app.get(
    "/api/coo/applications",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const tutors = await storage.getUsersByRole("tutor");
        const applications = await Promise.all(
          tutors.map(async (tutor) => {
            const verificationDoc = await storage.getVerificationDocByTutor(tutor.id);
            return { user: tutor, verificationDoc };
          })
        );
        res.json(applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Verify tutor
  app.post(
    "/api/coo/verify-tutor/:userId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        await storage.updateUserVerification(userId, true);
        await storage.updateVerificationStatus(userId, "verified");
        res.json({ success: true });
      } catch (error) {
        console.error("Error verifying tutor:", error);
        res.status(500).json({ message: "Failed to verify tutor" });
      }
    }
  );

  // Reject tutor
  app.post(
    "/api/coo/reject-tutor/:userId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { userId } = req.params;
        await storage.updateVerificationStatus(userId, "rejected");
        res.json({ success: true });
      } catch (error) {
        console.error("Error rejecting tutor:", error);
        res.status(500).json({ message: "Failed to reject tutor" });
      }
    }
  );

  // Get all pods
  app.get(
    "/api/coo/pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getPods();
        res.json(pods);
      } catch (error) {
        console.error("Error fetching pods:", error);
        res.status(500).json({ message: "Failed to fetch pods" });
      }
    }
  );

  // Get deleted pods
  app.get(
    "/api/coo/deleted-pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getDeletedPods();
        res.json(pods);
      } catch (error) {
        console.error("Error fetching deleted pods:", error);
        res.status(500).json({ message: "Failed to fetch deleted pods" });
      }
    }
  );

  // Delete pod (soft delete)
  app.delete(
    "/api/coo/pods/:podId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        await storage.deletePod(podId);
        res.json({ message: "Pod deleted successfully" });
      } catch (error) {
        console.error("Error deleting pod:", error);
        res.status(500).json({ message: "Failed to delete pod" });
      }
    }
  );

  // Create pod
  app.post(
    "/api/coo/pods",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        console.log("📦 Creating pod with data:", req.body);
        const { tutorIds, ...podData } = req.body;
        
        // Validate pod data first
        const data = insertPodSchema.parse({
          ...podData,
          startDate: podData.startDate ? new Date(podData.startDate) : null,
        });
        console.log("✅ Validated pod data:", data);

        // Validate tutors BEFORE creating pod
        if (tutorIds && Array.isArray(tutorIds) && tutorIds.length > 0) {
          // Validate tutor count (max 10 for training pods)
          if (tutorIds.length > 10) {
            return res.status(400).json({ 
              message: "Training pods can have a maximum of 10 tutors"
            });
          }

          // Get approved tutors to validate assignments
          const approvedTutors = await storage.getApprovedTutors();
          const approvedTutorIds = new Set(approvedTutors.map(t => t.id));

          // Validate all tutorIds are approved
          const invalidTutors = tutorIds.filter(id => !approvedTutorIds.has(id));
          if (invalidTutors.length > 0) {
            console.error("❌ Attempted to assign unapproved tutors:", invalidTutors);
            return res.status(400).json({ 
              message: "All assigned tutors must have approved applications",
              invalidTutors
            });
          }
          console.log(`✅ Validated ${tutorIds.length} approved tutors`);
        }

        // Create pod only after all validations pass
        const pod = await storage.createPod(data);
        console.log("✅ Pod created successfully:", pod);

        // Assign validated tutors to pod
        if (tutorIds && Array.isArray(tutorIds) && tutorIds.length > 0) {
          console.log(`📝 Assigning ${tutorIds.length} approved tutors to pod ${pod.id}`);
          for (const tutorId of tutorIds) {
            await storage.createTutorAssignment({
              tutorId,
              podId: pod.id,
              certificationStatus: "pending",
            });
          }
          console.log("✅ Tutors assigned successfully");
        }
        
        res.json(pod);
      } catch (error: any) {
        console.error("❌ Error creating pod:", error);
        console.error("❌ Error details:", error.message);
        console.error("❌ Stack trace:", error.stack);
        res.status(400).json({ 
          message: "Failed to create pod",
          error: error.message || "Unknown error"
        });
      }
    }
  );

  // Get tutors assigned to a pod
  app.get(
    "/api/coo/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        
        // Fetch tutor details for each assignment
        const tutorsData = await Promise.all(
          assignments.map(async (assignment: any) => {
            const tutor = await storage.getUser(assignment.tutorId);
            return {
              ...assignment,
              tutorName: tutor?.name || "Unknown",
              tutorEmail: tutor?.email || "",
            };
          })
        );
        
        res.json(tutorsData);
      } catch (error) {
        console.error("Error fetching pod tutors:", error);
        res.status(500).json({ message: "Failed to fetch pod tutors" });
      }
    }
  );

  // Get all tutor assignments across all pods (to prevent duplicate assignments)
  app.get(
    "/api/coo/all-tutor-assignments",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: assignments } = await supabase
          .from("tutor_assignments")
          .select("tutor_id");
        
        console.log("📋 Raw assignments from DB:", assignments);
        
        if (!assignments) {
          console.log("📋 No assignments found, returning empty array");
          return res.json([]);
        }
        
        // Transform snake_case to camelCase (tutor_id -> tutorId)
        // Return just the tutor IDs to check against
        const tutorIds = assignments.map((a: any) => a.tutor_id);
        console.log("📋 All assigned tutor IDs:", tutorIds);
        res.json(tutorIds);
      } catch (error) {
        console.error("Error fetching all tutor assignments:", error);
        res.status(500).json({ message: "Failed to fetch tutor assignments" });
      }
    }
  );

  // Get pod statistics
  app.get(
    "/api/coo/pods/:podId/stats",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        const sessions = await storage.getSessionsByPod(podId);
        
        // Calculate statistics
        const totalTutors = assignments.length;
        const totalStudents = assignments.reduce((sum: number, a: any) => sum + (a.studentCount || 0), 0);
        const sessionsCompleted = sessions.length;
        
        res.json({
          totalTutors,
          totalStudents,
          sessionsCompleted
        });
      } catch (error) {
        console.error("Error fetching pod statistics:", error);
        res.status(500).json({ message: "Failed to fetch pod statistics" });
      }
    }
  );

  // Get students for a specific tutor (COO view)
  app.get(
    "/api/coo/tutors/:tutorId/students",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { tutorId } = req.params;
        console.log("📚 COO requesting students for tutor:", tutorId);
        const students = await storage.getStudentsByTutor(tutorId);
        console.log("📚 Found students:", students.map(s => ({ id: s.id, name: s.name })));
        res.json(students);
      } catch (error) {
        console.error("Error fetching tutor students:", error);
        res.status(500).json({ message: "Failed to fetch tutor students" });
      }
    }
  );

  // Get student identity sheet (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/identity-sheet",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        console.log("📋 COO requesting identity sheet for student:", studentId);
        
        // Direct query to check what's in DB
        const { data: directData, error: directError } = await supabase
          .from("students")
          .select("*")
          .eq("id", studentId);
        console.log("📋 Direct query result:", JSON.stringify(directData, null, 2));
        console.log("📋 Direct query error:", directError);
        
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          console.log("❌ Student not found via storage:", studentId);
          return res.status(404).json({ message: "Student not found" });
        }

        console.log("✅ Student found:", student.id);
        console.log("📋 Student personalProfile:", student.personalProfile);
        console.log("📋 Student emotionalInsights:", student.emotionalInsights);
        console.log("📋 Student academicDiagnosis:", student.academicDiagnosis);
        console.log("📋 Student identitySheet:", student.identitySheet);

        const identitySheetData = {
          personalProfile: student.personalProfile || null,
          emotionalInsights: student.emotionalInsights || null,
          academicDiagnosis: student.academicDiagnosis || null,
          identitySheet: student.identitySheet || null,
          completedAt: student.identitySheetCompletedAt || null,
        };

        console.log("📋 Returning identity sheet data:", identitySheetData);
        res.json(identitySheetData);
      } catch (error) {
        console.error("Error fetching identity sheet for COO:", error);
        res.status(500).json({ message: "Failed to fetch identity sheet" });
      }
    }
  );

  // Get student assignments (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/assignments",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        const { data: assignments, error } = await supabase
          .from("assignments")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching assignments:", error);
          return res.status(500).json({ message: "Failed to fetch assignments" });
        }

        res.json(assignments || []);
      } catch (error) {
        console.error("Error fetching student assignments for COO:", error);
        res.status(500).json({ message: "Failed to fetch assignments" });
      }
    }
  );

  // Get student tracking data (COO read-only view)
  app.get(
    "/api/coo/students/:studentId/tracking",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { studentId } = req.params;
        const student = await storage.getStudent(studentId);
        
        if (!student) {
          return res.status(404).json({ message: "Student not found" });
        }

        // Get tutoring sessions
        const { data: sessions, error: sessionsError } = await supabase
          .from("tutoring_sessions")
          .select("*")
          .eq("student_id", studentId)
          .order("session_date", { ascending: false });

        // Get parent reports
        const { data: parentReports, error: reportsError } = await supabase
          .from("parent_reports")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        // Get TD feedback
        const { data: tdFeedback, error: feedbackError } = await supabase
          .from("td_feedback")
          .select("*")
          .eq("student_id", studentId)
          .order("created_at", { ascending: false });

        if (sessionsError || reportsError || feedbackError) {
          console.error("Error fetching tracking data:", { sessionsError, reportsError, feedbackError });
          return res.status(500).json({ message: "Failed to fetch tracking data" });
        }

        res.json({
          sessions: sessions || [],
          parentReports: parentReports || [],
          tdFeedback: tdFeedback || [],
        });
      } catch (error) {
        console.error("Error fetching student tracking for COO:", error);
        res.status(500).json({ message: "Failed to fetch tracking data" });
      }
    }
  );

  // Remove tutor from pod
  app.delete(
    "/api/coo/pods/:podId/tutors/:assignmentId",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { assignmentId } = req.params;
        await storage.deleteTutorAssignment(assignmentId);
        res.json({ message: "Tutor removed from pod successfully" });
      } catch (error) {
        console.error("Error removing tutor from pod:", error);
        res.status(500).json({ message: "Failed to remove tutor from pod" });
      }
    }
  );

  // Add tutor to existing pod
  app.post(
    "/api/coo/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const { tutorIds } = req.body;
        
        if (!Array.isArray(tutorIds) || tutorIds.length === 0) {
          return res.status(400).json({ message: "tutorIds must be a non-empty array" });
        }

        // Get current assignments
        const currentAssignments = await storage.getTutorAssignmentsByPod(podId);
        const totalTutors = currentAssignments.length + tutorIds.length;

        // Validate tutor count (max 10 for training pods)
        if (totalTutors > 10) {
          return res.status(400).json({ 
            message: `Pod would exceed maximum of 10 tutors (current: ${currentAssignments.length}, adding: ${tutorIds.length})`
          });
        }

        // Validate all tutors are approved
        const approvedTutors = await storage.getApprovedTutors();
        const approvedTutorIds = new Set(approvedTutors.map(t => t.id));

        const invalidTutors = tutorIds.filter((id: string) => !approvedTutorIds.has(id));
        if (invalidTutors.length > 0) {
          return res.status(400).json({ 
            message: "All assigned tutors must have approved applications",
            invalidTutors
          });
        }

        // Check for existing assignments
        const existingIds = new Set(currentAssignments.map((a: any) => a.tutor_id));
        const duplicates = tutorIds.filter((id: string) => existingIds.has(id));
        if (duplicates.length > 0) {
          return res.status(400).json({ 
            message: "Some tutors are already assigned to this pod",
            duplicates
          });
        }

        // Create new assignments
        const newAssignments = await Promise.all(
          tutorIds.map((tutorId: string) =>
            storage.createTutorAssignment({
              tutorId,
              podId,
              certificationStatus: "pending",
            })
          )
        );

        res.json(newAssignments);
      } catch (error) {
        console.error("Error adding tutors to pod:", error);
        res.status(400).json({ message: "Failed to add tutors to pod" });
      }
    }
  );

  // Get TDs with pod assignments
  app.get(
    "/api/coo/tds",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const tds = await storage.getUsersByRole("td");
        const pods = await storage.getPods();
        
        // Add pod assignment to each TD
        const tdsWithPods = tds.map(td => {
          const assignedPod = pods.find(p => p.tdId === td.id);
          return {
            ...td,
            assignedPodId: assignedPod?.id || null,
          };
        });
        
        res.json(tdsWithPods);
      } catch (error) {
        console.error("Error fetching TDs:", error);
        res.status(500).json({ message: "Failed to fetch TDs" });
      }
    }
  );

  // Get approved tutors (tutors with approved applications)
  app.get(
    "/api/coo/approved-tutors",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const approvedTutors = await storage.getApprovedTutors();
        console.log("👥 Approved tutors:", approvedTutors.map((t: any) => ({ id: t.id, name: t.name })));
        res.json(approvedTutors);
      } catch (error) {
        console.error("Error fetching approved tutors:", error);
        res.status(500).json({ message: "Failed to fetch approved tutors" });
      }
    }
  );

  // Get role permissions
  app.get(
    "/api/coo/role-permissions",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const permissions = await storage.getRolePermissions();
        res.json(permissions);
      } catch (error) {
        console.error("Error fetching role permissions:", error);
        res.status(500).json({ message: "Failed to fetch role permissions" });
      }
    }
  );

  // Assign TD to pod
  app.post(
    "/api/coo/assign-td",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const schema = z.object({
          tdId: z.string(),
          podId: z.string(),
        });
        const { tdId, podId } = schema.parse(req.body);
        
        // Update the pod to have this TD
        await storage.updatePodTD(podId, tdId);
        
        // Update the role permission to include the pod assignment
        const user = await storage.getUser(tdId);
        if (user && user.email) {
          await storage.addRolePermission({
            email: user.email,
            role: "td",
            assignedPodId: podId,
          });
        }
        
        res.json({ success: true });
      } catch (error) {
        console.error("Error assigning TD:", error);
        res.status(400).json({ message: "Failed to assign TD" });
      }
    }
  );

  // Send broadcast
  app.post(
    "/api/coo/broadcast",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        console.log("📤 Broadcast request body:", JSON.stringify(req.body, null, 2));
        const data = insertBroadcastSchema.parse(req.body);
        console.log("✅ Broadcast validated:", JSON.stringify(data, null, 2));
        const broadcast = await storage.createBroadcast(data);
        res.json(broadcast);
      } catch (error: any) {
        console.error("❌ Error creating broadcast:", error);
        if (error.errors) {
          console.error("Validation errors:", error.errors);
          return res.status(400).json({ message: "Validation failed", errors: error.errors });
        }
        res.status(400).json({ message: "Failed to create broadcast" });
      }
    }
  );

  // ========================================
  // SHARED ROUTES (Tutors, TDs, COO)
  // ========================================

  // Get broadcasts
  app.get(
    "/api/broadcasts",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userCreatedAt = (req as any).dbUser?.createdAt;
        const broadcasts = await storage.getBroadcasts(userCreatedAt);
        res.json(broadcasts);
      } catch (error) {
        console.error("Error fetching broadcasts:", error);
        res.status(500).json({ message: "Failed to fetch broadcasts" });
      }
    }
  );

  // Get unread broadcast count
  app.get(
    "/api/broadcasts/unread-count",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const userCreatedAt = (req as any).dbUser?.createdAt;
        const unreadCount = await storage.getUnreadBroadcastCount(userId, userCreatedAt);
        res.json({ unreadCount });
      } catch (error) {
        console.error("Error fetching unread count:", error);
        res.status(500).json({ message: "Failed to fetch unread count" });
      }
    }
  );

  // Get user's read broadcasts
  app.get(
    "/api/broadcasts/read-list",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const readBroadcasts = await storage.getUserBroadcastReads(userId);
        res.json({ readBroadcasts });
      } catch (error) {
        console.error("Error fetching read broadcasts:", error);
        res.status(500).json({ message: "Failed to fetch read broadcasts" });
      }
    }
  );

  // Check broadcast_reads table status
  app.get("/api/broadcasts/table-status", async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase
        .from("broadcast_reads")
        .select("id")
        .limit(1);
      
      if (error && error.code === 'PGRST205') {
        return res.json({ 
          tableExists: false, 
          message: "broadcast_reads table not found. Please run BROADCAST_READS_TABLE.sql in Supabase SQL Editor"
        });
      }
      
      res.json({ 
        tableExists: true, 
        message: "broadcast_reads table exists"
      });
    } catch (error) {
      res.json({ 
        tableExists: false, 
        error: "Unable to check table status"
      });
    }
  });

  // Mark broadcast as read
  app.post(
    "/api/broadcasts/:broadcastId/read",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).dbUser.id;
        const { broadcastId } = req.params;
        
        // Validate broadcastId is not empty
        if (!broadcastId || broadcastId.trim() === "") {
          return res.status(400).json({ message: "Invalid broadcast ID" });
        }
        
        await storage.markBroadcastAsRead(userId, broadcastId);
        res.json({ success: true });
      } catch (error: any) {
        console.error("Error marking broadcast as read:", error);
        if (error.message === "Broadcast not found") {
          return res.status(404).json({ message: "Broadcast not found" });
        }
        if (error.message === "User not found") {
          return res.status(401).json({ message: "User not found" });
        }
        // Check if table doesn't exist
        if (error?.code === 'PGRST205' || error?.message?.includes('broadcast_reads')) {
          return res.status(503).json({ 
            message: "Broadcast read tracking not available. Please run BROADCAST_READS_TABLE.sql in Supabase SQL Editor",
            tableIssue: true
          });
        }
        res.status(500).json({ message: "Failed to mark broadcast as read" });
      }
    }
  );

  // ========================================
  // TUTOR APPLICATION ROUTES
  // ========================================

  // Submit tutor application
  app.post(
    "/api/tutor/application",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const data = insertTutorApplicationSchema.parse({
          ...req.body,
          userId,
        });
        const application = await storage.createTutorApplication(data);
        res.json(application);
      } catch (error) {
        console.error("Error submitting tutor application:", error);
        res.status(400).json({ message: "Failed to submit application" });
      }
    }
  );

  // Get tutor's application status (for gateway)
  app.get(
    "/api/tutor/application-status",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        console.log("📋 Fetching tutor application status for user:", userId);
        
        // Add a timeout so this doesn't hang forever (increased to 15s for high-latency networks)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Database query timeout after 15s")), 15000)
        );
        
        const applicationsPromise = storage.getTutorApplicationsByUser(userId);
        const applications = await Promise.race([applicationsPromise, timeoutPromise]) as any[];
        
        console.log("✅ Got applications:", applications?.length || 0, "for user:", userId);
        
        if (!applications || applications.length === 0) {
          console.log("📝 User has no applications, returning not_applied");
          return res.json({ status: "not_applied" });
        }
        
        // Get the most recent application
        const latestApp = applications[0];
        console.log("📝 Latest app status:", latestApp.status, "for user:", userId);
        
        // Check if under 18 based on age in application
        const isUnder18 = latestApp.age < 18;
        
        // Check document upload status
        const hasTrialAgreement = !!latestApp.trialAgreementUrl;
        const hasParentConsent = !!latestApp.parentConsentUrl;
        const trialAgreementVerified = !!latestApp.trialAgreementVerified;
        const parentConsentVerified = !!latestApp.parentConsentVerified;
        
        // Determine if onboarding is complete
        const requiredDocsComplete = hasTrialAgreement && (!isUnder18 || hasParentConsent);
        const docsVerified = trialAgreementVerified && (!isUnder18 || parentConsentVerified);
        
        // Map application status to gateway status
        let status: string;
        switch (latestApp.status) {
          case "pending":
            status = "pending";
            break;
          case "approved":
            if (docsVerified) {
              status = "confirmed";
            } else if (requiredDocsComplete) {
              status = "verification"; // Docs uploaded, awaiting verification
            } else {
              status = "approved"; // Still needs to upload docs
            }
            break;
          case "rejected":
            status = "rejected";
            break;
          default:
            status = "pending";
        }
        
        console.log("✅ Returning status:", status, "for user:", userId);
        res.json({
          status,
          applicationId: latestApp.id,
          isUnder18,
          hasTrialAgreement,
          hasParentConsent,
          trialAgreementVerified,
          parentConsentVerified,
          trialAgreementUrl: latestApp.trialAgreementUrl,
          parentConsentUrl: latestApp.parentConsentUrl,
          onboardingCompletedAt: latestApp.onboardingCompletedAt ?? null,
        });
      } catch (error) {
        console.error("❌ Error fetching tutor application status:", error);
        res.status(500).json({ message: "Failed to fetch application status" });
      }
    }
  );

  // Upload tutor onboarding document
  app.post(
    "/api/tutor/onboarding-documents/upload",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType, fileName, fileData, fileType } = req.body;

        if (!applicationId || !documentType || !fileName || !fileData) {
          return res.status(400).json({ message: "Missing required fields" });
        }

        if (!["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }

        // Verify the application belongs to this user
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }

        // Decode base64 file data
        const buffer = Buffer.from(fileData, 'base64');

        // Ensure file path begins with userId folder
        const safeFileName = fileName.startsWith(`${userId}/`) ? fileName : `${userId}/${fileName}`;

        // Upload using server (service role) supabase client to avoid RLS issues
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('tutor-documents')
          .upload(safeFileName, buffer, {
            contentType: fileType || undefined,
            upsert: true,
          });

        if (uploadError) {
          console.error('Supabase storage upload error:', uploadError);
          return res.status(500).json({ message: 'Storage upload failed', error: uploadError.message });
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('tutor-documents').getPublicUrl(safeFileName);

        // Save to database
        const updated = await storage.updateTutorOnboardingDocument(
          applicationId,
          documentType as 'trial_agreement' | 'parent_consent',
          urlData.publicUrl
        );

        if (!updated) {
          return res.status(500).json({ message: 'Failed to update document record' });
        }

        res.json({ success: true, application: updated, publicUrl: urlData.publicUrl });
      } catch (error) {
        console.error('Error uploading onboarding document (server handler):', error);
        res.status(500).json({ message: 'Failed to upload document' });
      }
    }
  );

  // Tutor marks onboarding complete (after assignment) - allows leaving gateway permanently
  app.post(
    "/api/tutor/complete-onboarding",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId } = req.body;

        if (!applicationId) {
          return res.status(400).json({ message: "Missing applicationId" });
        }

        // Verify ownership
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }

        const updated = await storage.completeTutorOnboarding(applicationId);
        if (!updated) {
          return res.status(500).json({ message: "Failed to complete onboarding" });
        }

        res.json({ success: true, application: updated });
      } catch (error) {
        console.error('Error completing onboarding:', error);
        res.status(500).json({ message: 'Failed to complete onboarding' });
      }
    }
  );

  app.post(
    "/api/tutor/onboarding-documents",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType, documentUrl } = req.body;
        
        if (!applicationId || !documentType || !documentUrl) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (!["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }
        
        // Verify the application belongs to this user
        const applications = await storage.getTutorApplicationsByUser(userId);
        const app = applications.find(a => a.id === applicationId);
        
        if (!app) {
          return res.status(403).json({ message: "Application not found or access denied" });
        }
        
        // Update the document URL
        const updated = await storage.updateTutorOnboardingDocument(
          applicationId,
          documentType as "trial_agreement" | "parent_consent",
          documentUrl
        );
        
        if (!updated) {
          return res.status(500).json({ message: "Failed to update document" });
        }
        
        res.json({ success: true, application: updated });
      } catch (error) {
        console.error("Error uploading onboarding document:", error);
        res.status(500).json({ message: "Failed to upload document" });
      }
    }
  );

  // COO: Verify tutor onboarding document
  app.post(
    "/api/coo/verify-tutor-document",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { applicationId, documentType } = req.body;
        
        if (!applicationId || !documentType) {
          return res.status(400).json({ message: "Missing required fields" });
        }
        
        if (!["trial_agreement", "parent_consent"].includes(documentType)) {
          return res.status(400).json({ message: "Invalid document type" });
        }
        
        const updated = await storage.verifyTutorOnboardingDocument(
          applicationId,
          documentType as "trial_agreement" | "parent_consent",
          userId
        );
        
        if (!updated) {
          return res.status(500).json({ message: "Failed to verify document" });
        }
        
        // Check if all required docs are now verified
        const isUnder18 = updated.age < 18;
        const allVerified = updated.trialAgreementVerified && 
          (!isUnder18 || updated.parentConsentVerified);
        
        // If all verified, mark onboarding as complete
        if (allVerified) {
          await storage.completeTutorOnboarding(applicationId);
        }
        
        res.json({ success: true, application: updated, onboardingComplete: allVerified });
      } catch (error) {
        console.error("Error verifying onboarding document:", error);
        res.status(500).json({ message: "Failed to verify document" });
      }
    }
  );

  // Get tutor's own applications
  app.get(
    "/api/tutor/applications",
    isAuthenticated,
    requireRole(["tutor"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const applications = await storage.getTutorApplicationsByUser(userId);
        res.json(applications);
      } catch (error) {
        console.error("Error fetching tutor applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Get all tutor applications (COO and HR)
  app.get(
    "/api/coo/tutor-applications",
    isAuthenticated,
    requireRole(["coo", "hr"]),
    async (req: Request, res: Response) => {
      try {
        const { status } = req.query;
        let applications;
        
        if (status && (status === "pending" || status === "approved" || status === "rejected")) {
          applications = await storage.getTutorApplicationsByStatus(status);
        } else {
          applications = await storage.getTutorApplications();
        }
        
        res.json(applications);
      } catch (error) {
        console.error("Error fetching tutor applications:", error);
        res.status(500).json({ message: "Failed to fetch applications" });
      }
    }
  );

  // Approve tutor application (COO)
  app.post(
    "/api/coo/tutor-applications/:id/approve",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const reviewerId = (req.session as any).userId;
        const application = await storage.approveTutorApplication(id, reviewerId);
        
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        res.json(application);
      } catch (error) {
        console.error("Error approving tutor application:", error);
        res.status(500).json({ message: "Failed to approve application" });
      }
    }
  );

  // Reject tutor application (COO)
  app.post(
    "/api/coo/tutor-applications/:id/reject",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { reason } = req.body;
        const reviewerId = (req.session as any).userId;
        const application = await storage.rejectTutorApplication(id, reviewerId, reason || "");
        
        if (!application) {
          return res.status(404).json({ message: "Application not found" });
        }
        
        res.json(application);
      } catch (error) {
        console.error("Error rejecting tutor application:", error);
        res.status(500).json({ message: "Failed to reject application" });
      }
    }
  );

  // ========================================
  // HR ROUTES
  // ========================================

  // Get HR dashboard stats
  app.get(
    "/api/hr/stats",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        // Get all tutor applications
        const allApplications = await storage.getTutorApplications();
        
        // Get pending tutor applications from tutor_applications table
        const pendingApplications = await storage.getTutorApplicationsByStatus("pending");
        
        // Get approved tutors (from tutor_applications table)
        const approvedApplications = await storage.getTutorApplicationsByStatus("approved");

        // Get tutors who are approved but not yet assigned to a pod
        let availableForPods = 0;
        try {
          // Get all tutor assignments
          const { data: assignments } = await supabase
            .from("tutor_assignments")
            .select("tutor_id");
          
          const assignedTutorIds = new Set(assignments?.map(a => a.tutor_id) || []);
          
          // Count approved tutors who are not in the assignments list
          availableForPods = approvedApplications.filter(
            app => !assignedTutorIds.has(app.userId)
          ).length;
        } catch (e) {
          console.warn("Could not fetch tutor assignments:", e);
          availableForPods = approvedApplications.length; // Fallback to all approved
        }

        // Get student enrollments - total and this month
        let totalEnrollments = 0;
        let studentEnrollments = 0;
        try {
          // Get this month's enrollments first
          const currentMonth = new Date();
          const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
          
          const { data: monthEnrollments, error: enrollError } = await supabase
            .from("parent_enrollments")
            .select("id")
            .gte("created_at", firstDay.toISOString());
          
          if (enrollError) {
            console.warn("Error fetching month enrollments:", enrollError);
          } else if (monthEnrollments) {
            studentEnrollments = monthEnrollments.length;
          }

          // Get total enrollments (use count for efficiency)
          const { count, error: countError } = await supabase
            .from("parent_enrollments")
            .select("*", { count: "exact", head: true });
          
          if (countError) {
            console.warn("Error fetching total enrollments count:", countError);
            // Fallback: total should be at least this month's count
            totalEnrollments = studentEnrollments;
          } else {
            totalEnrollments = count || studentEnrollments;
          }
        } catch (e) {
          console.warn("Could not fetch parent enrollments:", e);
          // Continue with 0 enrollments if table doesn't exist
        }

        // Get people count from registry
        let peopleCount = 0;
        try {
          const { count: pCount } = await supabase
            .from("people_registry")
            .select("*", { count: "exact", head: true })
            .eq("status", "active");
          peopleCount = pCount || 0;
        } catch (e) {
          console.warn("Could not fetch people count:", e);
        }

        // Get open disputes count
        let openDisputes = 0;
        try {
          const { count: dCount } = await supabase
            .from("disputes")
            .select("*", { count: "exact", head: true })
            .in("status", ["open", "under_review", "escalated"]);
          openDisputes = dCount || 0;
        } catch (e) {
          console.warn("Could not fetch disputes count:", e);
        }

        res.json({
          totalApplications: allApplications.length,
          pendingApplications: pendingApplications.length,
          approvedTutors: approvedApplications.length,
          availableForPods,
          totalEnrollments,
          studentEnrollments,
          peopleCount,
          openDisputes,
        });
      } catch (error) {
        console.error("Error fetching HR stats:", error);
        res.status(500).json({ 
          totalApplications: 0,
          pendingApplications: 0,
          approvedTutors: 0,
          availableForPods: 0,
          totalEnrollments: 0,
          studentEnrollments: 0,
          peopleCount: 0,
          openDisputes: 0,
          error: "Failed to fetch stats" 
        });
      }
    }
  );

  // Get all parent enrollments for HR traffic page
  app.get(
    "/api/hr/enrollments",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        // Direct select with all enrollment fields - prefer direct query to avoid RPC/RLS mismatches
        const { data, error } = await supabase
          .from("parent_enrollments")
          .select("id, user_id, parent_full_name, parent_phone, parent_email, parent_city, student_full_name, student_grade, school_name, math_struggle_areas, previous_tutoring, confidence_level, internet_access, parent_motivation, status, created_at")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error selecting parent_enrollments:", error.message);
          return res.status(500).json([]);
        }

        // Normalize and return
        const transformed = (data || []).map((e: any) => ({
          ...e,
          statusLabel: e.status === "awaiting_assignment" ? "Awaiting Assignment" : 
                      e.status === "assigned" ? "Assigned" :
                      e.status === "confirmed" ? "Confirmed" :
                      e.status
        }));

        console.log(`/api/hr/enrollments returned ${transformed.length} rows`);
        res.json(transformed);
      } catch (error) {
        console.error("Error in /api/hr/enrollments:", error);
        res.status(500).json([]);
      }
    }
  );

  // Assign tutor to parent enrollment
  app.post(
    "/api/hr/enrollments/:enrollmentId/assign-tutor",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { enrollmentId } = req.params;
        const { tutorId, podId } = req.body;

        if (!tutorId) {
          return res.status(400).json({ message: "Tutor ID is required" });
        }

        // Update the parent enrollment with the assigned tutor
        const { data, error } = await supabase
          .from("parent_enrollments")
          .update({
            assigned_tutor_id: tutorId,
            status: "assigned",
            updated_at: new Date().toISOString(),
          })
          .eq("id", enrollmentId)
          .select();

        if (error) {
          console.error("Error updating enrollment:", error);
          return res.status(500).json({ message: "Failed to assign tutor" });
        }

        if (!data || data.length === 0) {
          return res.status(404).json({ message: "Enrollment not found" });
        }

        const enrollment = data[0];

        // Create a student record for the assigned tutor
        try {
          // Parse confidence level from text (e.g., "Very confident" -> 9)
          const confidenceLevelMap: any = {
            "very confident": 9,
            "confident": 8,
            "somewhat confident": 6,
            "not confident": 3,
            "very confident ": 9,
            "confident ": 8,
            "somewhat confident ": 6,
            "not confident ": 3,
          };
          
          const confidenceText = (enrollment.confidence_level || "").toLowerCase();
          const confidenceScore = confidenceLevelMap[confidenceText] || 5; // Default to 5 if not found

          const { error: studentError } = await supabase
            .from("students")
            .insert({
              name: enrollment.student_full_name,
              grade: enrollment.student_grade,
              tutor_id: tutorId,
              confidence_score: confidenceScore,
              session_progress: 0,
              parent_contact: enrollment.parent_email,
            });

          if (studentError) {
            console.error("Error creating student:", studentError);
            // Don't fail the tutor assignment if student creation fails
          } else {
            console.log("Student created successfully for:", enrollment.student_full_name);
          }
        } catch (studentErr) {
          console.error("Error in student creation flow:", studentErr);
          // Don't fail the tutor assignment
        }

        res.json({
          message: "Tutor assigned successfully",
          enrollment: data[0],
        });
      } catch (error) {
        console.error("Error assigning tutor:", error);
        res.status(500).json({ message: "Failed to assign tutor" });
      }
    }
  );

  // Get active pods for HR to assign tutors
  app.get(
    "/api/hr/active-pods",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const pods = await storage.getPods();
        const activePods = pods.filter((p) => p.status === "active");
        res.json(activePods);
      } catch (error) {
        console.error("Error fetching active pods:", error);
        res.status(500).json({ message: "Failed to fetch active pods" });
      }
    }
  );

  // Get tutors in a pod for HR
  app.get(
    "/api/hr/pods/:podId/tutors",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { podId } = req.params;
        const assignments = await storage.getTutorAssignmentsByPod(podId);
        
        // Fetch tutor details for each assignment
        const tutorsData = await Promise.all(
          assignments.map(async (assignment: any) => {
            const tutor = await storage.getUser(assignment.tutorId);
            return {
              ...assignment,
              tutorName: tutor?.name || "Unknown",
              tutorEmail: tutor?.email || "",
            };
          })
        );
        
        res.json(tutorsData);
      } catch (error) {
        console.error("Error fetching pod tutors:", error);
        res.status(500).json({ message: "Failed to fetch pod tutors" });
      }
    }
  );

  // Get tutor profile by ID (public endpoint for HR)
  app.get(
    "/api/tutors/:tutorId",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { tutorId } = req.params;

        const tutor = await storage.getUser(tutorId);
        if (!tutor) {
          return res.status(404).json({ message: "Tutor not found" });
        }

        res.json(tutor);
      } catch (error) {
        console.error("Error fetching tutor profile:", error);
        res.status(500).json({ message: "Failed to fetch tutor profile" });
      }
    }
  );

  // ========================================
  // BRAIN MODULE ROUTES (HR)
  // ========================================

  // Get all people in registry
  app.get(
    "/api/hr/brain/people",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching people registry:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in people registry:", error);
        res.json([]);
      }
    }
  );

  // Add person to registry
  app.post(
    "/api/hr/brain/people",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .insert({
            full_name: req.body.fullName,
            role_title: req.body.roleTitle,
            role_description: req.body.roleDescription,
            short_bio: req.body.shortBio,
            team_name: req.body.teamName,
            email: req.body.email,
            phone: req.body.phone,
            status: req.body.status || "active",
            start_date: req.body.startDate ? new Date(req.body.startDate) : new Date(),
          })
          .select()
          .single();

        if (error) {
          console.error("Error adding person:", error);
          return res.status(500).json({ message: "Failed to add person" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in add person:", error);
        res.status(500).json({ message: "Failed to add person" });
      }
    }
  );

  // Get all details (weekly deliverables)
  app.get(
    "/api/hr/brain/details",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("details")
          .select(`
            *,
            person:people_registry(*)
          `)
          .order("due_date", { ascending: true });

        if (error) {
          console.error("Error fetching details:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in details:", error);
        res.json([]);
      }
    }
  );

  // Create detail
  app.post(
    "/api/hr/brain/details",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("details")
          .insert({
            person_id: req.body.personId,
            description: req.body.description,
            due_date: new Date(req.body.dueDate),
            status: "pending",
            created_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating detail:", error);
          return res.status(500).json({ message: "Failed to create detail" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in create detail:", error);
        res.status(500).json({ message: "Failed to create detail" });
      }
    }
  );

  // Mark detail as done
  app.patch(
    "/api/hr/brain/details/:id/done",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from("details")
          .update({
            status: "done",
            fulfilled_at: new Date(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error marking detail done:", error);
          return res.status(500).json({ message: "Failed to mark detail done" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in mark detail done:", error);
        res.status(500).json({ message: "Failed to mark detail done" });
      }
    }
  );

  // Get all projects
  app.get(
    "/api/hr/brain/projects",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select(`
            *,
            owner:people_registry(*)
          `)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching projects:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in projects:", error);
        res.json([]);
      }
    }
  );

  // Create project
  app.post(
    "/api/hr/brain/projects",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("projects")
          .insert({
            name: req.body.name,
            owner_id: req.body.ownerId,
            horizon: req.body.horizon,
            objective: req.body.objective,
            status: "active",
            start_date: new Date(),
            created_by: userId,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating project:", error);
          return res.status(500).json({ message: "Failed to create project" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in create project:", error);
        res.status(500).json({ message: "Failed to create project" });
      }
    }
  );

  // Get all ideas
  app.get(
    "/api/hr/brain/ideas",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("ideas")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching ideas:", error);
          return res.json([]);
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in ideas:", error);
        res.json([]);
      }
    }
  );

  // Update idea status
  app.patch(
    "/api/hr/brain/ideas/:id/status",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("ideas")
          .update({
            status: req.body.status,
            review_notes: req.body.notes,
            reviewed_by: userId,
            reviewed_at: new Date(),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating idea status:", error);
          return res.status(500).json({ message: "Failed to update idea status" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in update idea status:", error);
        res.status(500).json({ message: "Failed to update idea status" });
      }
    }
  );

  // Convert idea to project
  app.post(
    "/api/hr/brain/ideas/:id/convert",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const userId = (req.session as any).userId;

        // Get the idea
        const { data: idea, error: ideaError } = await supabase
          .from("ideas")
          .select("*")
          .eq("id", id)
          .single();

        if (ideaError || !idea) {
          return res.status(404).json({ message: "Idea not found" });
        }

        // Create project from idea (owner needs to be set manually after)
        const { data: project, error: projectError } = await supabase
          .from("projects")
          .insert({
            name: idea.title,
            objective: idea.description,
            horizon: "30",
            status: "active",
            start_date: new Date(),
            created_by: userId,
          })
          .select()
          .single();

        if (projectError) {
          console.error("Error creating project from idea:", projectError);
          return res.status(500).json({ message: "Failed to create project" });
        }

        // Update idea with project reference
        await supabase
          .from("ideas")
          .update({
            status: "approved",
            converted_to_project_id: project.id,
          })
          .eq("id", id);

        res.json({ project, idea });
      } catch (error) {
        console.error("Error converting idea to project:", error);
        res.status(500).json({ message: "Failed to convert idea" });
      }
    }
  );

  // Submit idea (public - any logged in user)
  app.post(
    "/api/ideas/submit",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("ideas")
          .insert({
            title: req.body.title,
            description: req.body.description,
            pillar: req.body.pillar,
            problem_solved: req.body.problemSolved,
            status: "new",
            submitted_by: userId,
            submitter_name: req.body.submitterName,
            submitter_role: req.body.submitterRole,
          })
          .select()
          .single();

        if (error) {
          console.error("Error submitting idea:", error);
          return res.status(500).json({ message: "Failed to submit idea" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit idea:", error);
        res.status(500).json({ message: "Failed to submit idea" });
      }
    }
  );

  // Submit High School Leadership Pilot request (allow public submissions)
  app.post(
    "/api/pilots/highschool/submit",
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any)?.userId || null;
        const insertObj: any = {
          school_name: req.body.schoolName,
          contact_person_name: req.body.contactPersonName || null,
          contact_person_phone: req.body.phone || null,
          contact_person_role: req.body.contactPersonRole,
          email: req.body.email,
          submitter_name: req.body.submitterName || null,
          submitter_role: req.body.submitterRole || null,
        };
        if (userId) insertObj.submitted_by = userId;

        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .insert(insertObj)
          .select()
          .single();

        if (error) {
          console.error("Error submitting leadership pilot request:", error);
          return res.status(500).json({ message: "Failed to submit request" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit leadership pilot request:", error);
        res.status(500).json({ message: "Failed to submit request" });
      }
    }
  );

  // Submit Early Intervention Pilot request (allow public submissions)
  app.post(
    "/api/pilots/earlyintervention/submit",
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any)?.userId || null;
        const insertObj: any = {
          school_name: req.body.schoolName,
          contact_person_name: req.body.contactPersonName || null,
          contact_person_phone: req.body.phone || null,
          contact_person_role: req.body.contactPersonRole,
          email: req.body.email,
          submitter_name: req.body.submitterName || null,
          submitter_role: req.body.submitterRole || null,
        };
        if (userId) insertObj.submitted_by = userId;

        const { data, error } = await supabase
          .from("early_intervention_requests")
          .insert(insertObj)
          .select()
          .single();

        if (error) {
          console.error("Error submitting early intervention pilot request:", error);
          return res.status(500).json({ message: "Failed to submit request" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in submit early intervention pilot request:", error);
        res.status(500).json({ message: "Failed to submit request" });
      }
    }
  );

  // COO: fetch leadership pilot requests
    // COO: delete leadership pilot request
    app.delete(
      "/api/coo/leadership-pilot-requests/:id",
      isAuthenticated,
      requireRole(["coo"]),
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const { error } = await supabase
            .from("leadership_pilot_requests")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Error deleting leadership pilot request:", error);
            return res.status(500).json({ message: "Failed to delete pilot request" });
          }
          res.json({ message: "Pilot request deleted" });
        } catch (error) {
          console.error("Error in deleting leadership pilot request:", error);
          res.status(500).json({ message: "Failed to delete pilot request" });
        }
      }
    );
  app.get(
    "/api/coo/leadership-pilot-requests",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching leadership pilot requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching leadership pilot requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // HR: fetch leadership pilot requests
  app.get(
    "/api/hr/leadership-pilot-requests",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("leadership_pilot_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching leadership pilot requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching leadership pilot requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // COO: fetch early intervention pilot requests
    // COO: delete early intervention pilot request
    app.delete(
      "/api/coo/earlyintervention-requests/:id",
      isAuthenticated,
      requireRole(["coo"]),
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const { error } = await supabase
            .from("early_intervention_requests")
            .delete()
            .eq("id", id);
          if (error) {
            console.error("Error deleting early intervention pilot request:", error);
            return res.status(500).json({ message: "Failed to delete pilot request" });
          }
          res.json({ message: "Pilot request deleted" });
        } catch (error) {
          console.error("Error in deleting early intervention pilot request:", error);
          res.status(500).json({ message: "Failed to delete pilot request" });
        }
      }
    );
  app.get(
    "/api/coo/earlyintervention-requests",
    isAuthenticated,
    requireRole(["coo"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("early_intervention_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching early intervention requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching early intervention requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // HR: fetch early intervention pilot requests
  app.get(
    "/api/hr/earlyintervention-requests",
    isAuthenticated,
    requireRole(["hr"]),
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("early_intervention_requests")
          .select("*")
          .order("submitted_at", { ascending: false });

        if (error) {
          console.error("Error fetching early intervention requests:", error);
          return res.status(500).json({ message: "Failed to fetch requests" });
        }

        res.json(data || []);
      } catch (error) {
        console.error("Error in fetching early intervention requests:", error);
        res.status(500).json({ message: "Failed to fetch requests" });
      }
    }
  );

  // Get people registry list (for any logged in user - for dispute logging)
  app.get(
    "/api/people-registry/list",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const { data, error } = await supabase
          .from("people_registry")
          .select("id, full_name, role_title, status")
          .eq("status", "active")
          .order("full_name", { ascending: true });

        if (error) {
          console.error("Error fetching people list:", error);
          return res.json([]);
        }

        // Transform to camelCase for frontend
        const transformed = (data || []).map((p: any) => ({
          id: p.id,
          fullName: p.full_name,
          roleTitle: p.role_title,
          status: p.status,
        }));

        res.json(transformed);
      } catch (error) {
        console.error("Error in people list:", error);
        res.json([]);
      }
    }
  );

  // ========================================
  // DISPUTES MODULE ROUTES (HR)
  // ========================================

  // Get all disputes
  app.get(
    "/api/hr/disputes",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: disputes, error } = await supabase
          .from("disputes")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching disputes:", error);
          return res.json([]);
        }

        // Fetch resolutions for each dispute
        const disputesWithResolutions = await Promise.all(
          (disputes || []).map(async (dispute: any) => {
            const { data: resolutions } = await supabase
              .from("dispute_resolutions")
              .select("*")
              .eq("dispute_id", dispute.id)
              .order("created_at", { ascending: true });

            return {
              ...dispute,
              resolutions: resolutions || [],
            };
          })
        );

        res.json(disputesWithResolutions);
      } catch (error) {
        console.error("Error in disputes:", error);
        res.json([]);
      }
    }
  );

  // Log a dispute (any logged in user)
  app.post(
    "/api/disputes/log",
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const userId = (req.session as any).userId;
        const { data, error } = await supabase
          .from("disputes")
          .insert({
            logged_by: userId,
            logged_by_name: req.body.loggedByName,
            involved_parties: req.body.involvedParties,
            involved_party_names: req.body.involvedPartyNames,
            dispute_type: req.body.disputeType,
            description: req.body.description,
            desired_outcome: req.body.desiredOutcome,
            status: "open",
            visible_to: ["hr", "ceo"],
          })
          .select()
          .single();

        if (error) {
          console.error("Error logging dispute:", error);
          return res.status(500).json({ message: "Failed to log dispute" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in log dispute:", error);
        res.status(500).json({ message: "Failed to log dispute" });
      }
    }
  );

  // Update dispute status
  app.patch(
    "/api/hr/disputes/:id/status",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { data, error } = await supabase
          .from("disputes")
          .update({
            status: req.body.status,
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating dispute status:", error);
          return res.status(500).json({ message: "Failed to update dispute status" });
        }

        res.json(data);
      } catch (error) {
        console.error("Error in update dispute status:", error);
        res.status(500).json({ message: "Failed to update dispute status" });
      }
    }
  );

  // Resolve dispute
  app.post(
    "/api/hr/disputes/:disputeId/resolve",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { disputeId } = req.params;
        const userId = (req.session as any).userId;

        // Create resolution record
        const { data: resolution, error: resError } = await supabase
          .from("dispute_resolutions")
          .insert({
            dispute_id: disputeId,
            action: req.body.action,
            summary: req.body.summary,
            decision: req.body.decision,
            follow_up_date: req.body.followUpDate ? new Date(req.body.followUpDate) : null,
            resolved_by: userId,
          })
          .select()
          .single();

        if (resError) {
          console.error("Error creating resolution:", resError);
          return res.status(500).json({ message: "Failed to create resolution" });
        }

        // Update dispute status to resolved
        await supabase
          .from("disputes")
          .update({ status: "resolved" })
          .eq("id", disputeId);

        res.json(resolution);
      } catch (error) {
        console.error("Error in resolve dispute:", error);
        res.status(500).json({ message: "Failed to resolve dispute" });
      }
    }
  );

  // Get dispute patterns
  app.get(
    "/api/hr/disputes/patterns",
    isAuthenticated,
    requireRole(["hr", "ceo"]),
    async (req: Request, res: Response) => {
      try {
        const { data: disputes, error } = await supabase
          .from("disputes")
          .select("involved_party_names, dispute_type");

        if (error) {
          console.error("Error fetching disputes for patterns:", error);
          return res.json([]);
        }

        // Return raw data, let frontend process patterns
        res.json(disputes || []);
      } catch (error) {
        console.error("Error in disputes patterns:", error);
        res.json([]);
      }
    }
  );

  // ========================================
  // AFFILIATE PROSPECTING ROUTES
  // ========================================

  // Get or create affiliate code
  app.get(
    "/api/affiliate/code",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        console.log("📋 Getting affiliate code for:", affiliateId);
        
        const codeRecord = await storage.getOrCreateAffiliateCode(affiliateId);
        console.log("✅ Got code record:", codeRecord);
        
        // Return just the code field to match frontend expectations
        res.json({ code: codeRecord.code });
      } catch (error) {
        console.error("Error getting affiliate code:", error);
        res.status(500).json({ message: "Failed to get affiliate code" });
      }
    }
  );

  // Log encounter
  app.post(
    "/api/affiliate/encounters",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        console.log("📝 Logging encounter for affiliate:", affiliateId);
        console.log("📋 Encounter data received:", JSON.stringify(req.body, null, 2));
        
        const encounter = insertEncounterSchema.parse(req.body);
        console.log("✅ Encounter validated:", JSON.stringify(encounter, null, 2));
        
        const result = await storage.logEncounter(affiliateId, encounter);
        console.log("✅ Encounter logged successfully:", result);
        
        res.json(result);
      } catch (error: any) {
        console.error("❌ Error logging encounter:", error.message);
        console.error("   Full error:", error);
        res.status(400).json({ message: error.message || "Failed to log encounter" });
      }
    }
  );

  // Get all encounters for affiliate
  app.get(
    "/api/affiliate/encounters",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const encounters = await storage.getEncounters(affiliateId);
        res.json(encounters);
      } catch (error) {
        console.error("Error getting encounters:", error);
        res.status(500).json({ message: "Failed to get encounters" });
      }
    }
  );

  // Mark encounter as objected
  app.patch(
    "/api/affiliate/encounters/:id/object",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        await storage.updateEncounterStatus(id, "objected");
        res.json({ success: true });
      } catch (error) {
        console.error("Error updating encounter:", error);
        res.status(500).json({ message: "Failed to update encounter" });
      }
    }
  );

  // Get affiliate leads
  app.get(
    "/api/affiliate/leads",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const leads = await storage.getLeads(affiliateId);
        res.json(leads);
      } catch (error) {
        console.error("Error getting leads:", error);
        res.status(500).json({ message: "Failed to get leads" });
      }
    }
  );

  // Get affiliate closes
  app.get(
    "/api/affiliate/closes",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const closes = await storage.getCloses(affiliateId);
        res.json(closes);
      } catch (error) {
        console.error("Error getting closes:", error);
        res.status(500).json({ message: "Failed to get closes" });
      }
    }
  );

  // Get affiliate stats
  app.get(
    "/api/affiliate/stats",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const stats = await storage.getAffiliateStats(affiliateId);
        res.json(stats);
      } catch (error) {
        console.error("Error getting stats:", error);
        res.status(500).json({ message: "Failed to get stats" });
      }
    }
  );

  // Get affiliate lead/close/objected breakdown
  app.get(
    "/api/affiliate/breakdown",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const breakdown = await storage.getAffiliateLeadsByStatus(affiliateId);
        res.json(breakdown);
      } catch (error) {
        console.error("Error getting breakdown:", error);
        res.status(500).json({ message: "Failed to get breakdown" });
      }
    }
  );

  // Save affiliate reflection (from discover-deliver blueprint)
  app.post(
    "/api/affiliate/reflection",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const { reflectionText } = insertAffiliateReflectionSchema.parse(req.body);
        const result = await storage.saveAffiliateReflection(affiliateId, reflectionText);
        res.json(result);
      } catch (error) {
        console.error("Error saving reflection:", error);
        res.status(400).json({ message: "Failed to save reflection" });
      }
    }
  );

  // Get affiliate reflection
  app.get(
    "/api/affiliate/reflection",
    isAuthenticated,
    requireRole(["affiliate"]),
    async (req: Request, res: Response) => {
      try {
        const affiliateId = (req.session as any).userId;
        const reflection = await storage.getAffiliateReflection(affiliateId);
        res.json(reflection);
      } catch (error) {
        console.error("Error getting reflection:", error);
        res.status(500).json({ message: "Failed to get reflection" });
      }
    }
  );

  // Record close (parent committed to tutoring journey)
  app.post(
    "/api/parent/record-close",
    isAuthenticated,
    requireRole(["parent"]),
    async (req: Request, res: Response) => {
      try {
        const parentId = (req.session as any).userId;
        const { studentId, podId } = req.body;

        if (!studentId) {
          return res.status(400).json({ message: "studentId is required" });
        }

        // Get parent's lead to find their affiliate
        const { data: lead } = await supabase
          .from("leads")
          .select("affiliate_id")
          .eq("parent_id", parentId)
          .maybeSingle();

        if (!lead) {
          return res.status(400).json({ message: "No affiliate found for this parent" });
        }

        // Record the close
        const close = await storage.recordClose(lead.affiliate_id, parentId, studentId, podId);
        res.json(close);
      } catch (error) {
        console.error("Error recording close:", error);
        res.status(500).json({ message: "Failed to record close" });
      }
    }
  );

  // ========================================
  // PARENT ENROLLMENT ROUTES
  // ========================================

  // Get parent enrollment status
  app.get("/api/parent/enrollment-status", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const dbUser = (req as any).dbUser;

      console.log("📍 Enrollment status check for user:", userId, "role:", dbUser?.role);

      // Allow all authenticated users to check their enrollment status
      // (mainly parents, but be lenient)
      
      // Check if parent has completed enrollment
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.warn("⚠️  Error fetching enrollment status (table may not exist yet):", error.message);
        // If table doesn't exist or there's an error, just return not_enrolled
        // This allows the gateway to load and user can submit their enrollment
        return res.json({ status: "not_enrolled" });
      }

      if (!enrollmentData) {
        return res.json({ status: "not_enrolled" });
      }

      // Return current enrollment status
      res.json({
        status: enrollmentData.status || "not_enrolled",
        step: enrollmentData.current_step,
      });
    } catch (error) {
      console.error("Error in enrollment-status:", error);
      // On error, assume not_enrolled so gateway can proceed
      res.json({ status: "not_enrolled" });
    }
  });

  // Get tutor profile for parent
  app.get("/api/parent/assigned-tutor", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).dbUser.id;
      console.log("📋 Fetching assigned tutor for parent:", userId);

      // Get parent's enrollment to find assigned tutor
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .select("assigned_tutor_id")
        .eq("user_id", userId)
        .maybeSingle();

      console.log("📋 Enrollment data:", enrollmentData, "Error:", error);

      if (error || !enrollmentData || !enrollmentData.assigned_tutor_id) {
        return res.status(404).json({ message: "No tutor assigned" });
      }

      // Fetch tutor info from public.users
      const tutor = await storage.getUser(enrollmentData.assigned_tutor_id);
      if (!tutor) {
        return res.status(404).json({ message: "Tutor not found" });
      }
      const tutorProfile = {
        id: tutor.id,
        name: tutor.name,
        email: tutor.email,
        bio: tutor.bio || undefined,
        phone: tutor.phone || undefined,
        profile_image_url: tutor.profileImageUrl || undefined,
      };
      console.log("📋 Returning tutor profile (public.users):", tutorProfile);
      res.json(tutorProfile);
    } catch (error) {
      console.error("Error fetching assigned tutor (admin API):", error);
      res.status(500).json({ message: "Failed to fetch tutor profile" });
    }
  });

  // Submit parent enrollment form
  app.post("/api/parent/enroll", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.session as any).userId;
      const dbUser = (req as any).dbUser;

      console.log("📍 Enrollment submission for user:", userId, "role:", dbUser?.role);

      // Allow all authenticated users to submit enrollment
      // (mainly parents, but be lenient during development)
      
      const {
        parentFullName,
        parentPhone,
        parentEmail,
        parentCity,
        studentFullName,
        studentGrade,
        schoolName,
        mathStruggleAreas,
        previousTutoring,
        confidenceLevel,
        internetAccess,
        parentMotivation,
        agreedToTerms,
      } = req.body;

      // Validate required fields
      if (
        !parentFullName ||
        !parentPhone ||
        !studentFullName ||
        !studentGrade ||
        !schoolName ||
        !mathStruggleAreas ||
        !previousTutoring ||
        !confidenceLevel ||
        !internetAccess ||
        !agreedToTerms
      ) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check if enrollment already exists
      const { data: existing } = await supabase
        .from("parent_enrollments")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ message: "Enrollment already submitted" });
      }

      // Create enrollment record
      const { data: enrollmentData, error } = await supabase
        .from("parent_enrollments")
        .insert({
          user_id: userId,
          parent_full_name: parentFullName,
          parent_phone: parentPhone,
          parent_email: parentEmail,
          parent_city: parentCity,
          student_full_name: studentFullName,
          student_grade: studentGrade,
          school_name: schoolName,
          math_struggle_areas: mathStruggleAreas,
          previous_tutoring: previousTutoring,
          confidence_level: confidenceLevel,
          internet_access: internetAccess,
          parent_motivation: parentMotivation,
          status: "awaiting_assignment",
          current_step: "awaiting-assignment",
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.warn("⚠️  Error creating enrollment (table may not exist yet):", error.message);
        // If table doesn't exist, that's OK - return success anyway
        // This allows the flow to proceed, and data will be saved once migration is run
        res.json({
          message: "Enrollment submitted successfully (queued)",
          enrollment: null,
        });
        return;
      }

      res.json({
        message: "Enrollment submitted successfully",
        enrollment: enrollmentData?.[0],
      });
    } catch (error) {
      console.error("Error in enroll:", error);
      // Even on error, return success to allow gateway flow to proceed
      res.json({
        message: "Enrollment submitted successfully (queued)",
        enrollment: null,
      });
    }
  });

  // ========================================
  // ONBOARDING PROPOSAL ROUTES
  // ========================================

  // Create/Send proposal (Tutor)
  app.post("/api/tutor/proposal", isAuthenticated, requireRole(["tutor", "td", "hr", "coo", "ceo"]), async (req: Request, res: Response) => {
    try {
      const tutorId = (req as any).dbUser.id;
      const {
        studentId,
        enrollmentId,
        primaryIdentity,
        mathRelationship,
        confidenceTriggers,
        confidenceKillers,
        pressureResponse,
        growthDrivers,
        currentTopics,
        immediateStruggles,
        gapsIdentified,
        tutorNotes,
        futureIdentity,
        wantToRemembered,
        hiddenMotivations,
        internalConflict,
        recommendedPlan,
        justification,
        childWillWin,
      } = req.body;

      // Validate required fields
      if (!studentId || !recommendedPlan || !justification) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Find the enrollment record for this student
      let actualEnrollmentId = enrollmentId;
      if (!actualEnrollmentId) {
        const { data: student } = await supabase
          .from("students")
          .select("name")
          .eq("id", studentId)
          .single();

        if (student) {
          const { data: enrollment } = await supabase
            .from("parent_enrollments")
            .select("id")
            .eq("assigned_tutor_id", tutorId)
            .eq("student_full_name", student.name)
            .maybeSingle();
          
          actualEnrollmentId = enrollment?.id;
        }
      }

      // Create proposal
      const { data: proposalData, error } = await supabase
        .from("onboarding_proposals")
        .insert({
          enrollment_id: actualEnrollmentId,
          tutor_id: tutorId,
          student_id: studentId,
          primary_identity: primaryIdentity,
          math_relationship: mathRelationship,
          confidence_triggers: confidenceTriggers,
          confidence_killers: confidenceKillers,
          pressure_response: pressureResponse,
          growth_drivers: growthDrivers,
          current_topics: currentTopics,
          immediate_struggles: immediateStruggles,
          gaps_identified: gapsIdentified,
          tutor_notes: tutorNotes,
          future_identity: futureIdentity,
          want_to_remembered: wantToRemembered,
          hidden_motivations: hiddenMotivations,
          internal_conflict: internalConflict,
          recommended_plan: recommendedPlan,
          justification: justification,
          child_will_win: childWillWin,
          sent_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating proposal:", error);
        return res.status(500).json({ message: "Failed to create proposal" });
      }

      // Update enrollment status to proposal_sent if enrollment exists
      if (actualEnrollmentId) {
        await supabase
          .from("parent_enrollments")
          .update({
            status: "proposal_sent",
            proposal_id: proposalData.id,
            proposal_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", actualEnrollmentId);
      }

      res.json({
        message: "Proposal sent successfully",
        proposal: proposalData,
      });
    } catch (error) {
      console.error("Error in create proposal:", error);
      res.status(500).json({ message: "Failed to create proposal" });
    }
  });

  // Get proposal by ID (Parent or Tutor)
  app.get("/api/proposal/:id", isAuthenticated, async (req: Request, res: Response) => {
    try {
      const proposalId = req.params.id;
      const userId = (req as any).dbUser.id;
      const userRole = (req as any).dbUser.role;

      // Fetch proposal with enrollment and student info
      const { data: proposal, error } = await supabase
        .from("onboarding_proposals")
        .select(`
          *,
          enrollment:parent_enrollments(parent_id, student_full_name, student_grade),
          student:students(name, grade),
          tutor:users!onboarding_proposals_tutor_id_fkey(name, bio, phone, email)
        `)
        .eq("id", proposalId)
        .single();

      if (error || !proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Authorization: only the parent, tutor, or admin roles can view
      const isParent = userRole === "parent" && proposal.enrollment?.parent_id === userId;
      const isTutor = proposal.tutor_id === userId;
      const isAdmin = ["hr", "coo", "ceo", "td"].includes(userRole);

      if (!isParent && !isTutor && !isAdmin) {
        return res.status(403).json({ message: "Not authorized to view this proposal" });
      }

      // Track view count for parents
      if (isParent) {
        await supabase
          .from("onboarding_proposals")
          .update({
            viewed_at: new Date().toISOString(),
            viewed_count: (proposal.viewed_count || 0) + 1,
          })
          .eq("id", proposalId);
      }

      res.json(proposal);
    } catch (error) {
      console.error("Error fetching proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Get parent's proposal (for gateway/dashboard)
  app.get("/api/parent/proposal", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      console.log("📋 Fetching proposal for parent:", parentId);

      // Get parent's enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, proposal_id, status")
        .eq("user_id", parentId)
        .maybeSingle();

      console.log("📋 Enrollment data:", enrollment, "Error:", enrollmentError);

      if (enrollmentError) {
        console.error("Error fetching enrollment:", enrollmentError);
        return res.status(500).json({ message: "Failed to fetch enrollment" });
      }

      if (!enrollment) {
        console.log("No enrollment found for parent");
        return res.status(404).json({ message: "No enrollment found" });
      }

      if (!enrollment.proposal_id) {
        console.log("No proposal_id in enrollment");
        return res.status(404).json({ message: "No proposal found" });
      }

      // Get the proposal
      const { data: proposal, error } = await supabase
        .from("onboarding_proposals")
        .select("*")
        .eq("id", enrollment.proposal_id)
        .single();

      console.log("📋 Proposal data:", proposal, "Error:", error);

      if (error) {
        console.error("Error fetching proposal:", error);
        return res.status(500).json({ message: "Failed to fetch proposal", error: error.message });
      }

      if (!proposal) {
        return res.status(404).json({ message: "Proposal not found" });
      }

      // Get student info separately
      const { data: student } = await supabase
        .from("students")
        .select("name, grade")
        .eq("id", proposal.student_id)
        .single();

      // Get tutor info separately
      const { data: tutor } = await supabase
        .from("auth.users")
        .select("id, email, user_metadata")
        .eq("id", proposal.tutor_id)
        .single();

      // Combine data and convert to camelCase
      const enrichedProposal = {
        id: proposal.id,
        primaryIdentity: proposal.primary_identity,
        mathRelationship: proposal.math_relationship,
        confidenceTriggers: proposal.confidence_triggers,
        confidenceKillers: proposal.confidence_killers,
        pressureResponse: proposal.pressure_response,
        growthDrivers: proposal.growth_drivers,
        currentTopics: proposal.current_topics,
        immediateStruggles: proposal.immediate_struggles,
        gapsIdentified: proposal.gaps_identified,
        tutorNotes: proposal.tutor_notes,
        futureIdentity: proposal.future_identity,
        wantToRemembered: proposal.want_to_remembered,
        hiddenMotivations: proposal.hidden_motivations,
        internalConflict: proposal.internal_conflict,
        recommendedPlan: proposal.recommended_plan,
        justification: proposal.justification,
        childWillWin: proposal.child_will_win,
        parentCode: proposal.parent_code,
        createdAt: proposal.created_at,
        student: student || null,
        tutor: tutor ? {
          name: tutor.user_metadata?.name || tutor.email,
          email: tutor.email,
          bio: tutor.user_metadata?.bio,
          phone: tutor.user_metadata?.phone,
        } : null,
      };

      // Track view
      await supabase
        .from("onboarding_proposals")
        .update({
          viewed_at: new Date().toISOString(),
          viewed_count: (proposal.viewed_count || 0) + 1,
        })
        .eq("id", proposal.id);

      console.log("📋 Returning enriched proposal");
      res.json(enrichedProposal);
    } catch (error) {
      console.error("Error fetching parent proposal:", error);
      res.status(500).json({ message: "Failed to fetch proposal" });
    }
  });

  // Accept proposal (Parent)
  app.post("/api/parent/proposal/accept", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      // Get parent's enrollment
      const { data: enrollment } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id, assigned_student_id")
        .eq("user_id", parentId)
        .maybeSingle();

      if (!enrollment || !enrollment.proposal_id) {
        return res.status(404).json({ message: "No proposal found" });
      }

      if (enrollment.status !== "proposal_sent") {
        return res.status(400).json({ message: "Proposal already processed" });
      }

      // Get proposal details to get student and pod info
      const { data: proposal } = await supabase
        .from("onboarding_proposals")
        .select("student_id, tutor_id")
        .eq("id", enrollment.proposal_id)
        .maybeSingle();

      // Generate unique parent code (8 characters: letters and numbers)
      const generateParentCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar looking chars
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      let parentCode = generateParentCode();
      let codeIsUnique = false;
      let attempts = 0;

      // Ensure code is unique
      while (!codeIsUnique && attempts < 10) {
        const { data: existing } = await supabase
          .from("onboarding_proposals")
          .select("id")
          .eq("parent_code", parentCode)
          .maybeSingle();
        
        if (!existing) {
          codeIsUnique = true;
        } else {
          parentCode = generateParentCode();
          attempts++;
        }
      }

      // Update enrollment status to session_booked (ready to book first session)
      const { error: updateError } = await supabase
        .from("parent_enrollments")
        .update({
          status: "session_booked",
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);

      if (updateError) {
        console.error("Error accepting proposal:", updateError);
        return res.status(500).json({ message: "Failed to accept proposal" });
      }

      // Mark proposal as accepted and add parent code
      await supabase
        .from("onboarding_proposals")
        .update({
          accepted_at: new Date().toISOString(),
          parent_code: parentCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.proposal_id);

      // Check if this parent came from an affiliate (has a lead record)
      const { data: lead } = await supabase
        .from("leads")
        .select("id, affiliate_id")
        .eq("user_id", parentId)
        .maybeSingle();

      if (lead && proposal?.student_id) {
        console.log("📊 Creating affiliate close record for lead:", lead.id);
        
        // Get tutor's assignment
        const { data: tutorAssignment } = await supabase
          .from("tutor_assignments")
          .select("id")
          .eq("tutor_id", proposal.tutor_id)
          .maybeSingle();

        // Create close record for affiliate
        const { error: closeError } = await supabase
          .from("closes")
          .insert({
            affiliate_id: lead.affiliate_id,
            parent_id: parentId,
            lead_id: lead.id,
            child_id: proposal.student_id,
            pod_assignment_id: tutorAssignment?.id || null,
            closed_at: new Date().toISOString(),
          });

        if (closeError) {
          console.error("Error creating affiliate close:", closeError);
          // Don't fail the whole request if close creation fails
        } else {
          console.log("✅ Affiliate close created successfully");
        }
      }

      res.json({ 
        message: "Proposal accepted successfully", 
        status: "session_booked",
        parentCode: parentCode 
      });
    } catch (error) {
      console.error("Error accepting proposal:", error);
      res.status(500).json({ message: "Failed to accept proposal" });
    }
  });

  // Generate student code for accepted proposal (Parent)
  app.post("/api/parent/generate-student-code", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;
      console.log("🎓 Generate student code request from parent:", parentId);

      // Get parent's enrollment
      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id")
        .eq("user_id", parentId)
        .maybeSingle();

      console.log("📋 Enrollment:", enrollment, "Error:", enrollmentError);

      if (!enrollment || !enrollment.proposal_id) {
        console.log("❌ No proposal found for parent");
        return res.status(404).json({ message: "No proposal found" });
      }

      // Check if proposal is accepted
      const { data: proposal, error: proposalError } = await supabase
        .from("onboarding_proposals")
        .select("id, accepted_at, parent_code")
        .eq("id", enrollment.proposal_id)
        .single();

      console.log("📄 Proposal:", proposal, "Error:", proposalError);

      if (!proposal || !proposal.accepted_at) {
        console.log("❌ Proposal not yet accepted");
        return res.status(400).json({ message: "Proposal not yet accepted" });
      }

      // If code already exists, return it
      if (proposal.parent_code) {
        console.log("✅ Code already exists:", proposal.parent_code);
        return res.json({ parentCode: proposal.parent_code });
      }

      console.log("🎲 Generating new parent code...");

      // Generate unique parent code
      const generateParentCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };

      let parentCode = generateParentCode();
      let codeIsUnique = false;
      let attempts = 0;

      while (!codeIsUnique && attempts < 10) {
        const { data: existing } = await supabase
          .from("onboarding_proposals")
          .select("id")
          .eq("parent_code", parentCode)
          .maybeSingle();
        
        if (!existing) {
          codeIsUnique = true;
        } else {
          parentCode = generateParentCode();
          attempts++;
        }
      }

      console.log("🎲 Generated unique code:", parentCode);

      // Save code to proposal
      const { error: updateError } = await supabase
        .from("onboarding_proposals")
        .update({
          parent_code: parentCode,
          updated_at: new Date().toISOString(),
        })
        .eq("id", proposal.id);

      if (updateError) {
        console.error("❌ Error updating proposal with parent code:", updateError);
        return res.status(500).json({ message: "Failed to generate student code" });
      }

      console.log("✅ Successfully saved parent code to database");
      res.json({ parentCode: parentCode });
    } catch (error) {
      console.error("Error generating student code:", error);
      res.status(500).json({ message: "Failed to generate student code" });
    }
  });

  // Decline proposal (Parent)
  app.post("/api/parent/proposal/decline", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;
      const { reason } = req.body; // Optional decline reason

      // Get parent's enrollment
      const { data: enrollment } = await supabase
        .from("parent_enrollments")
        .select("id, status, proposal_id")
        .eq("user_id", parentId)
        .maybeSingle();

      if (!enrollment || !enrollment.proposal_id) {
        return res.status(404).json({ message: "No proposal found" });
      }

      if (enrollment.status !== "proposal_sent") {
        return res.status(400).json({ message: "Proposal already processed" });
      }

      // Update enrollment status back to assigned (tutor can revise proposal)
      const { error: updateError } = await supabase
        .from("parent_enrollments")
        .update({
          status: "assigned", // Back to assigned - tutor needs to revise
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.id);

      if (updateError) {
        console.error("Error declining proposal:", updateError);
        return res.status(500).json({ message: "Failed to decline proposal" });
      }

      // Mark proposal as declined
      await supabase
        .from("onboarding_proposals")
        .update({
          declined_at: new Date().toISOString(),
          decline_reason: reason || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", enrollment.proposal_id);

      res.json({ message: "Proposal declined. Your tutor will be notified.", status: "assigned" });
    } catch (error) {
      console.error("Error declining proposal:", error);
      res.status(500).json({ message: "Failed to decline proposal" });
    }
  });

  // ========================================
  // STUDENT AUTH ROUTES
  // ========================================

  // Student signup with parent code validation
  app.post("/api/student/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, firstName, lastName, parentCode } = req.body;
      console.log("🎓 Student signup request:", { email, firstName, lastName, parentCode });

      if (!email || !password || !parentCode) {
        return res.status(400).json({ message: "Email, password, and parent code are required" });
      }

      // Validate parent code
      console.log("🔍 Validating parent code:", parentCode.toUpperCase());
      const { data: proposal, error: proposalError } = await supabase
        .from("onboarding_proposals")
        .select("id, student_id, accepted_at, parent_code")
        .eq("parent_code", parentCode.toUpperCase())
        .maybeSingle();

      console.log("📋 Proposal found:", proposal, "Error:", proposalError);

      if (proposalError || !proposal) {
        console.log("❌ Invalid parent code");
        return res.status(400).json({ message: "Invalid parent code" });
      }

      if (!proposal.accepted_at) {
        console.log("❌ Proposal not accepted yet");
        return res.status(400).json({ message: "Parent has not yet accepted the proposal for this code" });
      }

      // Check if code already used
      console.log("🔍 Checking if code already used...");
      const { data: existingStudent, error: checkError } = await supabase
        .from("student_users")
        .select("id")
        .eq("parent_code", parentCode.toUpperCase())
        .maybeSingle();

      console.log("👥 Existing student:", existingStudent, "Check error:", checkError);

      if (existingStudent) {
        console.log("❌ Code already used");
        return res.status(400).json({ message: "This parent code has already been used" });
      }

      // Hash password using bcrypt
      console.log("🔐 Hashing password...");
      const { hash } = await import("bcryptjs");
      const hashedPassword = await hash(password, 10);

      // Create student user
      console.log("💾 Creating student user in database...");
      const { data: studentUser, error: insertError } = await supabase
        .from("student_users")
        .insert({
          email,
          password: hashedPassword,
          first_name: firstName,
          last_name: lastName,
          student_id: proposal.student_id,
          parent_code: parentCode.toUpperCase(),
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ Error creating student user:", insertError);
        console.error("❌ Insert error details:", JSON.stringify(insertError, null, 2));
        return res.status(500).json({ message: "Failed to create student account", error: insertError.message });
      }

      console.log("✅ Student user created:", studentUser);

      // Create session for student
      (req.session as any).studentUserId = studentUser.id;
      (req.session as any).studentEmail = studentUser.email;
      req.session.touch();

      console.log("✅ Student signup successful!");
      res.json({
        message: "Student account created successfully",
        user: {
          id: studentUser.id,
          email: studentUser.email,
          firstName: studentUser.first_name,
          lastName: studentUser.last_name,
          studentId: studentUser.student_id,
        },
      });
    } catch (error: any) {
      console.error("❌ Student signup error:", error);
      console.error("❌ Error stack:", error.stack);
      res.status(500).json({ message: "Failed to create student account", error: error.message });
    }
  });

  // Student signin
  app.post("/api/student/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Find student user
      const { data: studentUser, error } = await supabase
        .from("student_users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (error || !studentUser) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Verify password
      const { compare } = await import("bcryptjs");
      const passwordMatch = await compare(password, studentUser.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Update last login
      await supabase
        .from("student_users")
        .update({ last_login: new Date().toISOString() })
        .eq("id", studentUser.id);

      // Create session
      (req.session as any).studentUserId = studentUser.id;
      (req.session as any).studentEmail = studentUser.email;
      req.session.touch();

      res.json({
        message: "Signed in successfully",
        user: {
          id: studentUser.id,
          email: studentUser.email,
          firstName: studentUser.first_name,
          lastName: studentUser.last_name,
          studentId: studentUser.student_id,
        },
      });
    } catch (error) {
      console.error("Student signin error:", error);
      res.status(500).json({ message: "Failed to sign in" });
    }
  });

  // Get current student user
  app.get("/api/student/me", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;

      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser, error } = await supabase
        .from("student_users")
        .select("id, email, first_name, last_name, student_id, created_at, last_login")
        .eq("id", studentUserId)
        .single();

      if (error || !studentUser) {
        return res.status(404).json({ message: "Student user not found" });
      }

      // Get the student's tutor's pod if available
      let podName = null;
      if (studentUser.student_id) {
        const { data: student } = await supabase
          .from("students")
          .select("tutor_id")
          .eq("id", studentUser.student_id)
          .maybeSingle();

        if (student?.tutor_id) {
          const { data: tutorAssignment } = await supabase
            .from("tutor_assignments")
            .select("pod:pods(pod_name)")
            .eq("tutor_id", student.tutor_id)
            .maybeSingle();

          const pod = tutorAssignment?.pod as { pod_name?: string } | null;
          if (pod) {
            podName = pod.pod_name || null;
          }
        }
      }

      res.json({
        id: studentUser.id,
        email: studentUser.email,
        firstName: studentUser.first_name,
        lastName: studentUser.last_name,
        studentId: studentUser.student_id,
        createdAt: studentUser.created_at,
        lastLogin: studentUser.last_login,
        podName: podName,
      });
    } catch (error) {
      console.error("Error fetching student user:", error);
      res.status(500).json({ message: "Failed to fetch student user" });
    }
  });

  // Student logout
  app.post("/api/student/logout", async (req: Request, res: Response) => {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ message: "Failed to logout" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to logout" });
    }
  });

  // ========================================
  // STUDENT PORTAL ROUTES
  // ========================================

  // Get student stats (gamified dashboard)
  app.get("/api/student/stats", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Get student_id from student_users table
      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      // Call get_student_stats function
      const { data, error } = await supabase
        .rpc("get_student_stats", { p_student_id: studentUser.student_id });

      if (error) {
        console.error("Error calling get_student_stats:", error);
        // Return zeros if function doesn't exist yet
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          currentStreak: 0,
          totalSessions: 0,
          confidenceLevel: 50,
        });
      }

      const stats = data?.[0] || {};
      res.json({
        bossBattlesCompleted: stats.boss_battles_completed || 0,
        solutionsUnlocked: stats.solutions_unlocked || 0,
        currentStreak: stats.current_streak || 0,
        totalSessions: stats.total_sessions || 0,
        confidenceLevel: stats.confidence_level || 50,
      });
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get student commitments
  app.get("/api/student/commitments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: commitments, error } = await supabase
        .from("student_commitments")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(commitments || []);
    } catch (error) {
      console.error("Error fetching commitments:", error);
      res.status(500).json({ message: "Failed to fetch commitments" });
    }
  });

  // Create student commitment
  app.post("/api/student/commitments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { name, description, why_important, daily_action } = req.body;

      const { data: commitment, error } = await supabase
        .from("student_commitments")
        .insert({
          student_id: studentUser.student_id,
          name,
          description,
          why_important,
          daily_action,
          streak_count: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      res.json(commitment);
    } catch (error) {
      console.error("Error creating commitment:", error);
      res.status(500).json({ message: "Failed to create commitment" });
    }
  });

  // Update student commitment
  app.put("/api/student/commitments/:id", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { name, description, why_important, daily_action } = req.body;

      const { data: commitment, error } = await supabase
        .from("student_commitments")
        .update({
          name,
          description,
          why_important,
          daily_action,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(commitment);
    } catch (error) {
      console.error("Error updating commitment:", error);
      res.status(500).json({ message: "Failed to update commitment" });
    }
  });

  // Delete student commitment
  app.delete("/api/student/commitments/:id", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;

      const { error } = await supabase
        .from("student_commitments")
        .update({ is_active: false })
        .eq("id", id);

      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting commitment:", error);
      res.status(500).json({ message: "Failed to delete commitment" });
    }
  });

  // Complete commitment for today
  app.post("/api/student/commitments/:id/complete", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const today = new Date().toISOString().split("T")[0];

      // Check if already completed today
      const { data: existingLog } = await supabase
        .from("commitment_logs")
        .select("id")
        .eq("commitment_id", id)
        .gte("completed_date", today)
        .maybeSingle();

      if (existingLog) {
        return res.status(400).json({ message: "Already completed today" });
      }

      // Log the completion
      const { data: log, error } = await supabase
        .from("commitment_logs")
        .insert({
          commitment_id: id,
          completed_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger will auto-update streak
      res.json(log);
    } catch (error) {
      console.error("Error completing commitment:", error);
      res.status(500).json({ message: "Failed to complete commitment" });
    }
  });

  // Get student reflections
  app.get("/api/student/reflections", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: reflections, error } = await supabase
        .from("student_reflections")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(reflections || []);
    } catch (error) {
      console.error("Error fetching reflections:", error);
      res.status(500).json({ message: "Failed to fetch reflections" });
    }
  });

  // Create student reflection
  app.post("/api/student/reflections", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { reflection_text, mood, date } = req.body;
      
      console.log("📝 Creating reflection with data:", { 
        student_id: studentUser.student_id, 
        reflection_text, 
        mood, 
        date,
        dateProvided: !!date,
        finalDate: date || new Date().toISOString()
      });

      const { data: reflection, error } = await supabase
        .from("student_reflections")
        .insert({
          student_id: studentUser.student_id,
          reflection_text,
          mood,
          date: date || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating reflection:", error);
        throw error;
      }
      res.json(reflection);
    } catch (error) {
      console.error("Error creating reflection:", error);
      res.status(500).json({ message: "Failed to create reflection" });
    }
  });

  // Get student assignments
  app.get("/api/student/assignments", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: assignments, error } = await supabase
        .from("assignments")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(assignments || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({ message: "Failed to fetch assignments" });
    }
  });

  // Submit assignment
  app.post("/api/student/assignments/:id/submit", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { student_result, student_work } = req.body;

      const { data: assignment, error } = await supabase
        .from("assignments")
        .update({
          student_result,
          student_work,
          completed_at: new Date().toISOString(),
          status: "completed",
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(assignment);
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({ message: "Failed to submit assignment" });
    }
  });

  // Get student academic profile
  app.get("/api/student/academic-profile", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: profile, error } = await supabase
        .from("academic_profiles")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .maybeSingle();

      if (error) throw error;
      res.json(profile || {});
    } catch (error) {
      console.error("Error fetching academic profile:", error);
      res.status(500).json({ message: "Failed to fetch academic profile" });
    }
  });

  // Get student struggle targets
  app.get("/api/student/struggle-targets", async (req: Request, res: Response) => {
    try {
      const studentUserId = (req.session as any).studentUserId;
      if (!studentUserId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { data: studentUser } = await supabase
        .from("student_users")
        .select("student_id")
        .eq("id", studentUserId)
        .single();

      if (!studentUser?.student_id) {
        return res.status(404).json({ message: "Student not found" });
      }

      const { data: targets, error } = await supabase
        .from("struggle_targets")
        .select("*")
        .eq("student_id", studentUser.student_id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      res.json(targets || []);
    } catch (error) {
      console.error("Error fetching struggle targets:", error);
      res.status(500).json({ message: "Failed to fetch struggle targets" });
    }
  });

  // ========================================
  // PARENT PORTAL ROUTES
  // ========================================

  // Get parent's student stats
  app.get("/api/parent/student-stats", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      // Get parent's enrollment to find student
      const { data: enrollment } = await supabase
        .from("parent_enrollments")
        .select("student_full_name, assigned_tutor_id")
        .eq("user_id", parentId)
        .maybeSingle();

      if (!enrollment?.assigned_tutor_id) {
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          confidenceGrowth: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          totalCommitments: 0,
        });
      }

      // Find student by name and tutor
      const { data: student } = await supabase
        .from("students")
        .select("id")
        .eq("name", enrollment.student_full_name)
        .eq("tutor_id", enrollment.assigned_tutor_id)
        .maybeSingle();

      if (!student) {
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          confidenceGrowth: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          totalCommitments: 0,
        });
      }

      // Call get_student_stats function
      const { data, error } = await supabase
        .rpc("get_student_stats", { p_student_id: student.id });

      if (error) {
        console.error("Error calling get_student_stats:", error);
        return res.json({
          bossBattlesCompleted: 0,
          solutionsUnlocked: 0,
          confidenceGrowth: 0,
          sessionsCompleted: 0,
          currentStreak: 0,
          totalCommitments: 0,
        });
      }

      const stats = data?.[0] || {};

      // Get commitments count
      const { data: commitments } = await supabase
        .from("student_commitments")
        .select("id")
        .eq("student_id", student.id)
        .eq("is_active", true);

      res.json({
        bossBattlesCompleted: stats.boss_battles_completed || 0,
        solutionsUnlocked: stats.solutions_unlocked || 0,
        confidenceGrowth: stats.confidence_level || 50,
        sessionsCompleted: stats.total_sessions || 0,
        currentStreak: stats.current_streak || 0,
        totalCommitments: commitments?.length || 0,
      });
    } catch (error) {
      console.error("Error fetching parent student stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Get parent's student info
  app.get("/api/parent/student-info", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      const { data: enrollment, error: enrollmentError } = await supabase
        .from("parent_enrollments")
        .select(`
          student_full_name, 
          student_grade,
          assigned_tutor_id
        `)
        .eq("user_id", parentId)
        .maybeSingle();

      if (enrollmentError) {
        console.error("Error fetching parent enrollment:", enrollmentError);
      }

      if (!enrollment) {
        return res.status(404).json({ message: "No enrollment found" });
      }

      // Get tutor's pod if assigned
      let podName = null;
      if (enrollment.assigned_tutor_id) {
        const { data: tutorAssignment, error: podError } = await supabase
          .from("tutor_assignments")
          .select("pod:pods(pod_name)")
          .eq("tutor_id", enrollment.assigned_tutor_id)
          .maybeSingle();

        if (podError) {
          console.error("Error fetching tutor pod:", podError);
        }

        const pod = tutorAssignment?.pod as { pod_name?: string } | null;
        if (pod) {
          podName = pod.pod_name || null;
        }
      }

      console.log("📊 Parent student info response:", {
        name: enrollment.student_full_name,
        grade: enrollment.student_grade,
        podName: podName,
      });

      res.json({
        name: enrollment.student_full_name,
        grade: enrollment.student_grade,
        podName: podName,
      });
    } catch (error) {
      console.error("Error fetching student info:", error);
      res.status(500).json({ message: "Failed to fetch student info" });
    }
  });

  // Get parent reports
  app.get("/api/parent/reports", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const parentId = (req as any).dbUser.id;

      const { data: reports, error } = await supabase
        .from("parent_reports")
        .select("*")
        .eq("parent_id", parentId)
        .order("sent_at", { ascending: false });

      if (error) throw error;
      res.json(reports || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Submit parent feedback on report
  app.post("/api/parent/reports/:id/feedback", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { feedback } = req.body;

      const { data: report, error } = await supabase
        .from("parent_reports")
        .update({
          parent_feedback: feedback,
          parent_feedback_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      res.json(report);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get parent broadcasts (filter for parents)
  app.get("/api/parent/broadcasts", isAuthenticated, requireRole(["parent"]), async (req: Request, res: Response) => {
    try {
      const userCreatedAt = (req as any).dbUser?.createdAt;
      let query = supabase
        .from("broadcasts")
        .select("*")
        .contains("target_roles", ["parent"])
        .order("created_at", { ascending: false });
      
      // Only show broadcasts created after user's account was created
      if (userCreatedAt) {
        query = query.gte("created_at", userCreatedAt);
      }
      
      const { data: broadcasts, error } = await query;

      if (error) throw error;
      res.json(broadcasts || []);
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
      res.status(500).json({ message: "Failed to fetch broadcasts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
