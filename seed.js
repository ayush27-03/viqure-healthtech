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
 * ~ Developing async seed functions - a strategy is to mirror user jounreys via multiple scenarios.
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
      description: "Analgesic",
      images: ["https://example.com/images/paracetamol-500.jpg"],
      pricing: {
        pricing: {
          mrp: 50,
          purchasePrice: 30,
          basePrice: 50,
          discountPercentage: 0,
          taxRate: 0,
          finalPrice: 50,
        },
      },
      inventory: {
        inventory: {
          sku: `SKU-BULK-1-${Date.now()}`,
          supplier: "SeedSupplier",
          warehouse: "WH-1",
          stockCount: 100,
          reorderLevel: 10,
          batches: [
            {
              batchNumber: "B1",
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              quantity: 100,
            },
          ],
        },
      },
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
        description: "Analgesic",
        images: ["https://example.com/images/paracetamol-500.jpg"],
        pricing: {
          pricing: {
            mrp: 55,
            purchasePrice: 30,
            basePrice: 55,
            discountPercentage: 0,
            taxRate: 0,
            finalPrice: 50,
          },
        },
        inventory: {
          inventory: {
            sku: `SKU-BULK-${Date.now()}-1`,
            supplier: "SeedSupplier",
            warehouse: "WH-BULK-1",
            stockCount: 200,
            reorderLevel: 10,
          },
        },
      },
      {
        name: "Vitamin C Tablets",
        categoryId: createdCategories[1]._id, // Links to Supplements
        description: "Vitamin supplement",
        images: ["https://example.com/images/vitamin-c.jpg"],
        pricing: {
          pricing: {
            mrp: 300,
            purchasePrice: 150,
            basePrice: 300,
            discountPercentage: 0,
            taxRate: 0,
            finalPrice: 250,
          },
        },
        inventory: {
          inventory: {
            sku: `SKU-BULK-${Date.now()}-2`,
            supplier: "SeedSupplier",
            warehouse: "WH-BULK-2",
            stockCount: 150,
            reorderLevel: 10,
          },
        },
      },
      {
        name: "Digital Thermometer",
        categoryId: createdCategories[2]._id, // Links to Devices
        description: "Handheld digital thermometer",
        images: ["https://example.com/images/thermometer.jpg"],
        pricing: {
          pricing: {
            mrp: 500,
            purchasePrice: 300,
            basePrice: 500,
            discountPercentage: 0,
            taxRate: 0,
            finalPrice: 450,
          },
        },
        inventory: {
          inventory: {
            sku: `SKU-BULK-${Date.now()}-3`,
            supplier: "SeedSupplier",
            warehouse: "WH-BULK-3",
            stockCount: 80,
            reorderLevel: 5,
          },
        },
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
        pricing: {
          mrp: 55,
          purchasePrice: 30,
          basePrice: 55,
          discountPercentage: 10,
          taxRate: 18,
          finalPrice: 49.5,
        },
      },
      inventory: {
        inventory: {
          sku: `SKU-SEED-${Date.now()}`,
          supplier: "SeedSupplier",
          warehouse: "WH-SEED-1",
          stockCount: 500,
          reorderLevel: 10,
          batches: [
            {
              batchNumber: "B-SEED-1",
              expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              quantity: 500,
            },
          ],
        },
      },
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

async function seedAuthenticationScenario() {
  try {
    console.log("🌱 Seeding For Authentication Scenario...");
    const users = [
      {
        email: "admin@viqure.com",
        passwordHash: await bcrypt.hash("adminPass_123", 8),
        role: "ADMIN",
        isVerified: true,
        isActive: true,
        profile: {
          firstName: "Saket",
          lastName: "Adit",
        },
      },

      {
        email: "customer@viqure.com",
        passwordHash: await bcrypt.hash("customerPass_123", 8),
        role: "CUSTOMER",
        isVerified: true,
        isActive: true,
        profile: {
          firstName: "Kabir",
          lastName: "Golwalkar",
        },
      },

      {
        email: "doctor.pending@viqure.com",
        passwordHash: await bcrypt.hash("doctorPass_123", 8),
        role: "DOCTOR",
        isVerified: true,
        isActive: true,
        profile: {
          firstName: "Vijesh",
          lastName: "Basu",
        },
        detailsOfHealthCareProfessional: {
          medicalLicense: "DOC-PENDING-001",
          approvalStatus: "PENDING",
          consultationFee: 500,
          qualifications: ["MBBS"],
          yearsOfExperience: 3,
          isAvailable: true,
        },
      },

      {
        email: "doctor.approved@viqure.com",
        passwordHash: await bcrypt.hash("doctorPass_123", 8),
        role: "DOCTOR",
        isVerified: true,
        isActive: true,
        profile: {
          firstName: "Priya",
          lastName: "Ekanka",
        },
        detailsOfHealthCareProfessional: {
          medicalLicense: "DOC-APPROVED-001",
          approvalStatus: "APPROVED",
          consultationFee: 800,
          qualifications: ["MBBS", "MD"],
          yearsOfExperience: 10,
          isAvailable: true,
          stats: {
            rating: 4.8,
            totalRatings: 120,
            totalAppointments: 450,
          },
        },
      },

      {
        email: "doctor.rejected@viqure.com",
        passwordHash: await bcrypt.hash("doctorPass_123", 8),
        role: "DOCTOR",
        isVerified: true,
        isActive: true,
        profile: {
          firstName: "Rohit",
          lastName: "Brijan",
        },
        detailsOfHealthCareProfessional: {
          medicalLicense: "DOC-REJECTED-001",
          approvalStatus: "REJECTED",
          consultationFee: 400,
          qualifications: ["BAMS"],
          yearsOfExperience: 2,
          isAvailable: false,
        },
      },
    ];

    await User.insertMany(users);

    console.log("✅ Authentication Scenario Seeded");
    console.log(`👥 Users Created: ${users.length}`);
  } catch (error) {
    console.error("❌ Authentication Scenario Failed");
    throw error;
  }
}

