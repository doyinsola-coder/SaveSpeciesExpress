import axios from "axios";

export const initializePayment = async (req, res) => {
  try {
    const { email, amount } = req.body;

    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amount * 100, // amount in kobo
        callback_url: "http://localhost:5173/payment-success", // redirect here after payment
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Payment init error:", error.response?.data || error.message);
    return res
      .status(500)
      .json({ message: "Payment initialization failed", error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("Verification error:", error.response?.data || error.message);
    return res
      .status(500)
      .json({ message: "Payment verification failed", error: error.message });
  }
};
