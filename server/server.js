const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const SECRET = "inkpad-secret";

// ================= MONGODB =================

mongoose.connect(
  "mongodb+srv://navyasriuggina:csIMhKBk7kv8JSQw@cluster0.fgjcoa0.mongodb.net/?appName=Cluster0"
)
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log(err);
});

// ================= USER MODEL =================

const UserSchema = new mongoose.Schema({

  username: String,

  email: String,

  password: String,

});

const User = mongoose.model(
  "User",
  UserSchema
);

// ================= DOCUMENT MODEL =================

const DocumentSchema = new mongoose.Schema({

  roomId: String,

  data: String,

  owner: String,

  editors: [String],

});

const Document = mongoose.model(
  "Document",
  DocumentSchema
);

// ================= USERS =================

const roomUsers = {};

// ================= REGISTER =================

app.post("/register", async (req, res) => {

  try {

    const {
      username,
      email,
      password,
    } = req.body;

    const existing =
      await User.findOne({ email });

    if (existing) {

      return res.json({
        error:
          "Email already exists",
      });

    }

    const hashed =
      await bcrypt.hash(password, 10);

    await User.create({

      username,

      email,

      password: hashed,

    });

    res.json({
      success: true,
    });

  } catch {

    res.json({
      error:
        "Registration failed",
    });

  }

});

// ================= LOGIN =================

app.post("/login", async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {

      return res.json({
        error:
          "User not found",
      });

    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {

      return res.json({
        error:
          "Wrong password",
      });

    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
      },
      SECRET
    );

    res.json({

      token,

      username:
        user.username,

    });

  } catch {

    res.json({
      error: "Login failed",
    });

  }

});

// ================= SOCKET =================

io.on("connection", (socket) => {

  console.log(
    "User connected"
  );

  // ================= JOIN ROOM =================

  socket.on(
    "join-room",
    async ({
      roomId,
      username,
    }) => {

      socket.join(roomId);

      socket.roomId = roomId;

      // USERS

      if (!roomUsers[roomId]) {

        roomUsers[roomId] =
          new Map();

      }

      roomUsers[roomId].set(
        socket.id,
        username
      );

      io.to(roomId).emit(
        "user-list",
        Array.from(
          roomUsers[roomId].values()
        )
      );

      // DOCUMENT

      let doc =
        await Document.findOne({
          roomId,
        });

      // CREATE ROOM

      if (!doc) {

        doc =
          await Document.create({

            roomId,

            data: "",

            owner: username,

            editors: [],

          });

      }

      // ROLE

      let role = "viewer";

      if (
        doc.owner === username
      ) {

        role = "owner";

      }

      else if (
        doc.editors.includes(
          username
        )
      ) {

        role = "editor";

      }

      socket.emit(
        "role",
        role
      );

      socket.emit(
        "room-data",
        {
          owner:
            doc.owner,
          editors:
            doc.editors,
        }
      );

      // LOAD DOCUMENT

      socket.emit(
        "load-document",
        doc.data
      );

    }
  );

  // ================= MAKE EDITOR =================

  socket.on(
    "make-editor",
    async ({
      roomId,
      targetUser,
      currentUser,
    }) => {

      const doc =
        await Document.findOne({
          roomId,
        });

      // ONLY OWNER

      if (
        doc.owner !==
        currentUser
      ) {

        return;

      }

      // ADD EDITOR

      if (
        !doc.editors.includes(
          targetUser
        )
      ) {

        doc.editors.push(
          targetUser
        );

        await doc.save();

      }

      // UPDATE USERS

      io.to(roomId).emit(
        "editor-updated"
      );

    }
  );

  // ================= SEND CHANGES =================

  socket.on(
    "send-changes",
    async ({
      roomId,
      data,
    }) => {

      const doc =
        await Document.findOne({
          roomId,
        });

      const username =
        roomUsers[roomId]?.get(
          socket.id
        );

      // ONLY OWNER OR EDITOR

      if (

        doc.owner ===
          username ||

        doc.editors.includes(
          username
        )

      ) {

        socket
          .to(roomId)
          .emit(
            "receive-changes",
            data
          );

      }

    }
  );

  // ================= SAVE DOCUMENT =================

  socket.on(
    "save-document",
    async ({
      roomId,
      data,
    }) => {

      await Document.findOneAndUpdate(
        { roomId },
        { data }
      );

    }
  );

  // ================= DISCONNECT =================

  socket.on(
    "disconnect",
    () => {

      const roomId =
        socket.roomId;

      if (
        roomId &&
        roomUsers[roomId]
      ) {

        roomUsers[roomId].delete(
          socket.id
        );

        io.to(roomId).emit(
          "user-list",
          Array.from(
            roomUsers[roomId].values()
          )
        );

        if (
          roomUsers[roomId]
            .size === 0
        ) {

          delete roomUsers[
            roomId
          ];

        }

      }

    }
  );

});

// ================= SERVER =================

server.listen(5000, () => {

  console.log(
    "Server running on port 5000"
  );

});