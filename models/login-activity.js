import mongoose, { Schema } from "mongoose";

// An audit trail of every /admin login step attempt — separate from
// models/login-attempt.js, which only exists for the 24h lockout counter
// and auto-expires. This one is kept indefinitely so it's browsable on the
// dashboard. Like the visit tracking, no IP is stored — just outcome, which
// step, a coarse country, and a timestamp.
export const LOGIN_ACTIVITY_OUTCOMES = ["success", "failed"];
export const LOGIN_ACTIVITY_STEPS = ["password", "totp"];

const loginActivitySchema = new Schema(
  {
    outcome: { type: String, enum: LOGIN_ACTIVITY_OUTCOMES, required: true },
    step: { type: String, enum: LOGIN_ACTIVITY_STEPS, required: true },
    country: String,
  },
  {
    timestamps: true,
  }
);

const LoginActivity =
  mongoose.models.LoginActivity || mongoose.model("LoginActivity", loginActivitySchema);

export default LoginActivity;
