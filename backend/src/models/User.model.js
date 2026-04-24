import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["bank", "admin"],
      default: "bank",
    },
    accessRole: {
      type: String,
      enum: ["Admin", "Analyst", "Viewer"],
      default: function () {
        return this.role === "admin" ? "Admin" : "Viewer";
      },
    },
    approved: {
      type: Boolean,
      default: function () {
        // Auto‑approve banks, admins need approval
        return this.role === "bank";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
