const mongoose = require("mongoose");
const Villa = require("./models/Villa");
const User = require("./models/User");

const villasData = [
  {
    title: "Mountain Sky Villa",
    slug: "mountain-sky-villa",
    location: "Lonavala Hills",
    description:
      "Experience breathtaking mountain views from this luxurious villa featuring a stunning infinity pool, spacious interiors, and modern amenities perfect for family gatherings.",
    price: 18500,
    oldPrice: 23250,
    capacity: 40,
    bedrooms: 9,
    baths: 10,
    rating: 4.9,
    reviewCount: 47,
    featured: true,
    badges: ["Best Seller", "Luxury", "Mountain View"],
    images: [
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0099.jpg",
        isPrimary: true,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0101.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0105.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0107.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0111.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0115.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0117.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0119.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0124.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0126.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0128.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0135.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0136.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/mountain sky villa/IMG-20250708-WA0138.jpg",
        isPrimary: false,
      },
    ],
    amenities: {
      outdoor: [
        "Private Pool",
        "Infinity Pool",
        "Mountain View",
        "Barbeque Area",
        "Garden",
        "Gazebo",
        "Pool Loungers",
        "Outdoor Furniture",
      ],
      interior: [
        "Air Conditioner",
        "Flat Screen TV",
        "WiFi",
        "Sofa",
        "Dining Table",
        "Wardrobe",
        "Music System",
      ],
      facilities: [
        "Private Parking",
        "Kitchen",
        "Microwave",
        "Refrigerator",
        "Cutlery",
        "Caretaker",
      ],
      entertainment: ["Indoor Games", "Badminton Equipment", "Music System"],
    },
    houseRules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "No smoking inside the villa",
      "No pets allowed",
      "No loud music after 10:00 PM",
      "Maximum capacity: 40 guests",
    ],
    cancellationPolicy:
      "Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before check-in. No refund for cancellations within 3 days of check-in.",
    nearbyAttractions: [
      { name: "Tiger Point", distance: "5 min drive" },
      { name: "Bhushi Dam", distance: "10 min drive" },
      { name: "Lonavala Lake", distance: "15 min drive" },
      { name: "Karla Caves", distance: "20 min drive" },
    ],
  },
  {
    title: "Vrundavan Villa",
    slug: "vrundavan-villa",
    location: "Lonavala Valley",
    description:
      "Serene retreat surrounded by lush greenery with private pool, spacious rooms, and modern comforts ideal for peaceful family vacations.",
    price: 15500,
    oldPrice: 19500,
    capacity: 25,
    bedrooms: 7,
    baths: 7,
    rating: 4.8,
    reviewCount: 32,
    featured: true,
    badges: ["Family Friendly", "Garden View"],
    images: [
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0034.jpg",
        isPrimary: true,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0048.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0054.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0055.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0064.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250516-WA0065.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250517-WA0087.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250517-WA0091.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250517-WA0095.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250517-WA0101.jpg",
        isPrimary: false,
      },
      {
        url: "http://localhost:5000/images/vrundavan villa/IMG-20250708-WA0098.jpg",
        isPrimary: false,
      },
    ],
    amenities: {
      outdoor: ["Garden View", "Private Pool", "Garden", "Outdoor Seating"],
      interior: [
        "Air Conditioner",
        "WiFi",
        "Sofa",
        "Flat Screen TV",
        "Dining Area",
      ],
      facilities: [
        "Caretaker",
        "Kitchen",
        "Parking",
        "Refrigerator",
        "Cutlery",
      ],
      entertainment: ["Music System", "Indoor Games"],
    },
    houseRules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "No smoking inside the villa",
      "Pets allowed with prior notice",
      "Quiet hours: 10:00 PM - 8:00 AM",
      "Maximum capacity: 25 guests",
    ],
    cancellationPolicy:
      "Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before check-in. No refund for cancellations within 3 days of check-in.",
    nearbyAttractions: [
      { name: "Local Market", distance: "8 min drive" },
      { name: "Lonavala Lake", distance: "12 min drive" },
      { name: "Rajmachi Fort", distance: "25 min drive" },
      { name: "Tiger Point", distance: "15 min drive" },
    ],
  },
  {
    title: "Star Light Villa",
    slug: "star-light-villa",
    location: "Lonavala",
    description:
      "Spacious villa with private pool and large living spaces. Great for big families and events with stunning views.",
    price: 16500,
    oldPrice: 20790,
    capacity: 35,
    bedrooms: 8,
    baths: 9,
    rating: 4.7,
    reviewCount: 28,
    featured: true,
    badges: ["Event Friendly", "Spacious"],
    images: [
      {
        url: "http://localhost:5000/images/star light villa.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: [
        "Private Pool",
        "Garden",
        "Barbeque",
        "Outdoor Furniture",
        "Pool Loungers",
      ],
      interior: ["Air Conditioner", "Flat Screen TV", "Sofa", "Dining Table"],
      facilities: ["Private Parking", "Kitchen", "Microwave", "Refrigerator"],
      entertainment: ["Music System", "Indoor Games"],
    },
    houseRules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "No smoking inside the villa",
      "No pets allowed",
      "Music allowed until 11:00 PM",
      "Maximum capacity: 35 guests",
    ],
    cancellationPolicy:
      "Free cancellation up to 7 days before check-in. 50% refund for cancellations 3-7 days before check-in. No refund for cancellations within 3 days of check-in.",
    nearbyAttractions: [
      { name: "Duke's Nose", distance: "10 min drive" },
      { name: "Lonavala Market", distance: "5 min drive" },
      { name: "Bushi Dam", distance: "12 min drive" },
      { name: "Ryewood Park", distance: "8 min drive" },
    ],
  },
  {
    title: "Laxmi Villa",
    slug: "laxmi-villa",
    location: "Lonavala",
    description:
      "Modern villa with a serene atmosphere and private amenities to make your stay comfortable and memorable.",
    price: 13500,
    oldPrice: 17010,
    capacity: 20,
    bedrooms: 6,
    baths: 6,
    rating: 4.6,
    reviewCount: 21,
    featured: true,
    badges: ["Value for Money", "Modern"],
    images: [
      { url: "http://localhost:5000/images/laxmi villa.png", isPrimary: true },
    ],
    amenities: {
      outdoor: ["Private Pool", "Garden"],
      interior: ["Sofa", "Air Conditioner", "WiFi", "Flat Screen TV"],
      facilities: ["Caretaker", "Kitchen", "Parking", "Refrigerator"],
      entertainment: ["Music System"],
    },
    houseRules: [
      "Check-in: PM | Check-out 2:00: 11:00 AM",
      "No smoking inside the villa",
      "No pets allowed",
      "Quiet hours: 10:00 PM - 8:00 AM",
      "Maximum capacity: 20 guests",
    ],
    cancellationPolicy:
      "Free cancellation up to 5 days before check-in. 50% refund for cancellations 2-5 days before check-in. No refund for cancellations within 2 days of check-in.",
    nearbyAttractions: [
      { name: "Lonavala Lake", distance: "10 min drive" },
      { name: "Della Adventure", distance: "15 min drive" },
      { name: "Tiger Point", distance: "12 min drive" },
      { name: "Local Market", distance: "6 min drive" },
    ],
  },
  {
    title: "CaseDel Villa",
    slug: "casedel-villa",
    location: "Lonavala",
    description:
      "Cozy villa ideal for small groups that want luxury and privacy in Lonavala with modern facilities.",
    price: 14000,
    oldPrice: 18500,
    capacity: 12,
    bedrooms: 4,
    baths: 4,
    rating: 4.8,
    reviewCount: 18,
    featured: true,
    badges: ["Intimate", "Cozy"],
    images: [
      {
        url: "http://localhost:5000/images/casedel villa.jpg",
        isPrimary: true,
      },
    ],
    amenities: {
      outdoor: ["Private Pool", "Garden", "Outdoor Seating"],
      interior: ["Air Conditioner", "WiFi", "Sofa", "Flat Screen TV"],
      facilities: ["Caretaker", "Parking", "Kitchen", "Refrigerator"],
      entertainment: ["Music System"],
    },
    houseRules: [
      "Check-in: 2:00 PM | Check-out: 11:00 AM",
      "No smoking inside the villa",
      "Pets allowed with prior approval",
      "Quiet hours: 10:00 PM - 8:00 AM",
      "Maximum capacity: 12 guests",
    ],
    cancellationPolicy:
      "Free cancellation up to 5 days before check-in. 50% refund for cancellations 2-5 days before check-in. No refund for cancellations within 2 days of check-in.",
    nearbyAttractions: [
      { name: "Karla Caves", distance: "18 min drive" },
      { name: "Lonavala Market", distance: "7 min drive" },
      { name: "Bhushi Dam", distance: "12 min drive" },
      { name: "Ryewood Park", distance: "10 min drive" },
    ],
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Villa01");
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Villa.deleteMany({});
    await User.deleteMany({});
    console.log("🗑️ Cleared existing data");

    // Create admin user
    const adminUser = await User.create({
      name: "Admin",
      email: "admin@brightvillas.com",
      password: "admin123",
      phone: "+919999999999",
      role: "admin",
    });
    console.log("✅ Created admin user: admin@brightvillas.com / admin123");

    // Create test user
    const testUser = await User.create({
      name: "Test User",
      email: "test@brightvillas.com",
      password: "test123",
      phone: "+918888888888",
      role: "user",
    });
    console.log("✅ Created test user: test@brightvillas.com / test123");

    // Insert villas
    await Villa.insertMany(villasData);
    console.log("✅ Seeded 5 villas successfully");

    console.log("\n📋 LOGIN CREDENTIALS:");
    console.log("Admin: admin@brightvillas.com / admin123");
    console.log("User:  test@brightvillas.com / test123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();
