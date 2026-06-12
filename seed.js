const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config();

// Imports finalized models
const {
  User,
  Category,
  Product,
  Order,
  Appointment,
  Review,
  MedicalRecord,
} = require("./server/models/index");

/**
 * $ First connection to the cluster.
 * $ Deletion of old seed daata if present.
 * @ Direct Seeding of independent models for collection and document development
 * @ Direct Seeding of dependent models for collection and document development
 * * Each above step is executed as a whole within the try catch block inside an async function
 * * Reason for using async-await is because database operations with mongoose are asynchronous.
 * # Specifically making the code easier to read and write and execute them in correct order with ease of error handling. Any promise  rejection is captured by catch block. Race conditions, duplicate and partial seed is avoided.
 * ? The idempotency has to present in the script: Running the seed multiple times produces the same result without creating duplicates. Thus having idempotency means prevention of duplicate documents and making testing and CI reproducible, allowing iterative edits to the seed file.
 * ? But what is idempotency ? --> Idempotency is the property of an operation whereby applying it multiple times produces the same result as applying it for once.
 * # In context of database seeding: An idempotent seed operation is one where running node seed.js ten times leaves the database in the exact same state as running it once—no duplicate documents, no partial data, consistent results.
 * $ It is better to construct your code in a set of asynchronous functions so that you can handle the seed composition iteratively and in any form.
 */

async function checkDbConnection() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB database");
  } catch (error) {
    console.error("Error in establishing connection:", error);
    process.exit(1);
  }
}

async function cleanDbForSeed() {
  // Making the seed idempotent for multi edit testing easier
  await User.deleteMany({});
  await Category.deleteMany({});
  await Product.deleteMany({});
  // await Order.deleteMany({});
  // await Appointment.deleteMany({});
  console.log("Database wiped clean for seeding...");
}

