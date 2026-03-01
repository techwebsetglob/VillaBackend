const express = require("express");
const router = express.Router();
const Villa = require("../models/Villa");
const Review = require("../models/Review");
const { protect } = require("../middleware/auth");

// @route   GET /api/villas
// @desc    Get all villas with filters
// @access  Public
router.get("/", async (req, res) => {
  try {
    const {
      location,
      minPrice,
      maxPrice,
      guests,
      bedrooms,
      featured,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (guests) {
      query.capacity = { $gte: Number(guests) };
    }

    if (bedrooms) {
      query.bedrooms = { $gte: Number(bedrooms) };
    }

    if (featured === "true") {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const villas = await Villa.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Villa.countDocuments(query);

    res.json({
      villas,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/villas/featured
// @desc    Get featured villas
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const villas = await Villa.find({ featured: true })
      .sort({ rating: -1 })
      .limit(5);
    res.json(villas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/villas/debug
// @desc    Debug - get all villas
// @access  Public
router.get("/debug", async (req, res) => {
  try {
    const villas = await Villa.find({});
    res.json({ count: villas.length, villas });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/villas/:slug
// @desc    Get villa by slug
// @access  Public
router.get("/:slug", async (req, res) => {
  try {
    const villa = await Villa.findOne({ slug: req.params.slug });
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }
    res.json(villa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/villas/:id/reviews
// @desc    Get villa reviews
// @access  Public
router.get("/:id/reviews", async (req, res) => {
  try {
    const reviews = await Review.find({
      villa: req.params.id,
      isApproved: true,
    })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/villas
// @desc    Create villa
// @access  Private/Admin
router.post("/", protect, async (req, res) => {
  try {
    const villa = await Villa.create(req.body);
    res.status(201).json(villa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/villas/:id
// @desc    Update villa
// @access  Private/Admin
router.put("/:id", protect, async (req, res) => {
  try {
    const villa = await Villa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }
    res.json(villa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/villas/:id
// @desc    Delete villa
// @access  Private/Admin
router.delete("/:id", protect, async (req, res) => {
  try {
    const villa = await Villa.findByIdAndDelete(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }
    res.json({ message: "Villa deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/villas/:id/reviews
// @desc    Add review to villa
// @access  Private
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, text } = req.body;

    const review = await Review.create({
      villa: req.params.id,
      user: req.user._id,
      rating,
      text,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "user",
      "name avatar",
    );

    res.status(201).json(populatedReview);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/villas/:villaId/reviews/:reviewId
// @desc    Delete a review
// @access  Private (review owner only)
router.delete("/:villaId/reviews/:reviewId", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check if the user is the owner of the review
    if (review.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(req.params.reviewId);
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
