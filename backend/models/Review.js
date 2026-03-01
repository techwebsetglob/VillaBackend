const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    villa: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Villa",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    text: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Update villa rating after review
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const Villa = mongoose.model("Villa");

  const stats = await Review.aggregate([
    { $match: { villa: this.villa, isApproved: true } },
    {
      $group: {
        _id: "$villa",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Villa.findByIdAndUpdate(this.villa, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);
