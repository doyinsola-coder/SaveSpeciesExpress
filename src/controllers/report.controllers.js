import Report from "../models/report.js";

// Create a new report (already exists)
export const createReport = async (req, res) => {
  try {
    const { speciesName, issueType, description, image } = req.body;

    if (!speciesName || !issueType || !description) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const report = await Report.create({
      user: req.user._id,
      speciesName,
      issueType,
      description,
      image,
      status: "Pending",
    });

    res.status(201).json(report);
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reports for authenticated user (already exists)
export const getUserReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching user reports:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all reports (admin)
export const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    
    res.status(200).json(reports);
  } catch (error) {
    console.error("Error fetching all reports:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update report status (admin)
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["Pending", "Reviewed", "Resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const report = await Report.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate("user", "name email");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error updating report status:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete report (admin)
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findByIdAndDelete(id);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ message: "Report deleted successfully" });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({ message: "Server error" });
  }
};