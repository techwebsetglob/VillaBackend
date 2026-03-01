const mongoose = require("mongoose");

const villaSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    oldPrice: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    discountStartDate: {
      type: Date,
      default: null,
    },
    discountEndDate: {
      type: Date,
      default: null,
    },
    capacity: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    baths: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    badges: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: String,
        public_id: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
    amenities: {
      outdoor: [String],
      interior: [String],
      facilities: [String],
      entertainment: [String],
    },
    houseRules: [String],
    cancellationPolicy: String,
    nearbyAttractions: [
      {
        name: String,
        distance: String,
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Create slug from title
villaSchema.pre("save", function (next) {
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

// Virtual for current price (considering discount)
villaSchema.virtual("currentPrice").get(function () {
  if (!this.discount || this.discount === 0) {
    return this.price;
  }

  const now = new Date();
  const startDate = this.discountStartDate
    ? new Date(this.discountStartDate)
    : null;
  const endDate = this.discountEndDate ? new Date(this.discountEndDate) : null;

  // Check if discount is active
  if (startDate && now < startDate) {
    return this.price;
  }
  if (endDate && now > endDate) {
    return this.price;
  }

  // Calculate discounted price
  if (this.discountType === "percentage") {
    return Math.round(this.price * (1 - this.discount / 100));
  } else {
    return Math.max(0, this.price - this.discount);
  }
});

// Ensure virtuals are included in JSON
villaSchema.set("toJSON", { virtuals: true });
villaSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Villa", villaSchema);
