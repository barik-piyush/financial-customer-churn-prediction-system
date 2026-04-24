import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

// 🔐 Protect middleware (JWT verification)
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const dbUser = await User.findById(decoded.id).select("tokenVersion approved isActive role accessRole name email");

    if (!dbUser) {
      return res.status(401).json({ success: false, message: "User not found." });
    }

    if (!dbUser.isActive) {
      return res.status(403).json({ success: false, message: "Account is deactivated." });
    }

    if (decoded.tokenVersion !== dbUser.tokenVersion) {
      return res.status(403).json({
        success: false,
        message: "Session has expired. Please login again.",
      });
    }

    req.user = {
      ...decoded,
      name: dbUser.name,
      email: dbUser.email,
      approved: dbUser.approved,
      role: dbUser.role,
      accessRole: dbUser.accessRole,
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};
