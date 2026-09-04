import mongoose, { Schema } from "mongoose";

// Single source of truth for valid visit sources — imported by libs/visits_data.js
// too, so both the schema and the tagging logic always agree.
export const VISIT_SOURCES = ["ig", "yt", "fb", "sc", "other"];

// One row per visit. "other" covers direct visits and anything untagged —
// every visit is recorded, just bucketed as unknown when there's no ?utm_source.
// No IP address, cookie, or any per-person identifier is stored — just the
// referring platform and a coarse country, so a visit can't be tied back to
// a specific individual.
const visitSchema = new Schema(
  {
    source: {
      type: String,
      enum: VISIT_SOURCES,
      required: true,
    },
    country: String, // e.g. "IE" — from Vercel's geo header, raw IP is never read or stored
  },
  {
    timestamps: true,
  }
);

const Visit = mongoose.models.Visit || mongoose.model("Visit", visitSchema);

export default Visit;