async function seedDoctorMarketplaceScenario() {
  try {
    console.log("🌱 Seeding Doctor Marketplace Scenario...");

    // Categories
    const categories = await Category.insertMany([
      {
        name: "Cardiology",
        description: "Heart and cardiovascular care",
        isActive: true,
      },
      {
        name: "Dermatology",
        description: "Skin and hair treatments",
        isActive: true,
      },
      {
        name: "General Medicine",
        description: "Primary healthcare services",
        isActive: true,
      },
      {
        name: "Pediatrics",
        description: "Child healthcare specialists",
        isActive: true,
      },
    ]);

    const doctorsPasswordHash = await bcrypt.hash("doctorPass_123", 8);

    const doctors = [
      {
        email: "cardio.junior@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,

        profile: {
          firstName: "Amit",
          lastName: "Sharma",
        },

        detailsOfHealthCareProfessional: {
          medicalLicense: "CARDIO-001",
          approvalStatus: "APPROVED",
          consultationFee: 300,
          qualifications: ["MBBS"],
          yearsOfExperience: 2,
          isAvailable: true,
          stats: {
            rating: 3.8,
            totalRatings: 18,
            totalAppointments: 40,
          },
        },
      },

      {
        email: "derma.senior@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Nisha", lastName: "Verma" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "DERMA-001",
          approvalStatus: "APPROVED",
          consultationFee: 600,
          qualifications: ["MBBS", "DDV"],
          yearsOfExperience: 8,
          isAvailable: true,
          stats: { rating: 4.2, totalRatings: 76, totalAppointments: 200 },
        },
      },

      {
        email: "genmed.senior@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Ravi", lastName: "Kumar" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "GENMED-001",
          approvalStatus: "APPROVED",
          consultationFee: 250,
          qualifications: ["MBBS"],
          yearsOfExperience: 12,
          isAvailable: true,
          stats: { rating: 4.5, totalRatings: 200, totalAppointments: 900 },
        },
      },

      {
        email: "pediatrics.lead@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Sonia", lastName: "Mehta" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "PED-001",
          approvalStatus: "APPROVED",
          consultationFee: 400,
          qualifications: ["MBBS", "DCH"],
          yearsOfExperience: 6,
          isAvailable: true,
          stats: { rating: 4.1, totalRatings: 34, totalAppointments: 120 },
        },
      },

      {
        email: "cardio.senior@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Karan", lastName: "Malhotra" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "CARDIO-002",
          approvalStatus: "APPROVED",
          consultationFee: 1200,
          qualifications: ["MBBS", "MD"],
          yearsOfExperience: 15,
          isAvailable: true,
          stats: { rating: 4.7, totalRatings: 300, totalAppointments: 1000 },
        },
      },

      {
        email: "ortho.specialist@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Anita", lastName: "Ghosh" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "ORTHO-001",
          approvalStatus: "APPROVED",
          consultationFee: 700,
          qualifications: ["MBBS", "MS(Ortho)"],
          yearsOfExperience: 9,
          isAvailable: true,
          stats: { rating: 4.3, totalRatings: 89, totalAppointments: 340 },
        },
      },

      {
        email: "neuro.consult@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Vikram", lastName: "Singh" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "NEURO-001",
          approvalStatus: "APPROVED",
          consultationFee: 1500,
          qualifications: ["MBBS", "DM(Neurology)"],
          yearsOfExperience: 20,
          isAvailable: true,
          stats: { rating: 4.9, totalRatings: 500, totalAppointments: 2000 },
        },
      },

      {
        email: "ent.expert@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,
        profile: { firstName: "Meera", lastName: "Patel" },
        detailsOfHealthCareProfessional: {
          medicalLicense: "ENT-001",
          approvalStatus: "APPROVED",
          consultationFee: 350,
          qualifications: ["MBBS", "DLO"],
          yearsOfExperience: 7,
          isAvailable: true,
          stats: { rating: 3.9, totalRatings: 22, totalAppointments: 60 },
        },
      },
    ];

    await User.insertMany(doctors);

    console.log("✅ Doctor Marketplace Scenario Seeded");
  } catch (error) {
    console.error("❌ Doctor Marketplace Scenario Failed");
    throw error;
  }
}

