import "dotenv/config";
import pg from "pg";
import { hashPassword } from "../src/lib/auth-utils";

function createId() {
  return "c" + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const databaseUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log(`⏳ Creating/updating admin user: ${email}...`);

    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO "User" ("id", "email", "password", "role", "name", "username", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'ADMIN'::"Role", 'Administrator', 'admin', NOW(), NOW())
      ON CONFLICT ("email") DO UPDATE SET
        "password" = EXCLUDED."password",
        "role" = 'ADMIN'::"Role",
        "updatedAt" = NOW()
      RETURNING "email";
    `;

    const res = await pool.query(query, [createId(), email, hashedPassword]);
    console.log(`✅ Admin user successfully created/updated: ${res.rows[0].email}`);
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();