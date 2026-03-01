const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentId: String,
    razorpayOrderId: String,
    guestDetails: {
      name: String,
      email: String,
      phone: String,
      specialRequests: String,
    },
  },
  { timestamps: true },
);

// Calculate nights and total price
bookingSchema.pre("save", async function (next) {
  if (this.isModified("checkIn") || this.isModified("checkOut")) {
    const villa = await mongoose.model("Villa").findById(this.villa);
    if (villa) {
      const checkIn = new Date(this.checkIn);
      const checkOut = new Date(this.checkOut);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      this.totalPrice = villa.price * nights;
    }
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
