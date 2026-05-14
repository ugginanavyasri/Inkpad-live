import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {

  const [roomId, setRoomId] = useState("");

  const navigate = useNavigate();

  // JOIN ROOM
  const joinRoom = () => {

    if (!roomId.trim()) {

      alert("Please enter Room ID");

      return;
    }

    navigate(`/room/${roomId}`);
  };

  // LOGOUT
  const logout = () => {

    localStorage.clear();

    window.location.href = "/";
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(135deg,#dbeafe,#ede9fe,#fae8ff,#fdf2f8)",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Arial",
      }}
    >

      {/* BACKGROUND CIRCLES */}

      <div
        style={{
          position: "absolute",
          width: "450px",
          height: "450px",
          borderRadius: "50%",
          background: "#c4b5fd",
          filter: "blur(120px)",
          top: "-120px",
          left: "-100px",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "#93c5fd",
          filter: "blur(120px)",
          bottom: "-100px",
          right: "-80px",
          opacity: 0.5,
        }}
      />

      {/* MAIN CARD */}

      <div
        style={{
          width: "480px",
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          padding: "50px",
          borderRadius: "32px",
          boxShadow:
            "0 12px 45px rgba(0,0,0,0.12)",
          border:
            "1px solid rgba(255,255,255,0.4)",
          zIndex: 10,
        }}
      >

        {/* TITLE */}

        <h1
          style={{
            textAlign: "center",
            fontSize: "48px",
            marginBottom: "12px",
            color: "#4338ca",
            fontWeight: "bold",
          }}
        >
          InkPad Live
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "40px",
            fontSize: "17px",
            lineHeight: "1.6",
          }}
        >
          Real-time collaborative markdown editor
          with live syncing workspace
        </p>

        {/* ROOM ID INPUT */}

        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <label
            style={{
              display: "block",
              marginBottom: "10px",
              color: "#4338ca",
              fontWeight: "bold",
              fontSize: "15px",
            }}
          >
            Enter Room ID
          </label>

          <input
            placeholder="example-room-123"
            value={roomId}
            onChange={(e) =>
              setRoomId(
                e.target.value
                  .replace(/\s/g, "")
                  .toLowerCase()
              )
            }
            style={inputStyle}
          />

        </div>

        {/* JOIN BUTTON */}

        <button
          onClick={joinRoom}
          style={joinButton}
        >
          Join Workspace
        </button>

        {/* LOGOUT */}

        <button
          onClick={logout}
          style={logoutButton}
        >
          Logout
        </button>

      </div>
    </div>
  );
}

// INPUT

const inputStyle = {
  width: "100%",
  padding: "18px",
  borderRadius: "16px",
  border: "2px solid #c7d2fe",
  outline: "none",
  fontSize: "16px",
  background: "white",
  boxSizing: "border-box",
  color: "#0f172a",
};

// JOIN BUTTON

const joinButton = {
  width: "100%",
  padding: "17px",
  border: "none",
  borderRadius: "16px",
  background:
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "16px",
  boxShadow:
    "0 8px 20px rgba(99,102,241,0.3)",
};

// LOGOUT

const logoutButton = {
  width: "100%",
  marginTop: "20px",
  padding: "15px",
  border: "none",
  borderRadius: "16px",
  background: "#ef4444",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "15px",
};

export default Home;