import mongoose, { Schema } from "mongoose";

const linkSchema = new Schema(
  {
    name: String,
    url: String,
    type: {
      type: String,
      enum: ["youtube", "instagram", "soundcloud"],
    },
    clickCount: { type: Number, default: 0 },
    hidden: { type: Boolean, default: false },
    order: { type: Number, default: 1 },
  },
  {
    timestamps: true,
  }
);

const Link = mongoose.models.Link || mongoose.model("Link", linkSchema);

export default Link;
