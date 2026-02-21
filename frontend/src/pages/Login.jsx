import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const ok = onLogin(email.trim(), password);

    if (!ok) {
      setError("Sai email hoặc mật khẩu");
      return;
    }

    setError("");
    navigate("/dashboard/tasks", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f6fb",
        padding: "16px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#fff",
          borderRadius: "10px",
          padding: "24px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ margin: "0 0 16px", color: "#2c3e7a" }}>Đăng nhập</h2>

        <label
          htmlFor="email"
          style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Nhập email"
          required
          style={{
            width: "100%",
            height: "40px",
            padding: "0 10px",
            border: "1px solid #d6d9e5",
            borderRadius: "6px",
            marginBottom: "12px",
          }}
        />

        <label
          htmlFor="password"
          style={{ display: "block", fontSize: "13px", marginBottom: "6px" }}
        >
          Mật khẩu
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nhập mật khẩu"
          required
          style={{
            width: "100%",
            height: "40px",
            padding: "0 10px",
            border: "1px solid #d6d9e5",
            borderRadius: "6px",
            marginBottom: "12px",
          }}
        />

        {error ? (
          <p style={{ color: "#c0392b", margin: "0 0 12px", fontSize: "13px" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          style={{
            width: "100%",
            height: "40px",
            border: "none",
            borderRadius: "6px",
            background: "#2c3e7a",
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Đăng nhập
        </button>
      </form>
    </div>
  );
}
