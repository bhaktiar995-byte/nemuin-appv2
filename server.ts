import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = 3000;

const DB_FILE = path.join(process.cwd(), "user_db.json");

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "";

let supabase: any = null;
if (supabaseUrl && supabaseAnonKey && !supabaseUrl.includes("placeholder")) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    console.log("🟢 Supabase client successfully initialized on server-side!");
  } catch (err) {
    console.error("🔴 Failed to initialize Supabase client:", err);
  }
} else {
  console.log("🟠 Supabase credentials not fully configured in env yet. Using local database storage user_db.json as primary.");
}

// Helper to read database
function readDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ users: [] }, null, 2));
    }
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Error reading database file", err);
    return { users: [] };
  }
}

// Helper to write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing to database file", err);
  }
}

async function startServer() {
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API Routes ---
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // User Registration API
  app.post("/api/auth/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email dan password wajib diisi." });
    }

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    // 1. Validate email is @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
    if (!gmailRegex.test(trimmedEmail)) {
      return res.status(400).json({ 
        error: "Registrasi gagal. Email wajib menggunakan alamat @gmail.com yang valid." 
      });
    }

    // 2. Validate password combination (at least 8 chars, uppercase, lowercase, special character, number)
    const isLongEnough = trimmedPassword.length >= 8;
    const hasUpper = /[A-Z]/.test(trimmedPassword);
    const hasLower = /[a-z]/.test(trimmedPassword);
    const hasNumber = /[0-9]/.test(trimmedPassword);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-[\]\\/`~+='";]/.test(trimmedPassword);

    if (!isLongEnough) {
      return res.status(400).json({
        error: "Password tidak aman. Password wajib memiliki minimal 8 karakter."
      });
    }

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      return res.status(400).json({
        error: "Password tidak aman. Password wajib memiliki minimal 1 huruf besar, 1 huruf kecil, 1 angka, dan 1 karakter spesial (!@#$%^&* dll)."
      });
    }

    // Try storing to Supabase first if instance is available
    if (supabase) {
      try {
        // Query to check if user already exists
        const { data: existUser, error: queryError } = await supabase
          .from("users_auth")
          .select("email")
          .eq("email", trimmedEmail)
          .maybeSingle();

        if (queryError) {
          throw queryError;
        }

        if (existUser) {
          return res.status(400).json({ error: "Email ini sudah terdaftar di database Supabase." });
        }

        // Insert user into users_auth table
        const { error: insertError } = await supabase
          .from("users_auth")
          .insert([
            { email: trimmedEmail, password: trimmedPassword, role: "user", created_at: new Date().toISOString() }
          ]);

        if (insertError) {
          throw insertError;
        }

        console.log(`🎉 Successfully registered user ${trimmedEmail} in Supabase!`);
        return res.json({ success: true, email: trimmedEmail, role: 'user', source: "supabase" });

      } catch (err: any) {
        console.error("⚠️ Supabase authentication failed. Falling back to local file storage.", err);
        // If it's a table missing error, or permission error, we show instruction in log
        console.log(`💡 SQL SCHEMA NOTE: If you haven't created the 'users_auth' table in Supabase, run this in SQL Editor:\n
        CREATE TABLE users_auth (
          id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
          email text UNIQUE NOT NULL,
          password text NOT NULL,
          role text DEFAULT 'user' NOT NULL,
          created_at timestamptz DEFAULT now() NOT NULL
        );\n`);
      }
    }

    // Load local database
    const db = readDB();
    const exist = db.users.find((u: any) => u.email.toLowerCase() === trimmedEmail.toLowerCase());
    if (exist) {
      return res.status(400).json({ error: "Email ini sudah terdaftar secara lokal." });
    }

    // Create user locally
    const newUser = {
      email: trimmedEmail,
      password: trimmedPassword,
      role: 'user',
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDB(db);

    res.json({ success: true, email: trimmedEmail, role: 'user', source: "local" });
  });

  // User Login API
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    const trimmedEmail = (email || "").trim();
    const trimmedPassword = (password || "").trim();

    // 1. Check for exact Admin credentials requested:
    // Email: ADMIN NEMUIN 333
    // Password: NEMUIN.APP 2
    if (
      trimmedEmail === 'ADMIN NEMUIN 333' && 
      trimmedPassword === 'NEMUIN.APP 2'
    ) {
      return res.json({ 
        success: true, 
        email: 'ADMIN NEMUIN 333', 
        role: 'admin' 
      });
    }

    // 2. Check for empty login (guest login)
    if (!trimmedEmail && !trimmedPassword) {
      return res.json({ 
        success: true, 
        email: 'Pecinta Kuliner (Guest)', 
        role: 'user',
        isGuest: true
      });
    }

    // Try checking Supabase first if available
    if (supabase) {
      try {
        const { data: foundUser, error: loginErr } = await supabase
          .from("users_auth")
          .select("*")
          .eq("email", trimmedEmail)
          .eq("password", trimmedPassword)
          .maybeSingle();

        if (loginErr) {
          throw loginErr;
        }

        if (foundUser) {
          console.log(`🔑 User ${trimmedEmail} logged in successfully via Supabase!`);
          return res.json({
            success: true,
            email: foundUser.email,
            role: foundUser.role || 'user',
            source: "supabase"
          });
        }
      } catch (err) {
        console.error("⚠️ Supabase login query failed. Trying local database fallback...", err);
      }
    }

    // Local fallback login verify
    const db = readDB();
    const foundUser = db.users.find(
      (u: any) => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === trimmedPassword
    );

    if (!foundUser) {
      return res.status(401).json({ 
        error: "Email atau password salah. Silakan periksa kembali atau buat akun baru." 
      });
    }

    res.json({
      success: true,
      email: foundUser.email,
      role: 'user',
      source: "local"
    });
  });

  // --- Vite / Static Handling ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
