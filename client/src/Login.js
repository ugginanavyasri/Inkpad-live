import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [isLogin, setIsLogin] =
    useState(true);

  const [username, setUsername] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  // LOGIN

  const login = async () => {

    try {

      const res = await axios.post(
        "https://inkpad-live-backend.onrender.com/login",
        {
          email,
          password,
        }
      );

      if (res.data.token) {

        localStorage.setItem(
          "token",
          res.data.token
        );

        localStorage.setItem(
          "username",
          res.data.username
        );

        navigate("/home");

      } else {

        alert(
          res.data.error
        );

      }

    } catch {

      alert("Login failed");

    }
  };

  // REGISTER

  const register = async () => {

    try {

      const res = await axios.post(
        "https://inkpad-live-backend.onrender.com/register",
        {
          username,
          email,
          password,
        }
      );

      if (res.data.success) {

        alert(
          "Registration successful"
        );

        setIsLogin(true);

      } else {

        alert(
          res.data.error
        );

      }

    } catch {

      alert("Registration failed");

    }
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
        fontFamily: "Arial",
      }}
    >

      <div
        style={{
          width: "430px",
          background:
            "rgba(255,255,255,0.8)",
          backdropFilter: "blur(15px)",
          padding: "45px",
          borderRadius: "28px",
          boxShadow:
            "0 10px 35px rgba(0,0,0,0.12)",
        }}
      >

        <h1
          style={{
            textAlign: "center",
            color: "#4f46e5",
            marginBottom: "10px",
            fontSize: "42px",
          }}
        >
          InkPad Live
        </h1>

        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            marginBottom: "35px",
          }}
        >
          Real-time collaborative workspace
        </p>

        {!isLogin && (

          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) =>
              setUsername(
                e.target.value
              )
            }
            style={inputStyle}
          />

        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(
              e.target.value
            )
          }
          style={inputStyle}
        />

        <button
          onClick={
            isLogin
              ? login
              : register
          }
          style={buttonStyle}
        >
          {isLogin
            ? "Login"
            : "Register"}
        </button>

        <p
          onClick={() =>
            setIsLogin(!isLogin)
          }
          style={{
            textAlign: "center",
            marginTop: "20px",
            cursor: "pointer",
            color: "#4f46e5",
            fontWeight: "bold",
          }}
        >
          {isLogin
            ? "Create new account"
            : "Already have account?"}
        </p>

      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "17px",
  marginBottom: "18px",
  borderRadius: "14px",
  border: "2px solid #c7d2fe",
  outline: "none",
  fontSize: "15px",
  boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "14px",
  background:
    "linear-gradient(135deg,#6366f1,#8b5cf6)",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  cursor: "pointer",
};

export default Login;