const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { pool, withTransaction } = require("./db");

const dataDirectory = __dirname;

function readJson(filename, fallback) {
  const file = path.join(dataDirectory, filename);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : fallback;
}

async function importLegacyData() {
  const users = readJson("users.json", []);
  const academies = readJson("academies.json", []);
  const subscriptions = readJson("subscriptions.json", []);
  const userChallenges = readJson("user_challenges.json", {});
  const weeklyRewards = readJson("weekly_rewards.json", {});
  let importedUsers = 0;
  let importedAcademies = 0;
  let skippedRecords = 0;

  await withTransaction(async (client) => {
    for (const user of users) {
      if (!user.username || !user.email || !user.age || !user.role) {
        throw new Error("A legacy user record is missing required fields.");
      }
      const passwordHash =
        user.password_hash ||
        (user.password ? await bcrypt.hash(user.password, 12) : null);
      if (!passwordHash) {
        throw new Error(`Legacy user "${user.username}" has no password to migrate.`);
      }

      const result = await client.query(
        `INSERT INTO users (username, email, password_hash, age, role, sports, country, points)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (username) DO NOTHING
         RETURNING username`,
        [
          user.username,
          user.email,
          passwordHash,
          String(user.age),
          user.role,
          JSON.stringify(Array.isArray(user.sports) ? user.sports : []),
          user.country || null,
          Number.isInteger(user.points) && user.points >= 0 ? user.points : 0
        ]
      );
      importedUsers += result.rowCount;
    }

    const userRows = await client.query("SELECT username FROM users");
    const usernames = new Set(userRows.rows.map((row) => row.username));

    for (const academy of academies) {
      const data = { ...academy };
      delete data.id;
      const owner = usernames.has(academy.coachUsername)
        ? academy.coachUsername
        : null;
      const result = Number.isSafeInteger(Number(academy.id))
        ? await client.query(
            `INSERT INTO academies (id, coach_username, data)
             VALUES ($1, $2, $3)
             ON CONFLICT (id) DO NOTHING
             RETURNING id`,
            [Number(academy.id), owner, JSON.stringify(data)]
          )
        : await client.query(
            `INSERT INTO academies (coach_username, data)
             VALUES ($1, $2)
             RETURNING id`,
            [owner, JSON.stringify(data)]
          );
      importedAcademies += result.rowCount;
    }

    const academyRows = await client.query("SELECT id FROM academies");
    const academyIds = new Set(academyRows.rows.map((row) => String(row.id)));

    for (const subscription of subscriptions) {
      if (!usernames.has(subscription.username)) {
        skippedRecords += 1;
        continue;
      }
      const academyId = academyIds.has(String(subscription.academyId))
        ? subscription.academyId
        : null;
      const subscribedAt = subscription.subscribeDate
        ? new Date(subscription.subscribeDate)
        : new Date();
      if (Number.isNaN(subscribedAt.getTime())) {
        throw new Error("A legacy subscription has an invalid subscribeDate.");
      }
      await client.query(
        `INSERT INTO subscriptions (username, academy_id, subscribe_date, data)
         SELECT $1, $2, $3, $4
         WHERE NOT EXISTS (
           SELECT 1 FROM subscriptions WHERE username = $1 AND data = $4
         )`,
        [
          subscription.username,
          academyId,
          subscribedAt,
          JSON.stringify(subscription)
        ]
      );
    }

    for (const [username, ids] of Object.entries(userChallenges)) {
      if (!usernames.has(username) || !Array.isArray(ids)) {
        skippedRecords += 1;
        continue;
      }
      for (const challengeId of ids) {
        await client.query(
          `INSERT INTO user_challenges (username, challenge_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [username, challengeId]
        );
      }
    }

    for (const [username, claimed] of Object.entries(weeklyRewards)) {
      if (claimed) {
        if (!usernames.has(username)) {
          skippedRecords += 1;
          continue;
        }
        await client.query(
          `INSERT INTO weekly_rewards (username)
           VALUES ($1)
           ON CONFLICT DO NOTHING`,
          [username]
        );
      }
    }

    await client.query(
      `SELECT setval(
         pg_get_serial_sequence('academies', 'id'),
         GREATEST(COALESCE((SELECT MAX(id) FROM academies), 1), 1),
         EXISTS (SELECT 1 FROM academies)
       )`
    );
  });

  console.log(
    `Legacy import complete: ${importedUsers} users and ${importedAcademies} academies imported; ${skippedRecords} records skipped because their users were missing or invalid.`
  );
}

importLegacyData()
  .catch((error) => {
    console.error("Legacy data import failed:", error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
