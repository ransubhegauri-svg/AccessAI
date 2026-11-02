/**
 * AccessAI Ultra-Lightweight Cross-Device Signaling & Relay Server
 * Uses native Node.js HTTP & Server-Sent Events (SSE). Zero external npm dependencies.
 *
 * Facilitates real-time WebRTC SDP/ICE signaling, continuous speech captions,
 * dynamic participant presence, and two-way meeting chat across physically separate devices.
 */

const http = require("http");

const PORT = process.env.PORT || 5001;
const rooms = new Map(); // Map<meetingId, Map<userId, http.ServerResponse>>

const server = http.createServer((req, res) => {
  // Global CORS headers for cross-device LAN access
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Cache-Control, Accept");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // 1. Health check & status
  if (url.pathname === "/health" || url.pathname === "/") {
    const roomSummaries = {};
    rooms.forEach((clients, rId) => {
      roomSummaries[rId] = clients.size;
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      status: "ok",
      service: "AccessAI Signaling & Caption Bus",
      activeRooms: rooms.size,
      rooms: roomSummaries,
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // 2. Server-Sent Events (SSE) Stream: GET /events?room=<roomId>&userId=<userId>
  if (url.pathname === "/events") {
    const meetingId = url.searchParams.get("room") || "accessai-room-402";
    const userId = url.searchParams.get("userId") || `client-${Date.now()}`;

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive"
    });

    if (!rooms.has(meetingId)) {
      rooms.set(meetingId, new Map());
    }
    const clients = rooms.get(meetingId);
    clients.set(userId, res);

    console.log(`[SignalingServer] Client joined: room=${meetingId}, userId=${userId} (Total: ${clients.size})`);

    // Acknowledge connection
    res.write(`data: ${JSON.stringify({
      messageType: "system_connected",
      meetingId,
      userId,
      activePeers: clients.size,
      timestamp: new Date().toISOString()
    })}\n\n`);

    // Keep-alive heartbeat every 15 seconds
    const heartbeat = setInterval(() => {
      try {
        res.write(": heartbeat\n\n");
      } catch (err) {
        clearInterval(heartbeat);
      }
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      clients.delete(userId);
      console.log(`[SignalingServer] Client left: room=${meetingId}, userId=${userId} (Remaining: ${clients.size})`);
      if (clients.size === 0) {
        rooms.delete(meetingId);
      }
    });
    return;
  }

  // 3. Broadcast message / WebRTC signal: POST /message
  if (url.pathname === "/message" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      // Guard against huge payload attacks
      if (body.length > 5000000) {
        res.writeHead(413, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Payload too large" }));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);
        const meetingId = data.meetingId || "accessai-room-402";
        const senderId = data.senderId;
        const targetId = data.targetId;

        const clients = rooms.get(meetingId);
        let deliveredCount = 0;

        if (clients && clients.size > 0) {
          const ssePayload = `data: ${JSON.stringify(data)}\n\n`;

          clients.forEach((clientRes, uId) => {
            // If targeted signal, only send to specified target or broadcast
            if (targetId && targetId !== "broadcast" && targetId !== uId) {
              return;
            }

            // Omit echo to sender if desired, but clients have deduplication
            if (uId !== senderId) {
              try {
                clientRes.write(ssePayload);
                deliveredCount++;
              } catch (err) {
                clients.delete(uId);
              }
            }
          });
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          meetingId,
          deliveredTo: deliveredCount
        }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON payload", details: err.message }));
      }
    });
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`[AccessAI Signaling Server] Listening on http://0.0.0.0:${PORT}`);
});