async function seedAppointmentLifecycleScenario() {
  try {
    console.log("🌱 Seeding Appointment Lifecycle Scenario...");

    const doctorsPasswordHash = await bcrypt.hash("doctorPass_123", 8);

    // Doctors
    const doctors = await User.insertMany([
      {
        email: "doctor.lifecycle1@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,

        profile: {
          firstName: "Rajesh",
          lastName: "Kumar",
        },

        detailsOfHealthCareProfessional: {
          medicalLicense: "LIFE-DOC-001",
          approvalStatus: "APPROVED",
          consultationFee: 500,
          qualifications: ["MBBS", "MD"],
          yearsOfExperience: 8,
        },
      },

      {
        email: "doctor.lifecycle2@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "DOCTOR",
        isVerified: true,

        profile: {
          firstName: "Neha",
          lastName: "Verma",
        },

        detailsOfHealthCareProfessional: {
          medicalLicense: "LIFE-DOC-002",
          approvalStatus: "APPROVED",
          consultationFee: 800,
          qualifications: ["MBBS"],
          yearsOfExperience: 5,
        },
      },
    ]);

    // Customers

    const customers = await User.insertMany([
      {
        email: "patient1@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "CUSTOMER",
        isVerified: true,
      },

      {
        email: "patient2@viqure.com",
        passwordHash: doctorsPasswordHash,
        role: "CUSTOMER",
        isVerified: true,
      },
    ]);

    // Appointments
    const appointments = await Appointment.insertMany([
      {
        patientId: customers[0]._id,
        doctorId: doctors[0]._id,

        schedule: {
          scheduledAt: new Date(),
        },

        appointmentStatus: "BOOKED",

        paymentDetails: {
          status: "PENDING",
        },
      },

      {
        patientId: customers[0]._id,
        doctorId: doctors[1]._id,

        appointmentStatus: "CONFIRMED",

        meeting: {
          consultationType: "VIDEO",
          meetingLink: "https://meet.viqure.com/abc",
        },

        paymentDetails: {
          status: "PAID",
        },
      },

      {
        patientId: customers[1]._id,
        doctorId: doctors[0]._id,

        appointmentStatus: "COMPLETED",

        meeting: {
          consultationType: "VIDEO",
        },

        paymentDetails: {
          status: "PAID",
        },

        doctorRemarks: {
          text: "Patient recovering well",
          mode: "Text",
        },

        feedback: {
          rating: 5,
          comment: "Excellent consultation",
        },
      },

      {
        patientId: customers[0]._id,
        doctorId: doctors[1]._id,

        appointmentStatus: "COMPLETED",

        meeting: {
          consultationType: "IN_PERSON",
        },

        paymentDetails: {
          status: "PAID",
        },

        feedback: {
          rating: 4,
          comment: "Helpful guidance",
        },
      },

      {
        patientId: customers[1]._id,
        doctorId: doctors[1]._id,

        appointmentStatus: "CANCELLED",

        cancellation: {
          cancelReason: "Patient unavailable",
          cancelledAt: new Date(),
        },
      },

      {
        patientId: customers[1]._id,
        doctorId: doctors[0]._id,

        appointmentStatus: "REJECTED",

        doctorRemarks: {
          text: "Schedule conflict",
          mode: "Text",
        },
      },
    ]);

    // -----------------------------
    // Medical Records
    // -----------------------------

    await MedicalRecord.insertMany([
      {
        patientId: customers[1]._id,
        doctorId: doctors[0]._id,
        appointmentId: appointments[2]._id,
        documentType: "PRESCRIPTION",
        fileUrl: "https://example.com/prescription1.pdf",
      },

      {
        patientId: customers[0]._id,
        doctorId: doctors[1]._id,
        appointmentId: appointments[3]._id,
        documentType: "LAB_REPORT",
        fileUrl: "https://example.com/report1.pdf",
      },
    ]);

    console.log("✅ Appointment Lifecycle Scenario Seeded");
  } catch (error) {
    console.error("❌ Appointment Lifecycle Scenario Failed");
    throw error;
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
    // await seedAuthenticationScenario();
    // await seedDoctorMarketplaceScenario();

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
