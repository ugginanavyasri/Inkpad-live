import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { useParams, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

const socket = io("https://inkpad-live-backend.onrender.com");

function Editor() {

  const { id: room } = useParams();

  const navigate = useNavigate();

  const username =
    localStorage.getItem("username");

  const [text, setText] =
    useState("");

  const [users, setUsers] =
    useState([]);

  const [showUsers, setShowUsers] =
    useState(false);

  const [isLoaded, setIsLoaded] =
    useState(false);

  const [role, setRole] =
    useState("viewer");

  const [editors, setEditors] =
    useState([]);

  // ================= JOIN ROOM =================

  useEffect(() => {

    socket.connect();

    socket.emit(
      "join-room",
      {
        roomId: room,
        username,
      }
    );

    return () => {

      socket.disconnect();

    };

  }, [room, username]);

  // ================= SOCKET EVENTS =================

  useEffect(() => {

    socket.on(
      "receive-changes",
      (data) => {

        setText(data);

      }
    );

    socket.on(
      "user-list",
      (data) => {

        setUsers(data);

      }
    );

    socket.on(
      "load-document",
      (data) => {

        setText(data);

        setIsLoaded(true);

      }
    );

    socket.on(
      "role",
      (data) => {

        setRole(data);

      }
    );

    socket.on(
      "room-data",
      (data) => {

        setEditors(
          data.editors
        );

      }
    );

    socket.on(
      "editor-updated",
      () => {

        window.location.reload();

      }
    );

    return () => {

      socket.off(
        "receive-changes"
      );

      socket.off(
        "user-list"
      );

      socket.off(
        "load-document"
      );

      socket.off(
        "role"
      );

      socket.off(
        "room-data"
      );

      socket.off(
        "editor-updated"
      );

    };

  }, []);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {

    if (role === "viewer") {

      return;

    }

    if (!isLoaded) return;

    const value =
      e.target.value;

    setText(value);

    socket.emit(
      "send-changes",
      {
        roomId: room,
        data: value,
      }
    );

  };

  // ================= AUTOSAVE =================

  useEffect(() => {

    if (!isLoaded) return;

    const interval =
      setInterval(() => {

        socket.emit(
          "save-document",
          {
            roomId: room,
            data: text,
          }
        );

      }, 2000);

    return () =>
      clearInterval(interval);

  }, [
    text,
    room,
    isLoaded,
  ]);

  // ================= TOOLBAR =================

  const insertText = (
    snippet
  ) => {

    if (role === "viewer") {

      return;

    }

    const textarea =
      document.querySelector(
        "textarea"
      );

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const newText =

      text.substring(0, start) +

      snippet +

      text.substring(end);

    setText(newText);

    socket.emit(
      "send-changes",
      {
        roomId: room,
        data: newText,
      }
    );

  };

  // ================= MAKE EDITOR =================

  const makeEditor = (
    targetUser
  ) => {

    socket.emit(
      "make-editor",
      {
        roomId: room,
        targetUser,
        currentUser:
          username,
      }
    );

  };

  // ================= EXPORT PDF =================

  const exportPDF = () => {

    const doc =
      new jsPDF();

    doc.text(text, 10, 10);

    doc.save(
      `${room}.pdf`
    );

  };

  // ================= LOGOUT =================

  const logout = () => {

    localStorage.clear();

    navigate("/");

  };

  return (

    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background:
          "linear-gradient(135deg,#dbeafe,#ede9fe,#fae8ff,#fdf2f8)",
        fontFamily: "Arial",
      }}
    >

      {/* TOP BAR */}

      <div
        style={{
          padding: "18px",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          background:
            "rgba(255,255,255,0.7)",
          backdropFilter:
            "blur(10px)",
          borderBottom:
            "1px solid #ddd",
        }}
      >

        <div>

          <h2
            style={{
              margin: 0,
              color: "#4f46e5",
            }}
          >
            InkPad Live
          </h2>

          <p
            style={{
              margin: 0,
              color: "#64748b",
            }}
          >
            Room ID: {room}
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            alignItems:
              "center",
          }}
        >

          <div
            style={{
              background:
                "#ede9fe",
              padding:
                "8px 14px",
              borderRadius:
                "10px",
              fontWeight:
                "bold",
              color: "#4f46e5",
            }}
          >
            {role}
          </div>

          <button
            onClick={() =>
              setShowUsers(
                !showUsers
              )
            }
            style={
              topButton
            }
          >
            Users (
            {users.length}
            )
          </button>

          <button
            onClick={
              exportPDF
            }
            style={
              topButton
            }
          >
            Export PDF
          </button>

          <button
            onClick={logout}
            style={
              topButton
            }
          >
            Logout
          </button>

        </div>

      </div>

      {/* USER PANEL */}

      {showUsers && (

        <div
          style={{
            position:
              "absolute",
            top: "90px",
            right: "20px",
            width: "250px",
            background:
              "white",
            borderRadius:
              "18px",
            padding: "15px",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.15)",
            zIndex: 100,
          }}
        >

          <h3
            style={{
              marginTop: 0,
              color: "#4f46e5",
            }}
          >
            Users
          </h3>

          {users.map(
            (user, index) => (

              <div
                key={index}
                style={{
                  marginBottom:
                    "12px",
                  padding: "10px",
                  background:
                    "#f3f4f6",
                  borderRadius:
                    "10px",
                }}
              >

                <p
                  style={{
                    margin: 0,
                    marginBottom:
                      "8px",
                  }}
                >
                  {user}
                </p>

                {

                  role ===
                    "owner" &&

                  user !==
                    username &&

                  !editors.includes(
                    user
                  ) && (

                    <button
                      onClick={() =>
                        makeEditor(
                          user
                        )
                      }
                      style={{
                        padding:
                          "6px 10px",
                        border:
                          "none",
                        borderRadius:
                          "8px",
                        background:
                          "#6366f1",
                        color:
                          "white",
                        cursor:
                          "pointer",
                      }}
                    >
                      Make Editor
                    </button>

                  )

                }

                {

                  editors.includes(
                    user
                  ) && (

                    <span
                      style={{
                        color:
                          "#16a34a",
                        fontWeight:
                          "bold",
                      }}
                    >
                      Editor
                    </span>

                  )

                }

              </div>

            )
          )}

        </div>

      )}

      {/* TOOLBAR */}

      <div
        style={{
          padding: "12px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          background:
            "rgba(255,255,255,0.6)",
        }}
      >

        <button
          onClick={() =>
            insertText(
              "**bold**"
            )
          }
          style={
            toolButton
          }
        >
          Bold
        </button>

        <button
          onClick={() =>
            insertText(
              "*italic*"
            )
          }
          style={
            toolButton
          }
        >
          Italic
        </button>

        <button
          onClick={() =>
            insertText(
              "# Heading"
            )
          }
          style={
            toolButton
          }
        >
          H1
        </button>

        <button
          onClick={() =>
            insertText(
              "## Subheading"
            )
          }
          style={
            toolButton
          }
        >
          H2
        </button>

        <button
          onClick={() =>
            insertText(
              "- List Item"
            )
          }
          style={
            toolButton
          }
        >
          List
        </button>

        <button
          onClick={() =>
            insertText(
              "`code`"
            )
          }
          style={
            toolButton
          }
        >
          Code
        </button>

      </div>

      {/* MAIN */}

      <div
        style={{
          flex: 1,
          display: "flex",
          padding: "20px",
          gap: "20px",
        }}
      >

        {/* EDITOR */}

        <textarea

          disabled={
            role ===
            "viewer"
          }

          value={text}

          onChange={
            handleChange
          }

          style={{
            width: "50%",
            padding: "20px",
            borderRadius:
              "18px",
            border: "none",
            outline: "none",
            resize: "none",
            fontSize: "16px",
            background:
              "rgba(255,255,255,0.8)",
            backdropFilter:
              "blur(10px)",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}

        />

        {/* PREVIEW */}

        <div
          style={{
            width: "50%",
            padding: "20px",
            borderRadius:
              "18px",
            background:
              "rgba(255,255,255,0.8)",
            backdropFilter:
              "blur(10px)",
            overflowY:
              "auto",
            boxShadow:
              "0 8px 25px rgba(0,0,0,0.08)",
          }}
        >

          <ReactMarkdown
            remarkPlugins={[
              remarkBreaks,
            ]}
          >
            {text}
          </ReactMarkdown>

        </div>

      </div>

    </div>

  );

}

const topButton = {

  padding: "10px 16px",

  border: "none",

  borderRadius: "10px",

  background:
    "linear-gradient(135deg,#6366f1,#8b5cf6)",

  color: "white",

  fontWeight: "bold",

  cursor: "pointer",

};

const toolButton = {

  padding: "10px 16px",

  border: "none",

  borderRadius: "10px",

  background: "#ede9fe",

  color: "#4f46e5",

  fontWeight: "bold",

  cursor: "pointer",

};

export default Editor;