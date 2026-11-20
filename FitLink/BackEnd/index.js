const path = require("path");
const bcrypt = require("bcryptjs");
const express = require("express");
const { pool, withTransaction } = require("./db");
const products = require("./products.json");

const app = express();
const projectRoot = path.resolve(__dirname, "..");
const challengePoints = new Map([
  [1, 50],
  [2, 30],
  [3, 70]
]);

app.use(express.json({ limit: "4mb" }));

function publicUser(row) {
  return {
    username: row.username,
    email: row.email,
    age: row.age,
    role: row.role,
    sports: row.sports,
    country: row.country,
    ...(row.role === "trainee" || row.role === "متدرب"
      ? { points: row.points }
      : {})
  };
}

function publicAcademy(row) {
  return {
    ...row.data,
    id: row.id,
    coachUsername: row.coach_username
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

app.post("/api/register", async (req, res) => {
  const { username, email, password, age, role, sports, country, points } = req.body;
  if (
    !isNonEmptyString(username) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(password) ||
    password.length < 8 ||
    !isNonEmptyString(String(age || "")) ||
    !isNonEmptyString(role) ||
    !Array.isArray(sports) ||
    sports.length === 0
  ) {
    return res.status(400).json({ message: "يرجى ملء جميع الحقول المطلوبة." });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, age, role, sports, country, points)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING username, email, age, role, sports, country, points`,
      [
        username.trim(),
        email.trim(),
        passwordHash,
        String(age),
        role,
        JSON.stringify(sports),
        country || null,
        role === "trainee" || role === "متدرب"
          ? Number.isInteger(points) && points >= 0
            ? points
            : 0
          : 0
      ]
    );
    return res.status(201).json({ message: "تم التسجيل بنجاح", user: publicUser(result.rows[0]) });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "اسم المستخدم أو البريد الإلكتروني موجود بالفعل." });
    }
    throw error;
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (!isNonEmptyString(username) || !isNonEmptyString(password)) {
    return res.status(400).json({ error: "يرجى إدخال اسم المستخدم وكلمة المرور." });
  }

  const result = await pool.query(
    `SELECT username, email, age, role, sports, country, points, password_hash
     FROM users
     WHERE username = $1 OR email = $1
     LIMIT 1`,
    [username.trim()]
  );
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: "بيانات الدخول غير صحيحة" });
  }
  return res.json(publicUser(user));
});

app.post("/api/academies", async (req, res) => {
  const academy = req.body;
  const coachUsername = academy.coachUsername;
  if (!isNonEmptyString(academy.name) || !isNonEmptyString(coachUsername)) {
    return res.status(400).json({ message: "بيانات الأكاديمية غير مكتملة." });
  }

  const data = { ...academy };
  delete data.id;
  const result = await pool.query(
    `INSERT INTO academies (coach_username, data)
     SELECT $1, $2
     WHERE EXISTS (SELECT 1 FROM users WHERE username = $1)
     RETURNING id, coach_username, data`,
    [coachUsername, JSON.stringify(data)]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "المستخدم غير موجود." });
  }
  return res.status(201).json(publicAcademy(result.rows[0]));
});

app.get("/api/academies", async (_req, res) => {
  const result = await pool.query(
    "SELECT id, coach_username, data FROM academies ORDER BY id"
  );
  return res.json(result.rows.map(publicAcademy));
});

app.get("/api/products", (_req, res) => {
  return res.json(products);
});

app.post("/api/check-email", async (req, res) => {
  const { email, username } = req.body;
  if (!isNonEmptyString(email)) {
    return res.status(400).json({ message: "يرجى إدخال البريد الإلكتروني." });
  }
  const result = await pool.query(
    `SELECT EXISTS (
       SELECT 1 FROM users
       WHERE email = $1 AND username <> COALESCE($2, '')
     ) AS exists`,
    [email.trim(), username || ""]
  );
  return res.json({ available: !result.rows[0].exists });
});

app.post("/api/update-user", async (req, res) => {
  const { username, email, age, sports, password, country } = req.body;
  if (
    !isNonEmptyString(username) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(String(age || "")) ||
    !Array.isArray(sports) ||
    sports.length === 0 ||
    (password && (typeof password !== "string" || password.length < 8))
  ) {
    return res.status(400).json({ success: false, message: "بيانات غير صالحة." });
  }

  const passwordHash = password ? await bcrypt.hash(password, 12) : null;
  try {
    const result = await pool.query(
      `UPDATE users
       SET email = $2, age = $3, sports = $4, country = $5,
           password_hash = COALESCE($6, password_hash)
       WHERE username = $1
       RETURNING username`,
      [
        username,
        email.trim(),
        String(age),
        JSON.stringify(sports),
        country || null,
        passwordHash
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "المستخدم غير موجود." });
    }
    return res.json({ success: true });
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ success: false, message: "البريد الإلكتروني مستخدم بالفعل." });
    }
    throw error;
  }
});

app.post("/api/delete-user", async (req, res) => {
  const { username } = req.body;
  if (!isNonEmptyString(username)) {
    return res.status(400).json({ success: false, message: "يرجى إرسال اسم المستخدم." });
  }
  await pool.query("DELETE FROM users WHERE username = $1", [username]);
  return res.json({ success: true });
});

app.post("/api/update-academy", async (req, res) => {
  const academy = req.body;
  if (!academy.id || !isNonEmptyString(academy.coachUsername)) {
    return res.status(400).json({ success: false, message: "بيانات الأكاديمية غير صالحة." });
  }

  const result = await pool.query(
    `UPDATE academies
     SET data = $3
     WHERE id = $1 AND coach_username = $2
     RETURNING id`,
    [academy.id, academy.coachUsername, JSON.stringify(academy)]
  );
  if (result.rowCount === 0) {
    return res.json({
      success: false,
      message: "الأكاديمية غير موجودة أو ليس لديك صلاحية التعديل."
    });
  }
  return res.json({ success: true });
});

app.post("/api/update-user-points", async (req, res) => {
  const { username, points } = req.body;
  if (!isNonEmptyString(username) || !Number.isInteger(points) || points < 0) {
    return res.status(400).json({ message: "بيانات غير صالحة." });
  }
  const result = await pool.query(
    "UPDATE users SET points = $2 WHERE username = $1 RETURNING points",
    [username, points]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "المستخدم غير موجود." });
  }
  return res.json({ success: true });
});

app.get("/api/get-user", async (req, res) => {
  const { username } = req.query;
  if (!isNonEmptyString(username)) {
    return res.status(400).json({ message: "يرجى إرسال اسم المستخدم." });
  }
  const result = await pool.query(
    `SELECT username, email, age, role, sports, country, points
     FROM users WHERE username = $1`,
    [username]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ message: "المستخدم غير موجود." });
  }
  return res.json(publicUser(result.rows[0]));
});

app.get("/api/user-challenges", async (req, res) => {
  const { username } = req.query;
  if (!isNonEmptyString(username)) {
    return res.status(400).json({ message: "يرجى إرسال اسم المستخدم." });
  }
  const result = await pool.query(
    `SELECT challenge_id FROM user_challenges
     WHERE username = $1 ORDER BY challenge_id`,
    [username]
  );
  return res.json(result.rows.map((row) => row.challenge_id));
});

app.post("/api/complete-challenge", async (req, res) => {
  const { username, challengeId } = req.body;
  const points = challengePoints.get(challengeId);
  if (!isNonEmptyString(username) || !points) {
    return res.status(400).json({ message: "بيانات غير صالحة." });
  }

  const result = await withTransaction(async (client) => {
    const user = await client.query(
      "SELECT points FROM users WHERE username = $1 FOR UPDATE",
      [username]
    );
    if (user.rowCount === 0) {
      return { missingUser: true };
    }

    const inserted = await client.query(
      `INSERT INTO user_challenges (username, challenge_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING
       RETURNING challenge_id`,
      [username, challengeId]
    );
    if (inserted.rowCount === 0) {
      return { points: user.rows[0].points };
    }

    const updated = await client.query(
      "UPDATE users SET points = points + $2 WHERE username = $1 RETURNING points",
      [username, points]
    );
    return { points: updated.rows[0].points };
  });
  if (result.missingUser) {
    return res.status(404).json({ message: "المستخدم غير موجود." });
  }
  return res.json({ points: result.points });
});

app.get("/api/weekly-reward-status", async (req, res) => {
  const { username } = req.query;
  if (!isNonEmptyString(username)) {
    return res.status(400).json({ message: "يرجى إرسال اسم المستخدم." });
  }
  const result = await pool.query(
    "SELECT EXISTS (SELECT 1 FROM weekly_rewards WHERE username = $1) AS taken",
    [username]
  );
  return res.json({ taken: result.rows[0].taken });
});

app.post("/api/take-weekly-reward", async (req, res) => {
  const { username } = req.body;
  if (!isNonEmptyString(username)) {
    return res.status(400).json({ message: "بيانات غير صالحة." });
  }

  const result = await withTransaction(async (client) => {
    const user = await client.query(
      "SELECT username FROM users WHERE username = $1 FOR UPDATE",
      [username]
    );
    if (user.rowCount === 0) {
      return { missingUser: true };
    }

    const reward = await client.query(
      `INSERT INTO weekly_rewards (username)
       VALUES ($1)
       ON CONFLICT DO NOTHING
       RETURNING username`,
      [username]
    );
    if (reward.rowCount === 0) {
      return { alreadyTaken: true };
    }

    await client.query(
      "UPDATE users SET points = points + 200 WHERE username = $1",
      [username]
    );
    return { success: true };
  });
  if (result.missingUser) {
    return res.status(404).json({ message: "المستخدم غير موجود." });
  }
  if (result.alreadyTaken) {
    return res.json({ message: "تم أخذ الجائزة بالفعل." });
  }
  return res.json({ success: true });
});

app.get("/", (_req, res) => res.redirect("/HTML/index.html"));
app.use(express.static(path.join(projectRoot, "public"), { index: false }));

app.use((error, _req, res, _next) => {
  console.error("Request failed:", error);
  if (res.headersSent) {
    return;
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "حجم البيانات المرسلة كبير جدًا. يرجى اختيار صورة أصغر."
    });
  }
  return res.status(500).json({ message: "حدث خطأ في الخادم." });
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`FitLink server listening on port ${port}`);
  });
}

module.exports = app;
