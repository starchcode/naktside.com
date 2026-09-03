import mongoose, { Schema } from "mongoose";

// One row per failed admin login/code attempt, keyed by IP. Used only for
// brute-force lockout — a different, narrower purpose than the visit
// tracking in models/visit.js, which is why storing an IP is justified
// here (security/abuse prevention) despite being deliberately avoided there.
const loginAttemptSchema = new Schema(
  {
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

// Auto-expire rows after 24h — this is what makes a lockout lift naturally
// after a day, and keeps the collection from growing unbounded.
loginAttemptSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

const LoginAttempt =
  mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", loginAttemptSchema);

export default LoginAttempt;
