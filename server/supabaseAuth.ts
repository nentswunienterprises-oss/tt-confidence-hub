import { createClient } from "@supabase/supabase-js";
import type {
  Express,
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";
import { storage } from "./storage";
import { getDefaultDashboardRoute } from "@shared/portals";

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase environment variables");
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  let sessionStore;
  
  // Use PostgreSQL for persistent session storage if DATABASE_URL is available
  if (process.env.DATABASE_URL) {
    try {
      const PgSession = connectPg(session);
      
      // Create PostgreSQL pool for session storage
      // Supabase requires SSL in all environments
      const pgPool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }, // Supabase requires SSL
      });

      sessionStore = new PgSession({
        pool: pgPool,
        tableName: "sessions",
        createTableIfMissing: false, // Table already exists from schema
      });
      
      console.log("✅ Using PostgreSQL for persistent session storage");
    } catch (error) {
      console.error("⚠️  Failed to initialize PostgreSQL session store, falling back to memory:", error);
      sessionStore = null; // Will fall back to memory store
    }
  }
  
  // Fallback to memory store if PostgreSQL not available
  if (!sessionStore) {
    const memorystore = require("memorystore");
    const MemoryStore = memorystore(session);
    sessionStore = new MemoryStore({
      checkPeriod: sessionTtl,
    });
    console.log("⚠️  Using memory store for sessions (will clear on restart)");
  }

  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  // Sign up endpoint
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, role = "tutor", first_name = "", last_name = "", affiliate_code = null } = req.body;

      console.log("═══════════════════════════════════════");
      console.log("📝 SIGNUP REQUEST RECEIVED");
      console.log("Request body:", JSON.stringify(req.body));
      console.log("  Email:", email);
      console.log("  Role from request:", req.body.role);
      console.log("  Role extracted (with default):", role);
      console.log("  First Name:", first_name);
      console.log("  Last Name:", last_name);
      console.log("  Affiliate Code:", affiliate_code);
      console.log("═══════════════════════════════════════");

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Create user in Supabase Auth with metadata
      // NOTE: NOT passing metadata here due to trigger issues
      // We'll create the user record manually after auth succeeds
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error("Supabase signup error:", authError);
        return res.status(400).json({ message: authError.message });
      }

      if (!authData.user) {
        return res.status(400).json({ message: "Failed to create user" });
      }

      console.log("✅ Supabase auth user created");
      console.log("  Auth User ID:", authData.user.id);
      console.log("  Email:", authData.user.email);

      // Manually create user record in public.users table
      // (Trigger is disabled due to issues)
      console.log("📝 Creating user record in public.users...");
      console.log("  Role value before insert:", role);
      console.log("  Role type:", typeof role);
      console.log("  Role is undefined?", role === undefined);
      console.log("  Role is null?", role === null);
      console.log("  Role is empty string?", role === "");
      
      const fullName = `${first_name} ${last_name}`.trim() || email.split("@")[0];
      console.log("  Full name for insert:", fullName);
      
      const { data: newUser, error: insertError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          email,
          role,
          first_name,
          last_name,
          name: fullName,
        })
        .select()
        .maybeSingle();

      if (insertError) {
        console.error("❌ Error creating user record:", insertError);
        // Try to delete the auth user since we couldn't create the user record
        await supabase.auth.admin.deleteUser(authData.user.id).catch(err => {
          console.error("Could not delete failed auth user:", err);
        });
        return res.status(500).json({ message: "Failed to create user profile" });
      }

      console.log("✅ User record created successfully!");
      console.log("  Inserted user data:", newUser);
      console.log("  User role from database:", newUser?.role);
      console.log("  User ID:", newUser?.id);
      console.log("  User email:", newUser?.email);
      
      // Verify the role was saved correctly
      if (newUser?.role !== role) {
        console.error("❌ ROLE MISMATCH!");
        console.error("  Expected role:", role);
        console.error("  Actual role in DB:", newUser?.role);
      }

      const user = newUser;

      // If new affiliate signed up, generate their unique code
      if (user && user.role === "affiliate") {
        try {
          console.log("🎁 Generating affiliate code for new affiliate:", user.id);
          // Wrap in Promise.race with timeout to prevent hanging
          const codePromise = storage.getOrCreateAffiliateCode(user.id);
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Code generation timeout")), 5000)
          );
          const code = await Promise.race([codePromise, timeoutPromise]);
          console.log("✅ Affiliate code generated/retrieved:", code);
        } catch (error) {
          console.warn("⚠️  Affiliate code generation failed (non-blocking):", error instanceof Error ? error.message : String(error));
          // Generate a temporary local code if Supabase is unreachable
          const localCode = `AFIX${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
          console.log("📝 Generated temporary local code for affiliate:", localCode);
          // Don't fail the signup - user can get code from dashboard later
        }
      }

      // If parent signed up with affiliate code, create a lead
      if (user && user.role === "parent" && affiliate_code) {
        try {
          console.log("📝 Processing affiliate code:", affiliate_code);
          console.log("📧 Parent signup email:", email);
          
          // Get affiliate ID from code
          const affiliateId = await storage.getAffiliateByCode(affiliate_code.toUpperCase());
          
          if (affiliateId) {
            console.log("✅ Found affiliate for code:", affiliateId);
            
            // Find the encounter by email (since parent_email matches the signup email)
            const { data: encounter } = await supabase
              .from("encounters")
              .select("id")
              .eq("affiliate_id", affiliateId)
              .eq("parent_email", email)
              .order("created_at", { ascending: false })
              .maybeSingle();
            
            if (encounter) {
              console.log("✅ Found encounter for parent email:", email, "encounter_id:", encounter.id);
              // Create a lead linked to this encounter
              await storage.createLead(affiliateId, user.id, encounter.id);
              console.log("✅ Lead created (with encounter) for affiliate:", affiliateId, "encounter_id:", encounter.id);
            } else {
              console.log("ℹ️  No prior encounter found for parent email:", email);
              // Still create a lead - parent is now a lead even without prior encounter
              await storage.createLead(affiliateId, user.id);
              console.log("✅ Lead created (new signup) for affiliate:", affiliateId, "user_id:", user.id);
            }
          } else {
            console.warn("⚠️  Affiliate code not found:", affiliate_code);
          }
        } catch (error) {
          console.error("❌ Error processing affiliate code:", error);
          // Don't fail the signup if affiliate processing fails
        }
      }

      // Set session with user data and token
      console.log("💾 BEFORE setting session values:");
      console.log("  authData.user.id:", authData.user.id);
      console.log("  authData.user.email:", authData.user.email);
      console.log("  authData.session?.access_token:", authData.session?.access_token ? "EXISTS" : "NULL");

      (req.session as any).userId = authData.user.id;
      (req.session as any).email = authData.user.email;
      (req.session as any).accessToken = authData.session?.access_token;
      
      // Force session to be marked as modified so cookie will be sent
      req.session.touch();

      console.log("💾 AFTER setting session values:");
      console.log("  req.session.userId:", (req.session as any).userId);
      console.log("  req.session.email:", (req.session as any).email);
      console.log("  req.session.accessToken:", (req.session as any).accessToken ? "EXISTS" : "NULL");
      console.log("🔍 User role for redirect:", user?.role);

      let redirectUrl: string;
      
      if (user?.role === "parent") {
        redirectUrl = "/client/parent/gateway";
      } else {
        redirectUrl = getDefaultDashboardRoute((user?.role as any) || "tutor");
      }

      console.log("✅ Final Redirect URL determined:", redirectUrl, "for role:", user?.role);

      // Save session before sending response
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log("✅ Session saved successfully for signup");
        console.log("  Session ID:", req.sessionID);
        console.log("  Session cookie headers about to be sent:");
        const setCookieHeader = res.getHeader('Set-Cookie');
        console.log("  Set-Cookie header:", setCookieHeader);
        console.log("  Session contents after save:", {
          userId: (req.session as any).userId,
          email: (req.session as any).email,
          accessToken: (req.session as any).accessToken ? "EXISTS" : "NULL",
        });
        
        // Make sure the response includes the session cookie
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        
        res.json({
          user: authData.user,
          redirectUrl,
          message: "Signup successful",
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Sign in endpoint
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      console.log("═══════════════════════════════════════");
      console.log("🔐 SIGNIN REQUEST RECEIVED");
      console.log("Request body:", JSON.stringify(req.body));
      console.log("═══════════════════════════════════════");
      
      const { email, password, expectedRole } = req.body;
      console.log("✅ Parsed request body successfully");

      console.log("🔐 Parsed values:", { email, password: password ? "***" : null, expectedRole });

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      // Authenticate with Supabase
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) {
        console.error("Supabase signin error:", authError);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (!authData.user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user from our database
      // ✅ Get user directly from Supabase 'users' table
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (fetchError || !user) {
        console.error("User fetch error:", fetchError);
        return res.status(401).json({ message: "User not found" });
      }

      console.log("═══════════════════════════════════════");
      console.log("👤 USER FETCHED FROM DATABASE:");
      console.log("  Email:", user.email);
      console.log("  Role:", user.role);
      console.log("  Expected Role:", expectedRole);
      console.log("═══════════════════════════════════════");

      // ✅ Validate role if expectedRole is provided
      if (expectedRole) {
        console.log(`⚙️  Role validation check: "${user.role}" === "${expectedRole}" ?`);
        if (user.role !== expectedRole) {
          console.error(
            `❌ ROLE MISMATCH: User has role '${user.role}' but tried to login as '${expectedRole}'`
          );
          return res.status(403).json({
            message: `This account is not registered as a ${expectedRole}. Your account is registered as a ${user.role}.`,
          });
        }
      }

      console.log("✅ Role validation PASSED");

      // If parent is logging in, check if they should have a lead
      if (user.role === "parent") {
        try {
          console.log("🔍 Checking for retroactive lead creation for parent:", email);
          
          // Find all encounters for this parent (by email)
          const { data: encounters } = await supabase
            .from("encounters")
            .select("id, affiliate_id")
            .eq("parent_email", email);
          
          if (encounters && encounters.length > 0) {
            // For each encounter, check if a lead exists
            for (const encounter of encounters) {
              const { data: existingLead } = await supabase
                .from("leads")
                .select("id")
                .eq("encounter_id", encounter.id)
                .eq("user_id", user.id)
                .maybeSingle();
              
              // If no lead exists for this encounter+user combo, create one
              if (!existingLead) {
                console.log("⚠️  No lead found for encounter", encounter.id, "- creating retroactively");
                await storage.createLead(encounter.affiliate_id, user.id, encounter.id);
                console.log("✅ Retroactive lead created for encounter:", encounter.id);
              }
            }
          }
        } catch (error) {
          console.warn("⚠️  Error checking retroactive lead creation:", error);
          // Don't fail signin if this check fails
        }
      }

      // Set session
      (req.session as any).userId = authData.user.id;
      (req.session as any).email = authData.user.email;
      (req.session as any).accessToken = authData.session?.access_token;

      console.log("💾 Setting session - Session ID:", req.sessionID);
      console.log("💾 User ID being saved:", authData.user.id);
      console.log("🔍 User role for redirect:", user.role);

      // Determine redirect based on role
      let redirectUrl: string;
      
      if (user.role === "parent") {
        redirectUrl = "/client/parent/gateway";
      } else if (user.role === "td") {
        const podId = await storage.checkTDPodAssignment(user.email!);
        redirectUrl = podId ? getDefaultDashboardRoute("td") : "/td/no-pod";
      } else {
        redirectUrl = getDefaultDashboardRoute((user.role as any) || "tutor");
      }

      console.log("📍 Final redirect URL:", redirectUrl, "for role:", user.role);

      // Save session before sending response
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save error:", err);
          return res.status(500).json({ message: "Session error" });
        }
        
        console.log("✅ Session saved successfully for user:", user.email);
        
        res.json({
          user: authData.user,
          dbUser: user,
          redirectUrl,
          message: "Login successful",
        });
      });
    } catch (error) {
      console.error("❌ SIGNIN ERROR:");
      console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
      console.error("Error message:", error instanceof Error ? error.message : String(error));
      console.error("Full error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      const accessToken = (req.session as any).accessToken;

      if (accessToken) {
        await supabase.auth.signOut();
      }

      req.session.destroy((err) => {
        if (err) {
          console.error("Session destruction error:", err);
        }
        res.json({ message: "Logged out successfully" });
      });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get current user endpoint
  app.get("/api/auth/user", async (req: Request, res: Response) => {
    try {
      console.log("🔍 GET /api/auth/user - Checking authentication...");
      console.log("🔍 Session check - Session ID:", req.sessionID);
      
      // First, try to get user ID from server session
      let userId = (req.session as any).userId;
      let authSource = "session";
      console.log("🔍 User ID from session:", userId);

      // If no server session, try to get user from Supabase auth token
      if (!userId) {
        console.log("📝 No server session, checking for Supabase auth token...");
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.substring(7);
          try {
            // Verify and decode the token using Supabase
            const { data: { user: supabaseUser }, error: supabaseError } = await supabase.auth.getUser(token);
            
            if (supabaseError || !supabaseUser) {
              console.log("❌ Supabase token invalid:", supabaseError?.message);
              return res.status(401).json({ message: "Invalid token" });
            }
            
            console.log("✅ Supabase token valid, user ID:", supabaseUser.id);
            userId = supabaseUser.id;
            authSource = "jwt";
          } catch (tokenError) {
            console.log("❌ Error verifying token:", tokenError);
            return res.status(401).json({ message: "Unauthorized" });
          }
        }
      }

      if (!userId) {
        console.log("❌ No userId in session or auth header");
        return res.status(401).json({ message: "Unauthorized" });
      }

      console.log(`🔑 Using userId from ${authSource}:`, userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        console.log("❌ User not found in database for ID:", userId);
        return res.status(401).json({ message: "User not found" });
      }

      console.log("✅ User authenticated:", user.email, "with role:", user.role);
      console.log("📋 Full user object:", JSON.stringify(user, null, 2));
      console.log("📋 User role type:", typeof user.role);
      console.log("📋 User role === 'parent':", user.role === "parent");
      console.log("📋 User role === 'affiliate':", user.role === "affiliate");
      
      // DEBUG: Check if user is a parent with a lead (affiliate relationship)
      if (user.role === "parent") {
        try {
          const { data: parentLead } = await supabase
            .from("leads")
            .select("affiliate_id, affiliate:affiliate_id(role)")
            .eq("parent_id", userId)
            .maybeSingle();
          
          if (parentLead) {
            console.log("📋 Parent has lead relationship:");
            console.log("  Affiliate ID:", parentLead.affiliate_id);
            console.log("  Affiliate role:", (parentLead.affiliate as any)?.role);
          }
        } catch (debugError) {
          console.warn("Debug check failed:", debugError);
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
}

// Middleware to check if user is authenticated
export const isAuthenticated: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req.session as any).userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Get user from database and attach to request
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    (req as any).dbUser = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ message: "Unauthorized" });
  }
};
