import User from "../models/User.model.js";
import Prediction from "../models/Prediction.model.js";
import Log from "../models/Log.model.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { logEvent } from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "../../..");
const MODEL_PATH = path.join(ROOT_DIR, "ml", "rf_model.joblib");

const getRangeStart = (range) => {
  const now = Date.now();
  switch (range) {
    case "24h":
      return new Date(now - 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now - 30 * 24 * 60 * 60 * 1000);
    case "90d":
      return new Date(now - 90 * 24 * 60 * 60 * 1000);
    case "7d":
    default:
      return new Date(now - 7 * 24 * 60 * 60 * 1000);
  }
};

const getModelLastUpdated = () => {
  try {
    if (!fs.existsSync(MODEL_PATH)) return null;
    return fs.statSync(MODEL_PATH).mtime;
  } catch {
    return null;
  }
};

// Approve a pending admin
export const approveUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { approved: true },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "User approved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        approved: user.approved,
      },
    });
    logEvent({
      level: "INFO",
      source: "Admin",
      message: `User approved: ${user.email}`,
      userId: req.user?.id,
      metadata: { approvedUserId: String(user._id), role: user.role },
    });
  } catch (error) {
    logEvent({
      level: "ERROR",
      source: "Admin",
      message: "User approval failed",
      details: error.message,
      userId: req.user?.id,
      metadata: { userId: req.params?.userId || null },
    });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changeAdminPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Provide currentPassword and newPassword (min 6 chars)." });
    }

    const admin = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect." });
    }

    admin.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    admin.tokenVersion += 1;
    await admin.save();

    res.json({ success: true, message: "Password changed successfully. Please login again." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAdminProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required." });
    }

    const emailInUse = await User.findOne({ email, _id: { $ne: req.user.id } });
    if (emailInUse) {
      return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Profile updated", user: admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
    res.json({ success: true, message: "All sessions terminated. Please login again." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: Boolean(isActive) },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: `User ${user.isActive ? "activated" : "deactivated"} successfully.`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (String(req.user.id) === String(userId)) {
      return res.status(400).json({ success: false, message: "You cannot delete your own account." });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword = "Temp@123456" } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword, $inc: { tokenVersion: 1 } },
      { new: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "Password reset successfully.", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const assignUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { accessRole } = req.body;
    const allowed = ["Admin", "Analyst", "Viewer"];

    if (!allowed.includes(accessRole)) {
      return res.status(400).json({ success: false, message: "Invalid accessRole." });
    }

    const user = await User.findByIdAndUpdate(userId, { accessRole }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, message: "User role assigned successfully.", user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const range = req.query.range || "7d";
    const from = getRangeStart(range);
    const match = { createdAt: { $gte: from } };

    const [totalUsers, totalPredictions, highRiskCustomers, avgProbabilityAgg, riskAgg, topChurnersRaw, pendingAdmins] = await Promise.all([
      User.countDocuments({}),
      Prediction.countDocuments(match),
      Prediction.countDocuments({ ...match, risk: "High" }),
      Prediction.aggregate([
        { $match: match },
        { $group: { _id: null, avgProbability: { $avg: "$probability" } } },
      ]),
      Prediction.aggregate([
        { $match: match },
        { $group: { _id: "$risk", count: { $sum: 1 } } },
      ]),
      Prediction.find(match)
        .sort({ probability: -1, createdAt: -1 })
        .limit(5)
        .select("customerName risk probability source createdAt")
        .lean(),
      User.countDocuments({ role: "admin", approved: false }),
    ]);

    const format = range === "24h" ? "%H:00" : "%m-%d";
    const trendsRaw = await Prediction.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format, date: "$createdAt", timezone: "UTC" } },
          predictions: { $sum: 1 },
          avgProbability: { $avg: "$probability" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const avgProbability = avgProbabilityAgg[0]?.avgProbability || 0;
    const avgConfidence = totalPredictions > 0 ? 1 - Math.abs(avgProbability - 0.5) * 2 : 0;

    const riskMap = riskAgg.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const lowCount = riskMap.Low || 0;
    const mediumCount = riskMap.Medium || 0;
    const highCount = riskMap.High || 0;

    const toPercent = (count) =>
      totalPredictions > 0 ? Number(((count / totalPredictions) * 100).toFixed(1)) : 0;

    const trends = trendsRaw.map((item) => ({
      label: item._id,
      predictions: item.predictions,
      avgProbability: Number((item.avgProbability || 0).toFixed(4)),
      confidence: Number((100 - Math.abs((item.avgProbability || 0) - 0.5) * 200).toFixed(1)),
    }));

    const topChurners = topChurnersRaw.map((item) => ({
      name: item.customerName || "Unknown",
      risk: item.risk,
      probability: Number(((item.probability || 0) * 100).toFixed(1)),
      source: item.source,
      predictedAt: item.createdAt,
    }));

    res.json({
      success: true,
      range,
      generatedAt: new Date(),
      metrics: {
        totalUsers,
        totalPredictions,
        highRiskCustomers,
        pendingAdmins,
        avgProbability: Number((avgProbability * 100).toFixed(1)),
        avgConfidence: Number((avgConfidence * 100).toFixed(1)),
        modelVersion: "rf_model.joblib",
        modelLastUpdated: getModelLastUpdated(),
      },
      trends,
      riskDistribution: [
        { label: "Low Risk", count: lowCount, value: toPercent(lowCount) },
        { label: "Medium Risk", count: mediumCount, value: toPercent(mediumCount) },
        { label: "High Risk", count: highCount, value: toPercent(highCount) },
      ],
      topChurners,
    });
  } catch (error) {
    logEvent({
      level: "ERROR",
      source: "Analytics",
      message: "Failed to load analytics",
      details: error.message,
      userId: req.user?.id,
    });
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const level = req.query.level || "all";
    const search = (req.query.search || "").trim();
    const limit = Math.min(Number(req.query.limit) || 200, 1000);

    const query = {};
    if (level !== "all") query.level = level;
    if (search) {
      query.$or = [
        { message: { $regex: search, $options: "i" } },
        { source: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }

    const logs = await Log.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("level source message details userId metadata createdAt")
      .lean();

    res.json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (error) {
    logEvent({
      level: "ERROR",
      source: "System",
      message: "Failed to fetch logs",
      details: error.message,
      userId: req.user?.id,
    });
    res.status(500).json({ success: false, message: error.message });
  }
};
