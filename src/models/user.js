import { Schema, model } from "mongoose";

const userSchema = new Schema({
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

  phoneNumber: {
    type: String,
    required: true,
  },

  address: {
    type: String,
    required: true,
  },

  Gender: {
    type: String,
    enum: ["Male", "Female"],
  },

}, {
  timestamps: true  // 👈 it creates createdAt and updatedAt fields automatically
});

const User = model("User", userSchema);

export default User;