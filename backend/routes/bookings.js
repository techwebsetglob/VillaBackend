const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Villa = require("../models/Villa");
const { protect } = require("../middleware/auth");

// @route   GET /api/bookings/check-availability
// @desc    Check villa availability for dates
// @access  Public
router.get("/check-availability", async (req, res) => {
  try {
    const { villaId, checkIn, checkOut } = req.query;

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflictingBooking = await Booking.findOne({
      villa: villaId,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    res.json({
      available: !conflictingBooking,
      message: conflictingBooking
        ? "Villa is not available for selected dates"
        : "Villa is available",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/villa/:villaId/booked-dates
// @desc    Get all booked dates for a villa
// @access  Public
router.get("/villa/:villaId/booked-dates", async (req, res) => {
  try {
    const { villaId } = req.params;

    const bookings = await Booking.find({
      villa: villaId,
      status: { $in: ["pending", "confirmed"] },
      checkOut: { $gte: new Date() },
    }).select("checkIn checkOut");

    const bookedDates = [];
    bookings.forEach((booking) => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      const currentDate = new Date(checkIn);
      while (currentDate < checkOut) {
        bookedDates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    res.json({ bookedDates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings
// @desc    Get all bookings for current user
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate("villa", "title location images price")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/bookings/:id
// @desc    Get single booking
// @access  Private
router.get("/:id", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate("villa");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/bookings
// @desc    Create new booking
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const { villaId, checkIn, checkOut, guests, guestDetails } = req.body;

    // Check if villa exists
    const villa = await Villa.findById(villaId);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    // Check for date conflicts
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const conflictingBooking = await Booking.findOne({
      villa: villaId,
      status: { $in: ["pending", "confirmed"] },
      $or: [{ checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }],
    });

    if (conflictingBooking) {
      return res
        .status(400)
        .json({ message: "Villa is not available for selected dates" });
    }

    // Calculate total price
    const nights = Math.ceil(
      (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24),
    );
    const totalPrice = villa.price * nights;

    const booking = await Booking.create({
      user: req.user._id,
      villa: villaId,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalPrice,
      guestDetails,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("villa", "title location images price")
      .populate("user", "name email phone");

    res.status(201).json(populatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/bookings/:id
// @desc    Update booking (cancel)
// @access  Private
router.put("/:id", protect, async (req, res) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Only allow cancellation
    if (
      status === "cancelled" &&
      !["cancelled", "confirmed"].includes(booking.status)
    ) {
      booking.status = "cancelled";
      await booking.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
