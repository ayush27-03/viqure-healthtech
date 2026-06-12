
const mongoose = require('mongoose');
require('dotenv').config();

// Imports finalized models
const { User, Category, Product } = require('./server/models/index');

/**
 * $ First connection to the cluster.
 * $ Deletion of old seed daata if present.
 * @ Direct Seeding of independent models for collection and document development
 * @ Direct Seeding of dependent models for collection and document development
 * * Each above step is executed as a whole within the try catch block inside an async function
 * * Reason for using async-await is because database operations with mongoose are asynchronous.
 * # Specifically making the code easier to read and write and execute them in correct order with ease of error handling. Any promise  rejection is captured by catch block. Race conditions, duplicate and partial seed is avoided.
 */

async function seedDatabase() {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB...");

    // 2. SEEDING INDEPENDENT ENTITIES (Categories)
    const category1 = await Category.create({
      name: "Pharmaceuticals",
      description: "Prescription Medicines"
    });
    console.log("Categories seeded...");

    // 3. SEED USERS
    const patient = await User.create({
      email: "patient@test.com",
      passwordHash: "hashed_pass_123", // normally you'd use bcrypt here
      role: "CUSTOMER",
      profile: { firstName: "John", lastName: "Doe" }
    });

    const doctor = await User.create({
      email: "dr.smith@test.com",
      passwordHash: "hashed_pass_456",
      role: "DOCTOR",
      detailsOfHealthCareProfessional: {
        medicalLicense: "MED-9999",
        approvalStatus: "APPROVED",
        consultationFee: 500
      }
    });
    console.log("Users seeded...");

    // 5. SEED PRODUCTS (Using the Category ID from Step 3)
    const product1 = await Product.create({
      name: "Paracetamol 500mg",
      categoryId: category1._id, // Linking!
      pricing: { finalPrice: 50 }
    });
    console.log("Products seeded...");

    // 6. Disconnect when finished
    console.log("Seeding complete!");
    process.exit(0);

  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

// Execute the function
seedDatabase();