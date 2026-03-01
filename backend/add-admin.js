const mongoose = require("mongoose");
const User = require("./models/User");

async function addAdmin() {
  const MONGO_URI =
    "mongodb+srv://brightvillas:websetglob08@villa.kks1uus.mongodb.net/Villa01?appName=Villa";

  await mongoose.connect(MONGO_URI);

  // Check if admin exists
  let admin = await User.findOne({ email: "admin@brightvillas.com" });

  if (!admin) {
    admin = await User.create({
      name: "Admin",
      email: "admin@brightvillas.com",
      password: "admin123",
      phone: "+919588618720",
      role: "admin",
    });
    console.log("✅ Admin created!");
  } else {
    // Update password and role
    admin.password = "admin123";
    admin.role = "admin";
    await admin.save();
    console.log("✅ Admin updated!");
  }

  console.log("Admin email: admin@brightvillas.com");
  console.log("Admin password: admin123");

  process.exit(0);
}

addAdmin();
