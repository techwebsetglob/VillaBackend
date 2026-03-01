const express = require("express");
const router = express.Router();
const Villa = require("../models/Villa");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Review = require("../models/Review");
const Contact = require("../models/Contact");
const { protect, adminOnly } = require("../middleware/auth");
const cloudinary = require("../config/cloudinary");
const { uploadMultiple, uploadSingle } = require("../middleware/upload");

router.use(protect, adminOnly);

router.get("/dashboard", async (req, res) => {
  try {
    const totalVillas = await Villa.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const recentBookings = await Booking.find()
      .populate("user", "name email")
      .populate("villa", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalVillas,
        totalBookings,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      recentBookings,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/villas", async (req, res) => {
  try {
    const villas = await Villa.find().sort({ createdAt: -1 });
    res.json(villas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/villas", async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      price,
      oldPrice,
      capacity,
      bedrooms,
      baths,
      isAvailable,
      featured,
      rating,
      discount,
      discountType,
      discountStartDate,
      discountEndDate,
    } = req.body;

    let slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existingVilla = await Villa.findOne({ slug });
    if (existingVilla) {
      slug = slug + "-" + Date.now();
    }

    const villa = await Villa.create({
      title,
      slug: slug,
      location,
      description,
      price: Number(price),
      oldPrice: Number(oldPrice) || 0,
      capacity: Number(capacity),
      bedrooms: Number(bedrooms),
      baths: Number(baths),
      isAvailable: isAvailable !== false,
      featured: featured || false,
      rating: Number(rating) || 0,
      discount: Number(discount) || 0,
      discountType: discountType || "percentage",
      discountStartDate: discountStartDate ? new Date(discountStartDate) : null,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : null,
    });

    res.status(201).json(villa);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/villas/:id", async (req, res) => {
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

router.delete("/villas/:id", async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    if (villa.images && villa.images.length > 0) {
      for (const image of villa.images) {
        if (image.public_id) {
          try {
            await cloudinary.uploader.destroy(image.public_id);
          } catch (cloudinaryError) {
            console.error(
              "Error deleting image from Cloudinary:",
              cloudinaryError,
            );
          }
        }
      }
    }

    await Villa.findByIdAndDelete(req.params.id);
    res.json({ message: "Villa deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/villas/:id/price", async (req, res) => {
  try {
    const { price, oldPrice } = req.body;

    const villa = await Villa.findById(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({ message: "Price cannot be negative" });
      }
      villa.price = price;
    }

    if (oldPrice !== undefined) {
      villa.oldPrice = oldPrice;
    }

    await villa.save();

    res.json({
      message: "Price updated successfully",
      villa,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch("/villas/:id/discount", async (req, res) => {
  try {
    const { discount, discountType, discountStartDate, discountEndDate } =
      req.body;

    const villa = await Villa.findById(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    if (discount !== undefined) {
      if (discount < 0) {
        return res.status(400).json({ message: "Discount cannot be negative" });
      }
      villa.discount = discount;
    }

    if (discountType) {
      villa.discountType = discountType;
    }

    if (discountStartDate !== undefined) {
      villa.discountStartDate = discountStartDate
        ? new Date(discountStartDate)
        : null;
    }

    if (discountEndDate !== undefined) {
      villa.discountEndDate = discountEndDate
        ? new Date(discountEndDate)
        : null;
    }

    await villa.save();

    res.json({
      message: "Discount updated successfully",
      villa,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/villas/:id/images", uploadMultiple, async (req, res) => {
  try {
    const villa = await Villa.findById(req.params.id);
    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const newImages = req.files.map((file) => ({
      url: file.path,
      public_id: file.filename,
      isPrimary: villa.images.length === 0 && req.files.indexOf(file) === 0,
    }));

    villa.images.push(...newImages);
    await villa.save();

    res.json({
      message: "Images uploaded successfully",
      images: villa.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/villas/:id/images/:imageId", async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const villa = await Villa.findById(id);

    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    const imageIndex = villa.images.findIndex(
      (img) => img._id.toString() === imageId,
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    const imageToDelete = villa.images[imageIndex];

    if (imageToDelete.public_id) {
      try {
        await cloudinary.uploader.destroy(imageToDelete.public_id);
      } catch (cloudinaryError) {
        console.error("Error deleting image from Cloudinary:", cloudinaryError);
      }
    }

    villa.images.splice(imageIndex, 1);

    if (imageToDelete.isPrimary && villa.images.length > 0) {
      villa.images[0].isPrimary = true;
    }

    await villa.save();

    res.json({
      message: "Image deleted successfully",
      images: villa.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/villas/:id/images/:imageId/primary", async (req, res) => {
  try {
    const { id, imageId } = req.params;
    const villa = await Villa.findById(id);

    if (!villa) {
      return res.status(404).json({ message: "Villa not found" });
    }

    villa.images.forEach((img) => {
      img.isPrimary = false;
    });

    const imageIndex = villa.images.findIndex(
      (img) => img._id.toString() === imageId,
    );

    if (imageIndex === -1) {
      return res.status(404).json({ message: "Image not found" });
    }

    villa.images[imageIndex].isPrimary = true;
    await villa.save();

    res.json({
      message: "Primary image updated",
      images: villa.images,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/bookings", async (req, res) => {
  try {
    const { status } = req.query;
    let query = {};

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate("user", "name email phone")
      .populate("villa", "title location")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("user", "name email phone")
      .populate("villa");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/bookings/:id", async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("user", "name email phone")
      .populate("villa", "title location");

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/bookings/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/users/:id", async (req, res) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/reviews", async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name email")
      .populate("villa", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/reviews/:id", async (req, res) => {
  try {
    const { isApproved } = req.body;

    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved },
      { new: true },
    ).populate("user", "name email");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/reviews/:id", async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/contacts", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/contacts/:id", async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.json({ message: "Contact deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
