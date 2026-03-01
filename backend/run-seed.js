// Simple script to run seed - copy this to your backend terminal and run: node run-seed.js
const mongoose = require("mongoose");
const Villa = require("./models/Villa");
const User = require("./models/User");

const villasData = [
  {
    title: "Mountain Sky Villa",
    slug: "mountain-sky-villa",
    location: "Lonavala Hills",
    description:
      "Experience breathtaking mountain views from this luxurious villa featuring a stunning infinity pool.",
    price: 18500,
    oldPrice: 23250,
    capacity: 40,
    bedrooms: 9,
    baths: 10,
    rating: 4.9,
    reviewCount: 47,
    featured: true,
    badges: ["Best Seller", "Luxury"],
    images: [
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0099.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: ["Private Pool", "Mountain View"],
      interior: ["WiFi", "AC"],
      facilities: ["Parking", "Kitchen"],
    },
  },
  {
    title: "Vrundavan Villa",
    slug: "vrundavan-villa",
    location: "Lonavala Valley",
    description:
      "Serene retreat surrounded by lush greenery with private pool.",
    price: 15500,
    oldPrice: 19500,
    capacity: 25,
    bedrooms: 7,
    baths: 7,
    rating: 4.8,
    reviewCount: 32,
    featured: true,
    badges: ["Family Friendly"],
    images: [
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0034.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: ["Private Pool", "Garden"],
      interior: ["WiFi", "AC"],
      facilities: ["Parking"],
    },
  },
  {
    title: "Star Light Villa",
    slug: "star-light-villa",
    location: "Lonavala",
    description: "Spacious villa with private pool and large living spaces.",
    price: 16500,
    oldPrice: 20790,
    capacity: 35,
    bedrooms: 8,
    baths: 9,
    rating: 4.7,
    reviewCount: 28,
    featured: true,
    badges: ["Spacious"],
    images: [
      {
        url: "http://localhost:5000/images/star light villa.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: ["Private Pool"],
      interior: ["WiFi", "TV"],
      facilities: ["Parking", "Kitchen"],
    },
  },
  {
    title: "Laxmi Villa",
    slug: "laxmi-villa",
    location: "Lonavala",
    description: "Modern villa with a serene atmosphere.",
    price: 13500,
    oldPrice: 17010,
    capacity: 20,
    bedrooms: 6,
    baths: 6,
    rating: 4.6,
    reviewCount: 21,
    featured: false,
    badges: ["Value for Money"],
    images: [
      { url: "http://localhost:5000/images/laxmi villa.png", isPrimary: true },
    ],
    amenities: {
      outdoor: ["Private Pool"],
      interior: ["WiFi", "AC"],
      facilities: ["Parking"],
    },
  },
  {
    title: "CaseDel Villa",
    slug: "casedel-villa",
    location: "Lonavala",
    description: "Cozy villa ideal for small groups.",
    price: 14000,
    oldPrice: 18500,
    capacity: 12,
    bedrooms: 4,
    baths: 4,
    rating: 4.8,
    reviewCount: 18,
    featured: false,
    badges: ["Intimate"],
    images: [
      {
        url: "http://localhost:5000/images/casedel villa.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: ["Private Pool"],
      interior: ["WiFi"],
      facilities: ["Parking"],
    },
  },
];

const seed = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Villa01");
    console.log("✅ Connected");

    await Villa.deleteMany({});
    await User.deleteMany({});

    await User.create({
      name: "Admin",
      email: "admin@brightvillas.com",
      password: "admin123",
      role: "admin",
    });
    console.log("✅ Admin created");

    await User.create({
      name: "Test User",
      email: "test@brightvillas.com",
      password: "test123",
      role: "user",
    });
    console.log("✅ User created");

    await Villa.insertMany(villasData);
    console.log("✅ Villas seeded");
    console.log("\n📋 LOGIN:");
    console.log("Admin: admin@brightvillas.com / admin123");
    console.log("User: test@brightvillas.com / test123");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

seed();
