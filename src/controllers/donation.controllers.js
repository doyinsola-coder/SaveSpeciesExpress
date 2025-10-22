import axios from "axios";
import Donation from "../models/donation.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// INITIATE DONATION
export const initiatePaystackPayment = async (req, res) => {
  try {
    const { amount, speciesName, email, message } = req.body;

    if (!amount || !speciesName || !email) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // create donation with pending status
    const donation = await Donation.create({
      userId: req.user._id,
      speciesName,
      amount,
      message,
      status: "pending",
    });

    // initialize Paystack
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // convert to kobo
        callback_url: `${process.env.CLIENT_URL}/donation-success`,
        metadata: {
          donationId: donation._id,
          userId: req.user._id,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.status(200).json({ authorization_url: response.data.data.authorization_url });
  } catch (error) {
    console.error("Paystack Init Error:", error.message);
    res.status(500).json({ message: "Payment initiation failed" });
  }
};

// VERIFY DONATION
export const verifyPaystackPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = response.data.data;

    // update donation status
    const donation = await Donation.findOneAndUpdate(
      { _id: data.metadata.donationId },
      { status: data.status, reference: data.reference },
      { new: true }
    );

    res.status(200).json(donation);
  } catch (error) {
    console.error("Verification Error:", error.message);
    res.status(500).json({ message: "Verification failed" });
  }
};
