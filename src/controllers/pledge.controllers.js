import Pledge from "../models/pledge.js";

export const createPledge = async (req, res) => {
  try {
    const pledge = new Pledge(req.body);
    await pledge.save();
    res.status(201).json(pledge);
  } catch (error) {
    res.status(500).json({ message: "Error creating pledge", error: error.message });
  }
};

export const getAllPledges = async (req, res) => {
  try {
    const pledges = await Pledge.find().sort({ createdAt: -1 });
    res.status(200).json(pledges);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pledges", error: error.message });
  }
};
