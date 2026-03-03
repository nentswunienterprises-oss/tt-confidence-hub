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
import { createClient } from "@supabase/supabase-js";
import session from "express-session";
import connectPg from "connect-pg-simple";
import pg from "pg";
import { storage } from "./storage";
import { getDefaultDashboardRoute } from "@shared/portals";
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    throw new Error("Missing Supabase environment variables");
}
var supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
export function getSession() {
    var sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
    var sessionStore;
    // Use PostgreSQL for persistent session storage if DATABASE_URL is available
    if (process.env.DATABASE_URL) {
        try {
            var PgSession = connectPg(session);
            // Create PostgreSQL pool for session storage
            // Supabase requires SSL in all environments
            var pgPool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false }, // Supabase requires SSL
            });
            sessionStore = new PgSession({
                pool: pgPool,
                tableName: "sessions",
                createTableIfMissing: false, // Table already exists from schema
            });
            console.log("✅ Using PostgreSQL for persistent session storage");
        }
        catch (error) {
            console.error("⚠️  Failed to initialize PostgreSQL session store, falling back to memory:", error);
            sessionStore = null; // Will fall back to memory store
        }
    }
    // Fallback to memory store if PostgreSQL not available
    if (!sessionStore) {
        var memorystore = require("memorystore");
        var MemoryStore = memorystore(session);
        sessionStore = new MemoryStore({
            checkPeriod: sessionTtl,
        });
        console.log("⚠️  Using memory store for sessions (will clear on restart)");
    }
    return session({
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false, // Always false for local dev
            sameSite: "lax", // Always lax for local dev
            maxAge: sessionTtl,
            // domain: '.territorialtutoring.co.za', // REMOVE for local dev
            // Add path if needed
            path: "/",
        },
        // Add logging for session events
        logErrors: true,
    });
}
export function setupAuth(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            app.set("trust proxy", 1);
            app.use(getSession());
            // Sign up endpoint
            app.post("/api/auth/signup", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, email, password, _b, role, _c, first_name, _d, last_name, _e, affiliate_code, _f, tracking_source, _g, tracking_campaign, _h, authData_1, authError, fullName, _j, newUser, insertError, user, codePromise, timeoutPromise, code, error_1, localCode, affiliateId, encounter, error_2, error_3, redirectUrl_1, error_4;
                var _k, _l;
                return __generator(this, function (_m) {
                    switch (_m.label) {
                        case 0:
                            console.log("[SESSION] Before signup: req.sessionID:", req.sessionID);
                            console.log("[SESSION] Before signup: req.session:", req.session);
                            _m.label = 1;
                        case 1:
                            _m.trys.push([1, 25, , 26]);
                            _a = req.body, email = _a.email, password = _a.password, _b = _a.role, role = _b === void 0 ? "tutor" : _b, _c = _a.first_name, first_name = _c === void 0 ? "" : _c, _d = _a.last_name, last_name = _d === void 0 ? "" : _d, _e = _a.affiliate_code, affiliate_code = _e === void 0 ? null : _e, _f = _a.tracking_source, tracking_source = _f === void 0 ? "organic" : _f, _g = _a.tracking_campaign, tracking_campaign = _g === void 0 ? null : _g;
                            console.log("═══════════════════════════════════════");
                            console.log("📝 SIGNUP REQUEST RECEIVED");
                            console.log("Request body:", JSON.stringify(req.body));
                            console.log("  Email:", email);
                            console.log("  Role from request:", req.body.role);
                            console.log("  Role extracted (with default):", role);
                            console.log("  First Name:", first_name);
                            console.log("  Last Name:", last_name);
                            console.log("  Affiliate Code:", affiliate_code);
                            console.log("  Tracking Source:", tracking_source);
                            console.log("  Tracking Campaign:", tracking_campaign);
                            console.log("═══════════════════════════════════════");
                            if (!email || !password) {
                                return [2 /*return*/, res
                                        .status(400)
                                        .json({ message: "Email and password are required" })];
                            }
                            return [4 /*yield*/, supabase.auth.signUp({
                                    email: email,
                                    password: password,
                                })];
                        case 2:
                            _h = _m.sent(), authData_1 = _h.data, authError = _h.error;
                            if (authError) {
                                console.error("Supabase signup error:", authError);
                                return [2 /*return*/, res.status(400).json({ message: authError.message })];
                            }
                            if (!authData_1.user) {
                                return [2 /*return*/, res.status(400).json({ message: "Failed to create user" })];
                            }
                            console.log("✅ Supabase auth user created");
                            console.log("  Auth User ID:", authData_1.user.id);
                            console.log("  Email:", authData_1.user.email);
                            // Manually create user record in public.users table
                            // (Trigger is disabled due to issues)
                            console.log("📝 Creating user record in public.users...");
                            console.log("  Role value before insert:", role);
                            console.log("  Role type:", typeof role);
                            console.log("  Role is undefined?", role === undefined);
                            console.log("  Role is null?", role === null);
                            console.log("  Role is empty string?", role === "");
                            fullName = "".concat(first_name, " ").concat(last_name).trim() || email.split("@")[0];
                            console.log("  Full name for insert:", fullName);
                            return [4 /*yield*/, supabase
                                    .from("users")
                                    .insert({
                                    id: authData_1.user.id,
                                    email: email,
                                    role: role,
                                    first_name: first_name,
                                    last_name: last_name,
                                    name: fullName,
                                })
                                    .select()
                                    .maybeSingle()];
                        case 3:
                            _j = _m.sent(), newUser = _j.data, insertError = _j.error;
                            if (!insertError) return [3 /*break*/, 5];
                            console.error("❌ Error creating user record:", insertError);
                            // Try to delete the auth user since we couldn't create the user record
                            return [4 /*yield*/, supabase.auth.admin.deleteUser(authData_1.user.id).catch(function (err) {
                                    console.error("Could not delete failed auth user:", err);
                                })];
                        case 4:
                            // Try to delete the auth user since we couldn't create the user record
                            _m.sent();
                            return [2 /*return*/, res.status(500).json({ message: "Failed to create user profile" })];
                        case 5:
                            console.log("✅ User record created successfully!");
                            console.log("  Inserted user data:", newUser);
                            console.log("  User role from database:", newUser === null || newUser === void 0 ? void 0 : newUser.role);
                            console.log("  User ID:", newUser === null || newUser === void 0 ? void 0 : newUser.id);
                            console.log("  User email:", newUser === null || newUser === void 0 ? void 0 : newUser.email);
                            // Verify the role was saved correctly
                            if ((newUser === null || newUser === void 0 ? void 0 : newUser.role) !== role) {
                                console.error("❌ ROLE MISMATCH!");
                                console.error("  Expected role:", role);
                                console.error("  Actual role in DB:", newUser === null || newUser === void 0 ? void 0 : newUser.role);
                            }
                            user = newUser;
                            if (!(user && user.role === "affiliate")) return [3 /*break*/, 9];
                            _m.label = 6;
                        case 6:
                            _m.trys.push([6, 8, , 9]);
                            console.log("🎁 Generating affiliate code for new affiliate:", user.id);
                            codePromise = storage.getOrCreateAffiliateCode(user.id);
                            timeoutPromise = new Promise(function (_, reject) {
                                return setTimeout(function () { return reject(new Error("Code generation timeout")); }, 5000);
                            });
                            return [4 /*yield*/, Promise.race([codePromise, timeoutPromise])];
                        case 7:
                            code = _m.sent();
                            console.log("✅ Affiliate code generated/retrieved:", code);
                            return [3 /*break*/, 9];
                        case 8:
                            error_1 = _m.sent();
                            console.warn("⚠️  Affiliate code generation failed (non-blocking):", error_1 instanceof Error ? error_1.message : String(error_1));
                            localCode = "AFIX".concat(Math.random().toString(36).substring(2, 8).toUpperCase());
                            console.log("📝 Generated temporary local code for affiliate:", localCode);
                            return [3 /*break*/, 9];
                        case 9:
                            if (!(user && user.role === "parent" && affiliate_code)) return [3 /*break*/, 20];
                            _m.label = 10;
                        case 10:
                            _m.trys.push([10, 19, , 20]);
                            console.log("📝 Processing affiliate code:", affiliate_code);
                            console.log("📧 Parent signup email:", email);
                            return [4 /*yield*/, storage.getAffiliateByCode(affiliate_code.toUpperCase())];
                        case 11:
                            affiliateId = _m.sent();
                            if (!affiliateId) return [3 /*break*/, 17];
                            console.log("✅ Found affiliate for code:", affiliateId);
                            return [4 /*yield*/, supabase
                                    .from("encounters")
                                    .select("id")
                                    .eq("affiliate_id", affiliateId)
                                    .eq("parent_email", email)
                                    .order("created_at", { ascending: false })
                                    .maybeSingle()];
                        case 12:
                            encounter = (_m.sent()).data;
                            if (!encounter) return [3 /*break*/, 14];
                            console.log("✅ Found encounter for parent email:", email, "encounter_id:", encounter.id);
                            // Create a lead linked to this encounter
                            return [4 /*yield*/, storage.createLead(affiliateId, user.id, encounter.id, {
                                    trackingSource: tracking_source,
                                    trackingCampaign: tracking_campaign,
                                })];
                        case 13:
                            // Create a lead linked to this encounter
                            _m.sent();
                            console.log("✅ Lead created (with encounter) for affiliate:", affiliateId, "encounter_id:", encounter.id);
                            return [3 /*break*/, 16];
                        case 14:
                            console.log("ℹ️  No prior encounter found for parent email:", email);
                            // Still create a lead - parent is now a lead even without prior encounter
                            return [4 /*yield*/, storage.createLead(affiliateId, user.id, undefined, {
                                    trackingSource: tracking_source,
                                    trackingCampaign: tracking_campaign,
                                })];
                        case 15:
                            // Still create a lead - parent is now a lead even without prior encounter
                            _m.sent();
                            console.log("✅ Lead created (new signup) for affiliate:", affiliateId, "user_id:", user.id);
                            _m.label = 16;
                        case 16: return [3 /*break*/, 18];
                        case 17:
                            console.warn("⚠️  Affiliate code not found:", affiliate_code);
                            _m.label = 18;
                        case 18: return [3 /*break*/, 20];
                        case 19:
                            error_2 = _m.sent();
                            console.error("❌ Error processing affiliate code:", error_2);
                            return [3 /*break*/, 20];
                        case 20:
                            if (!!affiliate_code) return [3 /*break*/, 24];
                            _m.label = 21;
                        case 21:
                            _m.trys.push([21, 23, , 24]);
                            console.log("📊 Organic signup - creating organic lead");
                            // Create a lead with null affiliate_id to track organic signups
                            return [4 /*yield*/, supabase
                                    .from("leads")
                                    .insert({
                                    affiliate_id: null, // null for organic leads
                                    user_id: user.id,
                                    encounter_id: null,
                                    tracking_source: tracking_source || 'organic',
                                    tracking_campaign: tracking_campaign || null,
                                })];
                        case 22:
                            // Create a lead with null affiliate_id to track organic signups
                            _m.sent();
                            console.log("✅ Organic lead created for user:", user.id);
                            return [3 /*break*/, 24];
                        case 23:
                            error_3 = _m.sent();
                            console.error("❌ Error creating organic lead:", error_3);
                            return [3 /*break*/, 24];
                        case 24:
                            // Set session with user data and token
                            console.log("💾 BEFORE setting session values:");
                            console.log("  authData.user.id:", authData_1.user.id);
                            console.log("  authData.user.email:", authData_1.user.email);
                            console.log("  authData.session?.access_token:", ((_k = authData_1.session) === null || _k === void 0 ? void 0 : _k.access_token) ? "EXISTS" : "NULL");
                            req.session.userId = authData_1.user.id;
                            req.session.email = authData_1.user.email;
                            req.session.accessToken = (_l = authData_1.session) === null || _l === void 0 ? void 0 : _l.access_token;
                            // Force session to be marked as modified so cookie will be sent
                            req.session.touch();
                            console.log("💾 AFTER setting session values:");
                            console.log("  req.session.userId:", req.session.userId);
                            console.log("  req.session.email:", req.session.email);
                            console.log("  req.session.accessToken:", req.session.accessToken ? "EXISTS" : "NULL");
                            console.log("🔍 User role for redirect:", user === null || user === void 0 ? void 0 : user.role);
                            if ((user === null || user === void 0 ? void 0 : user.role) === "parent") {
                                redirectUrl_1 = "/client/parent/gateway";
                            }
                            else {
                                redirectUrl_1 = getDefaultDashboardRoute((user === null || user === void 0 ? void 0 : user.role) || "tutor");
                            }
                            // Validate redirectUrl is set
                            if (!redirectUrl_1) {
                                console.error("❌ CRITICAL: redirectUrl is undefined! Falling back to getDefaultDashboardRoute");
                                console.error("  User role:", user === null || user === void 0 ? void 0 : user.role);
                                console.error("  User:", user);
                                redirectUrl_1 = getDefaultDashboardRoute((user === null || user === void 0 ? void 0 : user.role) || "tutor");
                                console.warn("⚠️  Fallback redirect URL:", redirectUrl_1);
                            }
                            console.log("✅ Final Redirect URL determined:", redirectUrl_1, "for role:", user === null || user === void 0 ? void 0 : user.role);
                            // Save session before sending response
                            req.session.save(function (err) {
                                console.log("[SESSION] After signup: req.sessionID:", req.sessionID);
                                console.log("[SESSION] After signup: req.session:", req.session);
                                if (err) {
                                    console.error("❌ Session save error:", err);
                                    return res.status(500).json({ message: "Session error" });
                                }
                                console.log("✅ Session saved successfully for signup");
                                console.log("  Session ID:", req.sessionID);
                                console.log("  Session cookie headers about to be sent:");
                                var setCookieHeader = res.getHeader('Set-Cookie');
                                console.log("  Set-Cookie header:", setCookieHeader);
                                console.log("  Session contents after save:", {
                                    userId: req.session.userId,
                                    email: req.session.email,
                                    accessToken: req.session.accessToken ? "EXISTS" : "NULL",
                                });
                                // Make sure the response includes the session cookie
                                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                                res.json({
                                    user: authData_1.user,
                                    redirectUrl: redirectUrl_1,
                                    message: "Signup successful",
                                });
                            });
                            return [3 /*break*/, 26];
                        case 25:
                            error_4 = _m.sent();
                            console.error("Signup error:", error_4);
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 26];
                        case 26: return [2 /*return*/];
                    }
                });
            }); });
            // Sign in endpoint
            app.post("/api/auth/signin", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, email, password, expectedRole, _b, authData_2, authError, _c, user_1, fetchError, roleToAssign, name_1, first_name, last_name, _d, newUser, insertError, encounters, _i, encounters_1, encounter, existingLead, error_5, redirectUrl_2, podId, error_6;
                var _e, _f, _g, _h;
                return __generator(this, function (_j) {
                    switch (_j.label) {
                        case 0:
                            console.log("[SESSION] Before signin: req.sessionID:", req.sessionID);
                            console.log("[SESSION] Before signin: req.session:", req.session);
                            console.log("[SESSION] After signin: req.sessionID:", req.sessionID);
                            console.log("[SESSION] After signin: req.session:", req.session);
                            _j.label = 1;
                        case 1:
                            _j.trys.push([1, 19, , 20]);
                            console.log("═══════════════════════════════════════");
                            console.log("🔐 SIGNIN REQUEST RECEIVED");
                            console.log("Request body:", JSON.stringify(req.body));
                            console.log("═══════════════════════════════════════");
                            _a = req.body, email = _a.email, password = _a.password, expectedRole = _a.expectedRole;
                            console.log("✅ Parsed request body successfully");
                            console.log("🔐 Parsed values:", { email: email, password: password ? "***" : null, expectedRole: expectedRole });
                            if (!email || !password) {
                                return [2 /*return*/, res
                                        .status(400)
                                        .json({ message: "Email and password are required" })];
                            }
                            return [4 /*yield*/, supabase.auth.signInWithPassword({
                                    email: email,
                                    password: password,
                                })];
                        case 2:
                            _b = _j.sent(), authData_2 = _b.data, authError = _b.error;
                            if (authError) {
                                console.error("Supabase signin error:", authError);
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            if (!authData_2.user) {
                                return [2 /*return*/, res.status(401).json({ message: "Invalid credentials" })];
                            }
                            return [4 /*yield*/, supabase
                                    .from("users")
                                    .select("*")
                                    .eq("email", email)
                                    .maybeSingle()];
                        case 3:
                            _c = _j.sent(), user_1 = _c.data, fetchError = _c.error;
                            if (!!user_1) return [3 /*break*/, 5];
                            console.warn("⚠️  No user record found, auto-provisioning user:", email);
                            roleToAssign = expectedRole || "tutor";
                            name_1 = ((_e = authData_2.user.user_metadata) === null || _e === void 0 ? void 0 : _e.name) || email.split("@")[0];
                            first_name = ((_f = authData_2.user.user_metadata) === null || _f === void 0 ? void 0 : _f.first_name) || "";
                            last_name = ((_g = authData_2.user.user_metadata) === null || _g === void 0 ? void 0 : _g.last_name) || "";
                            return [4 /*yield*/, supabase
                                    .from("users")
                                    .insert({
                                    id: authData_2.user.id,
                                    email: email,
                                    role: roleToAssign,
                                    first_name: first_name,
                                    last_name: last_name,
                                    name: name_1,
                                })
                                    .select()
                                    .maybeSingle()];
                        case 4:
                            _d = _j.sent(), newUser = _d.data, insertError = _d.error;
                            if (insertError || !newUser) {
                                console.error("❌ Failed to auto-provision user:", insertError);
                                return [2 /*return*/, res.status(401).json({ message: "User not found" })];
                            }
                            console.log("✅ Auto-provisioned user record:", newUser.id, newUser.role);
                            user_1 = newUser;
                            _j.label = 5;
                        case 5:
                            console.log("═══════════════════════════════════════");
                            console.log("👤 USER FETCHED FROM DATABASE:");
                            console.log("  Email:", user_1.email);
                            console.log("  Role:", user_1.role);
                            console.log("  Expected Role:", expectedRole);
                            console.log("═══════════════════════════════════════");
                            // ✅ Validate role if expectedRole is provided
                            if (expectedRole) {
                                console.log("\u2699\uFE0F  Role validation check: \"".concat(user_1.role, "\" === \"").concat(expectedRole, "\" ?"));
                                if (user_1.role !== expectedRole) {
                                    console.error("\u274C ROLE MISMATCH: User has role '".concat(user_1.role, "' but tried to login as '").concat(expectedRole, "'"));
                                    return [2 /*return*/, res.status(403).json({
                                            message: "This account is not registered as a ".concat(expectedRole, ". Your account is registered as a ").concat(user_1.role, "."),
                                        })];
                                }
                            }
                            console.log("✅ Role validation PASSED");
                            if (!(user_1.role === "parent")) return [3 /*break*/, 14];
                            _j.label = 6;
                        case 6:
                            _j.trys.push([6, 13, , 14]);
                            console.log("🔍 Checking for retroactive lead creation for parent:", email);
                            return [4 /*yield*/, supabase
                                    .from("encounters")
                                    .select("id, affiliate_id")
                                    .eq("parent_email", email)];
                        case 7:
                            encounters = (_j.sent()).data;
                            if (!(encounters && encounters.length > 0)) return [3 /*break*/, 12];
                            _i = 0, encounters_1 = encounters;
                            _j.label = 8;
                        case 8:
                            if (!(_i < encounters_1.length)) return [3 /*break*/, 12];
                            encounter = encounters_1[_i];
                            return [4 /*yield*/, supabase
                                    .from("leads")
                                    .select("id")
                                    .eq("encounter_id", encounter.id)
                                    .eq("user_id", user_1.id)
                                    .maybeSingle()];
                        case 9:
                            existingLead = (_j.sent()).data;
                            if (!!existingLead) return [3 /*break*/, 11];
                            console.log("⚠️  No lead found for encounter", encounter.id, "- creating retroactively");
                            return [4 /*yield*/, storage.createLead(encounter.affiliate_id, user_1.id, encounter.id)];
                        case 10:
                            _j.sent();
                            console.log("✅ Retroactive lead created for encounter:", encounter.id);
                            _j.label = 11;
                        case 11:
                            _i++;
                            return [3 /*break*/, 8];
                        case 12: return [3 /*break*/, 14];
                        case 13:
                            error_5 = _j.sent();
                            console.warn("⚠️  Error checking retroactive lead creation:", error_5);
                            return [3 /*break*/, 14];
                        case 14:
                            // Set session
                            req.session.userId = authData_2.user.id;
                            req.session.email = authData_2.user.email;
                            req.session.accessToken = (_h = authData_2.session) === null || _h === void 0 ? void 0 : _h.access_token;
                            console.log("💾 Setting session - Session ID:", req.sessionID);
                            console.log("💾 User ID being saved:", authData_2.user.id);
                            console.log("🔍 User role for redirect:", user_1.role);
                            if (!(user_1.role === "parent")) return [3 /*break*/, 15];
                            redirectUrl_2 = "/client/parent/gateway";
                            return [3 /*break*/, 18];
                        case 15:
                            if (!(user_1.role === "td")) return [3 /*break*/, 17];
                            return [4 /*yield*/, storage.checkTDPodAssignment(user_1.email)];
                        case 16:
                            podId = _j.sent();
                            redirectUrl_2 = podId ? getDefaultDashboardRoute("td") : "/operational/td/no-pod";
                            return [3 /*break*/, 18];
                        case 17:
                            redirectUrl_2 = getDefaultDashboardRoute(user_1.role || "tutor");
                            _j.label = 18;
                        case 18:
                            // Validate redirectUrl is set
                            if (!redirectUrl_2) {
                                console.error("❌ CRITICAL: redirectUrl is undefined! Falling back to getDefaultDashboardRoute");
                                console.error("  User role:", user_1.role);
                                console.error("  User:", user_1);
                                // Fallback to role-based default route to avoid breaking signin flow
                                redirectUrl_2 = getDefaultDashboardRoute((user_1 === null || user_1 === void 0 ? void 0 : user_1.role) || expectedRole || "tutor");
                                console.warn("⚠️  Fallback redirect URL:", redirectUrl_2);
                            }
                            console.log("📍 Final redirect URL:", redirectUrl_2, "for role:", user_1.role);
                            // Save session before sending response
                            req.session.save(function (err) {
                                if (err) {
                                    console.error("❌ Session save error:", err);
                                    return res.status(500).json({ message: "Session error" });
                                }
                                console.log("✅ Session saved successfully for user:", user_1.email);
                                res.json({
                                    user: authData_2.user,
                                    dbUser: user_1,
                                    redirectUrl: redirectUrl_2,
                                    message: "Login successful",
                                });
                            });
                            return [3 /*break*/, 20];
                        case 19:
                            error_6 = _j.sent();
                            console.error("❌ SIGNIN ERROR:");
                            console.error("Error type:", error_6 instanceof Error ? error_6.constructor.name : typeof error_6);
                            console.error("Error message:", error_6 instanceof Error ? error_6.message : String(error_6));
                            console.error("Full error:", error_6);
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 20];
                        case 20: return [2 /*return*/];
                    }
                });
            }); });
            // OAuth profile creation endpoint - handles new users signing up via Google OAuth
            app.post("/api/auth/oauth-profile", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, user_id, email, role, _b, first_name, _c, last_name, _d, affiliate_code, publicSignupRoles, existingUser, updateError, affiliate, error_7, error_8;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            _e.trys.push([0, 11, , 12]);
                            console.log("═══════════════════════════════════════");
                            console.log("🔐 OAUTH PROFILE CREATION REQUEST");
                            console.log("Request body:", JSON.stringify(req.body));
                            console.log("═══════════════════════════════════════");
                            _a = req.body, user_id = _a.user_id, email = _a.email, role = _a.role, _b = _a.first_name, first_name = _b === void 0 ? "" : _b, _c = _a.last_name, last_name = _c === void 0 ? "" : _c, _d = _a.affiliate_code, affiliate_code = _d === void 0 ? null : _d;
                            if (!user_id || !email || !role) {
                                return [2 /*return*/, res.status(400).json({ message: "user_id, email, and role are required" })];
                            }
                            publicSignupRoles = ["parent", "tutor", "affiliate"];
                            if (!publicSignupRoles.includes(role)) {
                                return [2 /*return*/, res.status(400).json({ message: "Invalid role for OAuth signup" })];
                            }
                            return [4 /*yield*/, storage.getUser(user_id)];
                        case 1:
                            existingUser = _e.sent();
                            if (existingUser) {
                                console.log("✅ User profile already exists, returning existing role:", existingUser.role);
                                return [2 /*return*/, res.json({ role: existingUser.role, message: "User already exists" })];
                            }
                            console.log("🆕 Creating new user profile for OAuth user:", email, "with role:", role);
                            return [4 /*yield*/, supabase.auth.admin.updateUserById(user_id, {
                                    user_metadata: { role: role }
                                })];
                        case 2:
                            updateError = (_e.sent()).error;
                            if (updateError) {
                                console.error("Failed to update user metadata:", updateError);
                                // Continue anyway - we'll still create the database record
                            }
                            // Create user in database
                            return [4 /*yield*/, storage.createUser({
                                    id: user_id,
                                    email: email,
                                    role: role,
                                    firstName: first_name,
                                    lastName: last_name,
                                    verificationStatus: "pending",
                                })];
                        case 3:
                            // Create user in database
                            _e.sent();
                            console.log("✅ User profile created successfully");
                            if (!(role === "parent" && affiliate_code)) return [3 /*break*/, 10];
                            _e.label = 4;
                        case 4:
                            _e.trys.push([4, 9, , 10]);
                            return [4 /*yield*/, supabase
                                    .from("users")
                                    .select("id")
                                    .eq("affiliate_code", affiliate_code)
                                    .eq("role", "affiliate")
                                    .maybeSingle()];
                        case 5:
                            affiliate = (_e.sent()).data;
                            if (!affiliate) return [3 /*break*/, 7];
                            console.log("🔗 Creating lead for parent with affiliate code:", affiliate_code);
                            return [4 /*yield*/, storage.createLead(affiliate.id, user_id, null)];
                        case 6:
                            _e.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            console.warn("⚠️  Affiliate code not found:", affiliate_code);
                            _e.label = 8;
                        case 8: return [3 /*break*/, 10];
                        case 9:
                            error_7 = _e.sent();
                            console.error("Error creating lead for OAuth parent:", error_7);
                            return [3 /*break*/, 10];
                        case 10:
                            res.json({
                                role: role,
                                message: "OAuth profile created successfully"
                            });
                            return [3 /*break*/, 12];
                        case 11:
                            error_8 = _e.sent();
                            console.error("OAuth profile creation error:", error_8);
                            res.status(500).json({ message: "Failed to create OAuth profile" });
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); });
            // Logout endpoint
            app.post("/api/auth/logout", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var accessToken, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            console.log("[SESSION] Before logout: req.sessionID:", req.sessionID);
                            console.log("[SESSION] Before logout: req.session:", req.session);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 4, , 5]);
                            accessToken = req.session.accessToken;
                            if (!accessToken) return [3 /*break*/, 3];
                            return [4 /*yield*/, supabase.auth.signOut()];
                        case 2:
                            _a.sent();
                            _a.label = 3;
                        case 3:
                            req.session.destroy(function (err) {
                                console.log("[SESSION] After logout: req.sessionID:", req.sessionID);
                                console.log("[SESSION] After logout: req.session:", req.session);
                                if (err) {
                                    console.error("Session destruction error:", err);
                                }
                                res.json({ message: "Logged out successfully" });
                            });
                            return [3 /*break*/, 5];
                        case 4:
                            error_9 = _a.sent();
                            console.error("Logout error:", error_9);
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 5];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get current user endpoint
            app.get("/api/auth/user", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var userId, authSource, authHeader, token, _a, supabaseUser, supabaseError, tokenError_1, user, parentLead, affiliate, debugError_1, error_10;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            console.log("[SESSION] Before /api/auth/user: req.sessionID:", req.sessionID);
                            console.log("[SESSION] Before /api/auth/user: req.session:", req.session);
                            _b.label = 1;
                        case 1:
                            _b.trys.push([1, 11, , 12]);
                            console.log("🔍 GET /api/auth/user - Checking authentication...");
                            console.log("🔍 Session check - Session ID:", req.sessionID);
                            userId = req.session.userId;
                            authSource = "session";
                            console.log("🔍 User ID from session:", userId);
                            if (!!userId) return [3 /*break*/, 5];
                            console.log("📝 No server session, checking for Supabase auth token...");
                            authHeader = req.headers.authorization;
                            if (!(authHeader && authHeader.startsWith("Bearer "))) return [3 /*break*/, 5];
                            token = authHeader.substring(7);
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, supabase.auth.getUser(token)];
                        case 3:
                            _a = _b.sent(), supabaseUser = _a.data.user, supabaseError = _a.error;
                            if (supabaseError || !supabaseUser) {
                                console.log("❌ Supabase token invalid:", supabaseError === null || supabaseError === void 0 ? void 0 : supabaseError.message);
                                return [2 /*return*/, res.status(401).json({ message: "Invalid token" })];
                            }
                            console.log("✅ Supabase token valid, user ID:", supabaseUser.id);
                            userId = supabaseUser.id;
                            authSource = "jwt";
                            return [3 /*break*/, 5];
                        case 4:
                            tokenError_1 = _b.sent();
                            console.log("❌ Error verifying token:", tokenError_1);
                            return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                        case 5:
                            if (!userId) {
                                console.log("❌ No userId in session or auth header");
                                return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                            }
                            console.log("\uD83D\uDD11 Using userId from ".concat(authSource, ":"), userId);
                            return [4 /*yield*/, storage.getUser(userId)];
                        case 6:
                            user = _b.sent();
                            if (!user) {
                                console.log("❌ User not found in database for ID:", userId);
                                return [2 /*return*/, res.status(401).json({ message: "User not found" })];
                            }
                            console.log("✅ User authenticated:", user.email, "with role:", user.role);
                            console.log("📋 Full user object:", JSON.stringify(user, null, 2));
                            console.log("📋 User role type:", typeof user.role);
                            console.log("📋 User role === 'parent':", user.role === "parent");
                            console.log("📋 User role === 'affiliate':", user.role === "affiliate");
                            if (!(user.role === "parent")) return [3 /*break*/, 10];
                            _b.label = 7;
                        case 7:
                            _b.trys.push([7, 9, , 10]);
                            return [4 /*yield*/, supabase
                                    .from("leads")
                                    .select("affiliate_id, affiliate:affiliate_id(role)")
                                    .eq("parent_id", userId)
                                    .maybeSingle()];
                        case 8:
                            parentLead = (_b.sent()).data;
                            if (parentLead) {
                                console.log("📋 Parent has lead relationship:");
                                console.log("  Affiliate ID:", parentLead.affiliate_id);
                                affiliate = parentLead.affiliate;
                                console.log("  Affiliate role:", affiliate === null || affiliate === void 0 ? void 0 : affiliate.role);
                            }
                            return [3 /*break*/, 10];
                        case 9:
                            debugError_1 = _b.sent();
                            console.warn("Debug check failed:", debugError_1);
                            return [3 /*break*/, 10];
                        case 10:
                            res.json(user);
                            return [3 /*break*/, 12];
                        case 11:
                            error_10 = _b.sent();
                            console.error("Get user error:", error_10);
                            res.status(500).json({ message: "Internal server error" });
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/];
        });
    });
}
// Middleware to check if user is authenticated
export var isAuthenticated = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var sessionUserId, userPromise, timeoutPromise, user, userError_1, authHeader, token, _a, supabaseUser, error, userPromise, timeoutPromise, user, userError_2, error_11;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                console.time("⏱️ isAuthenticated total time");
                // Debug: print session object for all requests
                console.log("[DEBUG] isAuthenticated session:", req.session);
                if (!(req.session && req.session.userId)) return [3 /*break*/, 4];
                sessionUserId = req.session.userId;
                console.log("🔐 [isAuthenticated] sessionUserId:", sessionUserId);
                // Session auth found - use it
                console.time("⏱️ storage.getUser");
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                userPromise = storage.getUser(sessionUserId);
                timeoutPromise = new Promise(function (_, reject) {
                    return setTimeout(function () { return reject(new Error("getUser timeout after 5s")); }, 5000);
                });
                return [4 /*yield*/, Promise.race([userPromise, timeoutPromise])];
            case 2:
                user = _b.sent();
                console.timeEnd("⏱️ storage.getUser");
                console.log("✅ [isAuthenticated] user found:", user === null || user === void 0 ? void 0 : user.email);
                if (user) {
                    req.dbUser = user;
                    console.timeEnd("⏱️ isAuthenticated total time");
                    return [2 /*return*/, next()];
                }
                return [3 /*break*/, 4];
            case 3:
                userError_1 = _b.sent();
                console.error("❌ [isAuthenticated] error fetching user:", userError_1);
                return [2 /*return*/, res.status(500).json({ message: "Error retrieving user" })];
            case 4:
                authHeader = req.headers.authorization;
                if (!(authHeader && authHeader.startsWith("Bearer "))) return [3 /*break*/, 9];
                token = authHeader.substring(7);
                return [4 /*yield*/, supabase.auth.getUser(token)];
            case 5:
                _a = _b.sent(), supabaseUser = _a.data.user, error = _a.error;
                if (error) {
                    console.error("Token verification failed:", error.message);
                    return [2 /*return*/, res.status(401).json({ message: "Invalid token" })];
                }
                if (!supabaseUser) return [3 /*break*/, 9];
                // Get user from our database
                console.time("⏱️ storage.getUser (Bearer)");
                _b.label = 6;
            case 6:
                _b.trys.push([6, 8, , 9]);
                userPromise = storage.getUser(supabaseUser.id);
                timeoutPromise = new Promise(function (_, reject) {
                    return setTimeout(function () { return reject(new Error("getUser timeout after 5s")); }, 5000);
                });
                return [4 /*yield*/, Promise.race([userPromise, timeoutPromise])];
            case 7:
                user = _b.sent();
                console.timeEnd("⏱️ storage.getUser (Bearer)");
                if (user) {
                    req.dbUser = user;
                    return [2 /*return*/, next()];
                }
                else {
                    console.error("User not found in database for Supabase user:", supabaseUser.id);
                    return [2 /*return*/, res.status(401).json({ message: "User not found" })];
                }
                return [3 /*break*/, 9];
            case 8:
                userError_2 = _b.sent();
                console.error("❌ Error fetching user (Bearer):", userError_2);
                return [2 /*return*/, res.status(500).json({ message: "Error retrieving user" })];
            case 9: 
            // No valid auth found
            return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
            case 10:
                error_11 = _b.sent();
                console.error("Auth middleware error:", error_11);
                res.status(401).json({ message: "Unauthorized" });
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); };