async function seedDb() {
  try {
    // 2. SEEDING INDEPENDENT ENTITIES (Categories)
    const category1 = await Category.create({
      name: "Pharmaceuticals",
      description: "Prescription Medicines",
    });
    console.log("Categories seeded...");

    // 3. SEED USERS
    const patient1 = await User.create({
      email: "patient@test.com",
      passwordHash: await bcrypt.hash("hashed_pass_123", 8), // 8 -> salt rounds: how many times to run the hashing process internally
      role: "CUSTOMER",
      profile: { firstName: "John", lastName: "Doe" },
    });

    const doctor1 = await User.create({
      email: "dr.smith@test.com",
      passwordHash: await bcrypt.hash("hashed_pass_456", 8),
      role: "DOCTOR",
      detailsOfHealthCareProfessional: {
        medicalLicense: "MED-9999",
        approvalStatus: "APPROVED",
        consultationFee: 500,
      },
    });
    console.log("Users seeded...");

    // 5. SEED PRODUCTS (Using the Category ID from Step 2)
    const product1 = await Product.create({
      name: "Paracetamol 500mg",
      categoryId: category1._id, // Linking!
      pricing: { finalPrice: 50 },
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

async function bulkSeedDb() {
  try {
    // 2. BULK SEED CATEGORIES
    const categoriesData = [
      { name: "Pharmaceuticals", description: "Prescription Medicines" },
      { name: "Vitamins & Supplements", description: "Daily health" },
      { name: "Medical Devices", description: "Equipment and tools" },
    ];

    // insertMany returns an array of the created documents, complete with their new _ids!
    const createdCategories = await Category.insertMany(categoriesData);
    console.log(`${createdCategories.length} Categories seeded...`);

    // 3. BULK SEED USERS
    const usersData = [
      {
        email: "admin@viqure.com",
        passwordHash: await bcrypt.hash("admin123", 8),
        role: "ADMIN",
        profile: { firstName: "Super", lastName: "Admin" },
      },
      {
        email: "patient1@test.com",
        passwordHash: await bcrypt.hash("pass123", 8),
        role: "CUSTOMER",
        profile: { firstName: "Ayush", lastName: "Mishra" },
      },
      {
        email: "doctor.approved@test.com",
        passwordHash: await bcrypt.hash("doc123", 8),
        role: "DOCTOR",
        detailsOfHealthCareProfessional: {
          medicalLicense: "MED-1111",
          approvalStatus: "APPROVED",
          consultationFee: 500,
        },
      },
      {
        email: "doctor.pending@test.com",
        passwordHash: await bcrypt.hash("doc456", 8),
        role: "DOCTOR",
        detailsOfHealthCareProfessional: {
          medicalLicense: "MED-2222",
          approvalStatus: "PENDING", // Great for testing Admin approval routes!
          consultationFee: 400,
        },
      },
    ];

    const createdUsers = await User.insertMany(usersData);
    console.log(`${createdUsers.length} Users seeded...`);

    // 4. BULK SEED PRODUCTS (Using the IDs from the categories that were just created)
    const productsData = [
      {
        name: "Paracetamol 500mg",
        categoryId: createdCategories[0]._id, // Links to Pharmaceuticals
        pricing: { finalPrice: 50, basePrice: 55 },
      },
      {
        name: "Vitamin C Tablets",
        categoryId: createdCategories[1]._id, // Links to Supplements
        pricing: { finalPrice: 250, basePrice: 300 },
      },
      {
        name: "Digital Thermometer",
        categoryId: createdCategories[2]._id, // Links to Devices
        pricing: { finalPrice: 450, basePrice: 500 },
      },
    ];
    await Product.insertMany(productsData);
    console.log("Products seeded...");

    console.log("✅ SEEDING COMPLETELY SUCCESSFUL!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  }
}

async function seedOneDocumentEach() {
  try {
    // 1) Category
    const category = await Category.create({
      name: `Pharmaceuticals Seed ${Date.now()}`,
      icon: "pharma-icon.png",
      description: "Prescription medicines and OTC",
      isActive: true,
    });

    // 2) Product
    const product = await Product.create({
      name: `Paracetamol 500mg Seed ${Date.now()}`,
      categoryId: category._id,
      description: "Analgesic for fever and pain",
      images: ["https://example.com/images/paracetamol-500.jpg"],
      pricing: {
        basePrice: 55,
        discountPercentage: 10,
        taxRate: 18,
        finalPrice: 49.5,
      },
      inventory: { warehouse: "WH-SEED-1", stockCount: 500 },
      specifications: {
        form: "tablet",
        strength: "500mg",
        manufacturer: "SeedPharma",
      },
      isActive: true,
    });

    // 3) Single User (used as both patient and doctor for references)
    const passwordHash = await bcrypt.hash("SeedPass!23", 8);
    const user = await User.create({
      email: `seed.user+${Date.now()}@test.com`,
      phone: "+911234567890",
      passwordHash,
      role: "DOCTOR",
      gender: "MALE",
      dob: new Date("1985-05-15"),
      profile: { firstName: "Seed", lastName: "User" },
      addresses: [
        {
          type: "HOME",
          street: "12 Seed Lane",
          city: "SeedCity",
          state: "SeedState",
          pincode: "400001",
        },
      ],
      cart: [{ productId: product._id, quantity: 2 }],
      detailsOfHealthCareProfessional: {
        medicalLicense: `MED-SEED-${Date.now()}`,
        approvalStatus: "APPROVED",
        consultationFee: 500,
        qualifications: ["MBBS"],
        yearsOfExperience: 10,
        bio: "Experienced seed doctor.",
        averageRating: 4.8,
        timeSlots: [
          {
            date: new Date(),
            startTime: "09:00",
            endTime: "09:30",
            isBooked: false,
          },
        ],
        isAvailable: true,
        stats: { rating: 4.8, totalRatings: 10, totalAppointments: 50 },
      },
      isVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
      avatar: "https://example.com/avatars/seed.png",
      fcmToken: "seed_fcm_token",
    });

    // 4) Appointment
    const start = new Date();
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    const appointment = await Appointment.create({
      patientId: user._id,
      doctorId: user._id,
      schedule: {
        scheduledAt: start,
        slotTime: "09:00-09:30",
        startDateTime: start,
        endDateTime: end,
      },
      meeting: {
        meetingId: `meet-${Date.now()}`,
        meetingLink: "https://meet.example.com/seed",
        consultationType: "VIDEO",
      },
      financials: {
        consultationFee: 500,
        taxAmount: 90,
        totalAmount: 590,
        refundableAmount: 0,
      },
      paymentDetails: {
        paymentId: mongoose.Types.ObjectId(),
        status: "PAID",
        currency: "INR",
        paidAt: new Date(),
      },
      appointmentStatus: "CONFIRMED",
      reason: "General consultation",
      notes: "Patient complains of mild fever.",
      cancellation: {
        cancelledBy: user._id,
        cancelReason: "N/A",
        cancelledAt: new Date(),
      },
      documentsShared: [
        {
          uploadedBy: user._id,
          documentURL: "https://example.com/doc/seed.pdf",
          documentType: "PRESCRIPTION",
          uploadedAt: new Date(),
        },
      ],
      doctorRemarks: {
        text: "Reviewed symptoms, suggested rest.",
        mode: "Text",
      },
      feedback: { rating: 5, comment: "Great consultation" },
      reportedIssue: {
        issue: "None",
        reportedAt: new Date(),
        status: "RESOLVED",
        resolution: "N/A",
      },
    });

    // 5) Medical Record
    const medicalRecord = await MedicalRecord.create({
      patientId: user._id,
      doctorId: user._id,
      appointmentId: appointment._id,
      documentType: "PRESCRIPTION",
      fileUrl: "https://example.com/medical/seed-prescription.pdf",
      uploadedAt: new Date(),
      notes: "Prescription for paracetamol",
      isConfidential: false,
    });

    // 6) Order
    const order = await Order.create({
      userId: user._id,
      items: [
        {
          productId: product._id,
          productSnapshot: {
            name: product.name,
            brand: "SeedBrand",
            image: product.images[0],
            mrp: 55,
            sellingPrice: 49.5,
          },
          quantity: 2,
          unitPrice: 49.5,
          totalPrice: 99,
          discount: 5,
        },
      ],
      pricing: {
        subtotal: 99,
        deliveryCharge: 20,
        discount: 5,
        finalAmount: 114,
        currency: "INR",
      },
      status: "confirmed",
      paymentDetails: {
        transactionId: "TXN-SEED-1",
        method: "CARD",
        status: "SUCCESS",
        paymentDate: new Date(),
      },
      shipmentDetails: {
        status: "DISPATCHED",
        courier: {
          name: "SeedCourier",
          trackingNumber: "TRACK123",
          contact: "+911234567890",
        },
        deliveryAddress: {
          fullName: "Seed User",
          phone: "+911234567890",
          addressLine: "12 Seed Lane",
          city: "SeedCity",
          state: "SeedState",
          pincode: "400001",
        },
        otp: "123456",
        otpVerification: { status: "VERIFIED", verifiedAt: new Date() },
        estimatedDeliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        actualDeliveryDate: new Date(),
        lastUpdatedAt: new Date(),
      },
    });

    // 7) Review
    const review = await Review.create({
      reviewerId: user._id,
      targetType: "PRODUCT",
      targetId: product._id,
      rating: 5,
      reviewText: "High quality product (seed)",
      isVerified: true,
      likes: 0,
    });

    console.log(
      "seedOneDocumentEach: created category, product, user, appointment, medicalRecord, order, review",
    );
  } catch (err) {
    console.error("Error in seedOneDocumentEach:", err);
    throw err;
  }
}

// Execute the async functions
// ! Following is the wrong execution order given they would start executing in parallel as they are async.
// checkDbConnection();
// cleanDbForSeed();
// seedDb();
// bulkSeedDb();

// ? Instead build a main function to execute other async functions by using await.
async function main() {
  try {
    await checkDbConnection();
    await cleanDbForSeed();
    // await bulkSeedDb();
    // await seedOneDocumentEach();
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
