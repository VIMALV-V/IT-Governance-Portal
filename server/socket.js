let io;

module.exports = {
  init: (httpServer) => {
    const { Server } = require("socket.io");
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
      }
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      console.warn("Socket.io is not initialized yet.");
      return null;
    }
    return io;
  }
};
