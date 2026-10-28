const sessionTitleInput = document.getElementById("sessionTitle");
const createSessionBtn = document.getElementById("createSessionBtn");
const qrContainer = document.getElementById("qrContainer");
const qrImage = document.getElementById("qrImage");
const sessionTokenText = document.getElementById("sessionTokenText");
const studentSelect = document.getElementById("studentSelect");
const startScanBtn = document.getElementById("startScanBtn");
const scanMessage = document.getElementById("scanMessage");
const attendanceList = document.getElementById("attendanceList");

let currentSession = null;
let html5QrCode = null;

async function loadStudents() {
  const res = await fetch("/api/users");
  const users = await res.json();

  studentSelect.innerHTML = "";

  users.forEach((user) => {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = `${user.name} (${user.id})`;
    studentSelect.appendChild(option);
  });
}

async function createSession() {
  const title = sessionTitleInput.value.trim();

  if (!title) {
    alert("Please enter a session title");
    return;
  }

  const res = await fetch("/api/session/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to create session");
    return;
  }

  currentSession = data.session;

  qrImage.src = data.qrDataUrl;
  sessionTokenText.textContent = `Session Token: ${currentSession.token}`;
  qrContainer.classList.remove("hidden");

  loadAttendanceReport(currentSession.id);
}

async function markAttendance(sessionToken, userId) {
  const res = await fetch("/api/attendance/mark", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ sessionToken, userId })
  });

  const data = await res.json();

  if (res.ok) {
    scanMessage.textContent = `Attendance marked for ${data.record.userName}`;
  } else {
    scanMessage.textContent = data.message || "Unable to mark attendance";
  }

  if (currentSession) {
    loadAttendanceReport(currentSession.id);
  }
}

async function loadAttendanceReport(sessionId) {
  if (!sessionId) return;

  const res = await fetch(`/api/attendance/${sessionId}`);
  const records = await res.json();

  attendanceList.innerHTML = "";

  if (!records.length) {
    attendanceList.innerHTML = "<p>No attendance marked yet.</p>";
    return;
  }

  records.forEach((record) => {
    const div = document.createElement("div");
    div.className = "attendance-item";
    div.textContent = `${record.userName} - ${new Date(record.markedAt).toLocaleString()}`;
    attendanceList.appendChild(div);
  });
}

function setupScanner() {
  startScanBtn.addEventListener("click", async () => {
    if (!currentSession) {
      alert("Please create a session first.");
      return;
    }

    if (html5QrCode && html5QrCode.isScanning) {
      await html5QrCode.stop();
    }

    const readerElement = document.getElementById("reader");

    html5QrCode = new Html5Qrcode("reader");
    html5QrCode
      .start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          const userId = studentSelect.value;
          if (!userId) {
            scanMessage.textContent = "Please select a student";
            return;
          }

          markAttendance(decodedText, userId);
          html5QrCode.stop().catch(() => {});
        },
        (errorMessage) => {
          // Ignore scanning errors
        }
      )
      .catch((err) => {
        scanMessage.textContent = "Camera access failed or scanner error";
      });
  });
}

createSessionBtn.addEventListener("click", createSession);

loadStudents();
setupScanner();