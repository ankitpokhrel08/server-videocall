// import { Server } from "socket.io";

// import "dotenv/config";

// const io = new Server(process.env.PORT, {
//   cors: true,
// });

// const emailToSocketIdMap = new Map();
// const socketIdToEmailMap = new Map();

// console.log("Server started", process.env.PORT);

// io.on("connection", (socket) => {
//   console.log("Socket connected", socket.id);
//   socket.on("join-room", ({ room, email }) => {
//     console.log("Joining room", room, email);
//     emailToSocketIdMap.set(email, socket.id);
//     socketIdToEmailMap.set(socket.id, email);

//     io.to(room).emit("user:joined", { email, id: socket.id });
//     socket.join(room);

//     io.to(socket.id).emit("join-room", { room, email });
//   });
//   socket.on("user:call", ({ to, offer }) => {
//     io.to(to).emit("incoming:call", { from: socket.id, offer });
//   });

//   socket.on("call:accepted", ({ to, ans }) => {
//     io.to(to).emit("call:accepted", { from: socket.id, ans });
//   });

//   socket.on("peer:nego:needed", ({ offer, to }) => {
//     io.to(to).emit("peer:nego:needed", { offer, from: socket.id });
//   });

//   socket.on("peer:nego:done", ({ to, ans }) => {
//     io.to(to).emit("peer:nego:final", { from: socket.id, ans });
//   });
// });

import { Server } from "socket.io";
import "dotenv/config";

const io = new Server(process.env.PORT, {
  cors: true,
});

const emailToSocketIdMap = new Map();
const socketIdToEmailMap = new Map();

console.log("Server started", process.env.PORT);

io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);

  // User joining room
  socket.on("join-room", ({ room, email }) => {
    console.log("Joining room", room, email);
    emailToSocketIdMap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);

    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);

    io.to(socket.id).emit("join-room", { room, email });
  });

  // Call initiation
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  // Call accepted, send answer
  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  // Peer negotiation needed (for cases like when renegotiation is required)
  socket.on("peer:nego:needed", ({ offer, to }) => {
    io.to(to).emit("peer:nego:needed", { offer, from: socket.id });
  });

  // Peer negotiation done (finalizing the negotiation)
  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

  // Handle ICE candidates (relay candidates between peers)
  socket.on("new-ice-candidate", (candidate) => {
    // Emit the ICE candidate to the other peer
    socket.to(socket.id).emit("new-ice-candidate", candidate);
  });

  // Disconnect user and clean up mappings when a socket disconnects
  socket.on("disconnect", () => {
    const email = socketIdToEmailMap.get(socket.id);
    console.log("Socket disconnected", socket.id, email);
    emailToSocketIdMap.delete(email);
    socketIdToEmailMap.delete(socket.id);
  });
});
