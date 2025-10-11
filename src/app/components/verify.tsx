"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

interface VerifyOtpProps {
  email: string;
}

export default function VerifyOtp({ email }: VerifyOtpProps) {
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    setError(""); setMessage("");

    try {
      // Verify OTP
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: "email", // OTP verification
      });

      if (error) setError(error.message);
      else {
        // OTP verified → update password
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (updateError) setError(updateError.message);
        else setMessage("Password updated successfully!");
      }
    } catch (err: unknown) {
      setError( "Verification failed");
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {error && <p className="text-cyan-400">{error}</p>}
      {message && <p className="text-green-400">{message}</p>}

      <input
        type="text"
        placeholder="Enter 6-digit code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        maxLength={6}
      />

      <input
        type="password"
        placeholder="New Password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />

      <button onClick={handleVerify}>Verify & Reset Password</button>
    </div>
  );
}
