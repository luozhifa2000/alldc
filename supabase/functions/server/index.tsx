import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const app = new Hono();

// Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://vhrzyhqnlngrtvfedzmr.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("SUPABASE_ANON_KEY") || "";

console.log("Initializing Supabase client...");
console.log("URL:", supabaseUrl);
console.log("Key exists:", !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify JWT token
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  c.set("token", token);

  // Decode token to get user ID (simplified - in production use proper JWT verification)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    c.set("userId", payload.userId);
  } catch (e) {
    return c.json({ error: "Invalid token" }, 401);
  }

  await next();
};

// Health check endpoint
app.get("/make-server-4f970b1f/health", (c) => {
  return c.json({ status: "ok" });
});

// ============ AUTH ROUTES ============

// Register
app.post("/server/auth/register", async (c) => {
  try {
    console.log("Register endpoint called");
    const body = await c.req.json();
    console.log("Request body:", { email: body.email, nickname: body.nickname });

    const { email, nickname, password } = body;

    // Validate input
    if (!email || !nickname || !password) {
      console.log("Missing required fields");
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (password.length < 6) {
      console.log("Password too short");
      return c.json({ error: "Password must be at least 6 characters" }, 400);
    }

    // Check if user exists
    console.log("Checking if user exists...");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking user:", checkError);
    }

    if (existingUser) {
      console.log("User already exists");
      return c.json({ error: "Email already registered" }, 400);
    }

    // Hash password
    console.log("Hashing password...");
    const passwordHash = await bcrypt.hash(password);

    // Create user
    console.log("Creating user...");
    const { data: user, error } = await supabase
      .from("users")
      .insert({
        email,
        nickname,
        passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return c.json({ error: "Failed to create user", details: error.message }, 500);
    }

    console.log("User created successfully:", user.id);

    // Create simple JWT token (in production, use proper JWT library)
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    return c.json({ error: "Internal server error", details: error.message }, 500);
  }
});

// Login with password
app.post("/server/auth/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Missing email or password" }, 400);
    }

    // Get user
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    // Create token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Send verification code
app.post("/server/auth/send-code", async (c) => {
  try {
    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email is required" }, 400);
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save code to database
    const { error } = await supabase
      .from("email_verification_codes")
      .insert({
        email,
        code,
        expiresAt: expiresAt.toISOString(),
      });

    if (error) {
      console.error("Error saving verification code:", error);
      return c.json({ error: "Failed to send code" }, 500);
    }

    // In production, send email here
    // For now, just return the code (REMOVE IN PRODUCTION!)
    console.log(`Verification code for ${email}: ${code}`);

    return c.json({
      message: "Verification code sent",
      // REMOVE THIS IN PRODUCTION - only for testing
      code: code
    });
  } catch (error) {
    console.error("Send code error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Verify code and login
app.post("/server/auth/verify-code", async (c) => {
  try {
    const { email, code } = await c.req.json();

    if (!email || !code) {
      return c.json({ error: "Email and code are required" }, 400);
    }

    // Check code
    const { data: verificationCode, error: codeError } = await supabase
      .from("email_verification_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .eq("used", false)
      .gt("expiresAt", new Date().toISOString())
      .order("createdAt", { ascending: false })
      .limit(1)
      .single();

    if (codeError || !verificationCode) {
      return c.json({ error: "Invalid or expired code" }, 401);
    }

    // Mark code as used
    await supabase
      .from("email_verification_codes")
      .update({ used: true })
      .eq("id", verificationCode.id);

    // Get or create user
    let { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (!user) {
      // Create new user with email login
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          email,
          nickname: email.split('@')[0],
          passwordHash: await bcrypt.hash(Math.random().toString(36)),
        })
        .select()
        .single();

      if (createError) {
        return c.json({ error: "Failed to create user" }, 500);
      }
      user = newUser;
    }

    // Create token
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email }));

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get current user
app.get("/server/auth/me", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, nickname, createdAt")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return c.json({ error: "User not found" }, 404);
    }

    return c.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// ============ MOMENTS ROUTES ============

// Get all moments for user
app.get("/server/moments", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const page = parseInt(c.req.query("page") || "1");
    const limit = parseInt(c.req.query("limit") || "15");
    const offset = (page - 1) * limit;

    const { data: moments, error } = await supabase
      .from("moments")
      .select(`
        *,
        images:moment_images(imageUrl, sortOrder)
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching moments:", error);
      return c.json({ error: "Failed to fetch moments" }, 500);
    }

    // Get total count
    const { count } = await supabase
      .from("moments")
      .select("*", { count: "exact", head: true })
      .eq("userId", userId);

    return c.json({
      moments,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error("Get moments error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get single moment
app.get("/server/moments/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const momentId = c.req.param("id");

    const { data: moment, error } = await supabase
      .from("moments")
      .select(`
        *,
        images:moment_images(imageUrl, sortOrder)
      `)
      .eq("id", momentId)
      .eq("userId", userId)
      .single();

    if (error || !moment) {
      return c.json({ error: "Moment not found" }, 404);
    }

    return c.json({ moment });
  } catch (error) {
    console.error("Get moment error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Create moment
app.post("/server/moments", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const { shortDescription, richContent, impactPercent, impactType, images } = await c.req.json();

    if (!richContent || impactPercent === undefined || !impactType) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Extract text preview from richContent
    let textPreview = "";
    try {
      const content = JSON.parse(richContent);
      const textBlocks = content.filter((block: any) => block.type === "text");
      textPreview = textBlocks.map((block: any) => block.content).join(" ").slice(0, 200);
    } catch (e) {
      // If richContent is not JSON, use it as is
      textPreview = richContent.slice(0, 200);
    }

    // Create moment
    const { data: moment, error: momentError } = await supabase
      .from("moments")
      .insert({
        userId,
        shortDescription,
        richContent,
        textPreview,
        impactPercent,
        impactType,
      })
      .select()
      .single();

    if (momentError) {
      console.error("Error creating moment:", momentError);
      return c.json({ error: "Failed to create moment" }, 500);
    }

    // Add images if provided
    if (images && images.length > 0) {
      const imageRecords = images.map((url: string, index: number) => ({
        momentId: moment.id,
        imageUrl: url,
        sortOrder: index,
      }));

      await supabase.from("moment_images").insert(imageRecords);
    }

    return c.json({ moment });
  } catch (error) {
    console.error("Create moment error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Update moment
app.put("/server/moments/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const momentId = c.req.param("id");
    const updates = await c.req.json();

    // Verify ownership
    const { data: existing } = await supabase
      .from("moments")
      .select("id")
      .eq("id", momentId)
      .eq("userId", userId)
      .single();

    if (!existing) {
      return c.json({ error: "Moment not found" }, 404);
    }

    const { data: moment, error } = await supabase
      .from("moments")
      .update(updates)
      .eq("id", momentId)
      .select()
      .single();

    if (error) {
      return c.json({ error: "Failed to update moment" }, 500);
    }

    return c.json({ moment });
  } catch (error) {
    console.error("Update moment error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Delete moment
app.delete("/server/moments/:id", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const momentId = c.req.param("id");

    // Verify ownership
    const { data: existing } = await supabase
      .from("moments")
      .select("id")
      .eq("id", momentId)
      .eq("userId", userId)
      .single();

    if (!existing) {
      return c.json({ error: "Moment not found" }, 404);
    }

    const { error } = await supabase
      .from("moments")
      .delete()
      .eq("id", momentId);

    if (error) {
      return c.json({ error: "Failed to delete moment" }, 500);
    }

    return c.json({ message: "Moment deleted successfully" });
  } catch (error) {
    console.error("Delete moment error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

// Get life progress
app.get("/server/moments/progress", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");

    // Get all moments ordered by creation date
    const { data: moments, error } = await supabase
      .from("moments")
      .select("impactPercent, impactType, createdAt")
      .eq("userId", userId)
      .order("createdAt", { ascending: true });

    if (error) {
      return c.json({ error: "Failed to fetch moments" }, 500);
    }

    // Calculate life progress using compounding formula
    let progress = 1.0;
    for (const moment of moments || []) {
      const impact = moment.impactPercent / 100;
      const signedImpact = moment.impactType === "POSITIVE" ? impact : -impact;
      progress = progress * (1 + signedImpact);
    }

    // Get user creation date
    const { data: user } = await supabase
      .from("users")
      .select("createdAt")
      .eq("id", userId)
      .single();

    return c.json({
      progress,
      startDate: user?.createdAt,
      totalMoments: moments?.length || 0,
    });
  } catch (error) {
    console.error("Get progress error:", error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

Deno.serve(app.fetch);