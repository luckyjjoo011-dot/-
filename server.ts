import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.sqlite");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    service TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed default settings if not exists
const seedSettings = db.prepare("INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)");
seedSettings.run("primary_color", "#88B04B"); // Warm Olive/Green
seedSettings.run("site_name", "고마움의 운명상담소");
seedSettings.run("hero_title", "당신의 운명을 조용히 비추는\n따뜻한 상담");

// Seed sample posts
const postCount = db.prepare("SELECT COUNT(*) as count FROM posts").get() as { count: number };
if (postCount.count === 0) {
  const insertPost = db.prepare("INSERT INTO posts (title, content, category, image_url) VALUES (?, ?, ?, ?)");
  insertPost.run("2025년 병오년 당신의 운세는?", "붉은 말의 해를 맞아 각 띠별 운세와 개운법을 알려드립니다.", "운세정보", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=800");
  insertPost.run("타로 카드로 보는 나의 심리 상태", "최근 스트레스가 많으신가요? 숲의 평온함을 닮은 타로를 통해 내면의 소리에 귀 기울여 보세요.", "타로이야기", "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800");
  insertPost.run("사주명리학 개강 안내", "기초부터 탄탄하게 배우는 사주 명리학 8주 과정을 모집합니다. 자연의 섭리를 함께 공부해요.", "교육공지", "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&q=80&w=800");
} else {
  // Update existing sample posts if they have old titles or content
  db.prepare("UPDATE posts SET title = ?, content = ? WHERE title = ?").run("2025년 병오년 당신의 운세는?", "붉은 말의 해를 맞아 각 띠별 운세와 개운법을 알려드립니다.", "2024년 갑진년, 당신의 운세는?");
  db.prepare("UPDATE posts SET content = ? WHERE title = ?").run("붉은 말의 해를 맞아 각 띠별 운세와 개운법을 알려드립니다.", "2025년 병오년 당신의 운세는?");
  db.prepare("UPDATE posts SET title = ? WHERE title = ?").run("사주명리학 개강 안내", "사주 명리학 초급 과정 개강 안내");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/posts", (req, res) => {
    const posts = db.prepare("SELECT * FROM posts ORDER BY created_at DESC").all();
    res.json(posts);
  });

  app.post("/api/posts", (req, res) => {
    const { title, content, category, image_url } = req.body;
    const info = db.prepare("INSERT INTO posts (title, content, category, image_url) VALUES (?, ?, ?, ?)").run(title, content, category, image_url);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/posts/:id", (req, res) => {
    db.prepare("DELETE FROM posts WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  app.get("/api/settings", (req, res) => {
    const settings = db.prepare("SELECT * FROM settings").all();
    const settingsObj = settings.reduce((acc: any, curr: any) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsObj);
  });

  app.post("/api/settings", (req, res) => {
    const { settings } = req.body;
    const update = db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)");
    for (const [key, value] of Object.entries(settings)) {
      update.run(key, value as string);
    }
    res.json({ success: true });
  });

  // Booking Routes
  app.get("/api/bookings", (req, res) => {
    const bookings = db.prepare("SELECT * FROM bookings ORDER BY created_at DESC").all();
    res.json(bookings);
  });

  app.post("/api/bookings", (req, res) => {
    const { name, phone, service, date, time, message } = req.body;
    const info = db.prepare("INSERT INTO bookings (name, phone, service, date, time, message) VALUES (?, ?, ?, ?, ?, ?)").run(name, phone, service, date, time, message);
    res.json({ id: info.lastInsertRowid });
  });

  app.patch("/api/bookings/:id", (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/bookings/:id", (req, res) => {
    db.prepare("DELETE FROM bookings WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
