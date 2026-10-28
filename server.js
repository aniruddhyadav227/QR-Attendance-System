const express = require("express");
const path = require("path");
const qr = require("qrcode");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let users = [
  { id: "S101", name: "Amit Sharma", role: "student" },
  { id: "S102", name: "Neha Verma", role: "student" },
  { id: "S103", name: "Rohit Kumar", role: "student" },
  { id: "S104", name: "Pooja Singh", role: "student" }
];

let sessions = [];
let attendance = [];

function generateToken() {
  return uuidv4().slice(0, 8);
}

app.get("/api/users", (req, res) => {
  res.json(users);
});

app.post("/api/session/create", async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Session title is required" });
  }

  const token = generateToken();

  const session = {
    id: uuidv4(),
    title,
    token,
    createdAt: new Date().toISOString()
  };

  sessions.push(session);

  try {
    const qrDataUrl = await qr.toDataURL(token);

    res.json({
      message: "Session created successfully",
      session,
      qrDataUrl
    });
  } catch (err) {
    res.status(500).json({ message: "Error generating QR code", error: err.message });
  }
});

app.get("/api/session/:token", (req, res) => {
  const session = sessions.find((s) => s.token === req.params.token);
  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }
  res.json(session);
});

app.post("/api/attendance/mark", (req, res) => {
  const { sessionToken, userId } = req.body;

  if (!sessionToken || !userId) {
    return res.status(400).json({ message: "Session token and user ID are required" });
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const session = sessions.find((s) => s.token === sessionToken);
  if (!session) {
    return res.status(404).json({ message: "Invalid session token" });
  }

  const alreadyMarked = attendance.some(
    (record) => record.sessionId === session.id && record.userId === userId
  );

  if (alreadyMarked) {
    return res.status(409).json({ message: "Attendance already marked for this session" });
  }

  const record = {
    id: uuidv4(),
    sessionId: session.id,
    sessionTitle: session.title,
    userId: user.id,
    userName: user.name,
    markedAt: new Date().toISOString()
  };

  attendance.push(record);

  res.json({
    message: "Attendance marked successfully",
    record
  });
});

app.get("/api/attendance/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;
  const records = attendance.filter((a) => a.sessionId === sessionId);

  res.json(records);
});

app.get("/api/attendance", (req, res) => {
  res.json(attendance);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});