const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const {
  Admin,
  User,
  Doctor,
  Slot,
  Category,
  Product,
  Appointment,
  Order,
  Delivery,
  Review,
  MedicalRecord,
  Payment,
  Notification,
} = require("./server/models");

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateOnly(date) {
  return date.toISOString().split("T")[0];
}

async function resetCollections() {
  await Promise.all([
    Notification.deleteMany({}),
    Review.deleteMany({}),
    Payment.deleteMany({}),
    Delivery.deleteMany({}),
    Order.deleteMany({}),
    Appointment.deleteMany({}),
    MedicalRecord.deleteMany({}),
    Slot.deleteMany({}),
    Product.deleteMany({}),
    Category.deleteMany({}),
    Doctor.deleteMany({}),
    User.deleteMany({}),
    Admin.deleteMany({}),
  ]);
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  await resetCollections();

  const [adminHash, doctorHash, patientHash] = await Promise.all([
    bcrypt.hash("Admin@123", 10),
    bcrypt.hash("Doctor@123", 10),
    bcrypt.hash("Patient@123", 10),
  ]);

  const admin = await Admin.create({
    name: "Viqure Admin",
    email: "admin@viqure.com",
    passwordHash: adminHash,
    adminRole: "SUPER_ADMIN",
    permissions: [
      "doctor:approve",
      "doctor:reject",
      "analytics:read",
      "orders:update",
      "products:manage",
    ],
  });

  const patients = await User.insertMany([
    {
      name: "Ayush Test",
      email: "patient1@viqure.com",
      phone: "+919000000001",
      passwordHash: patientHash,
      role: "patient",
      gender: "male",
      dob: new Date("2003-03-27"),
      isVerified: true,
      address: { line: "12 Sector Road", city: "Noida", state: "UP", pincode: "201301" },
    },
    {
      name: "Neha Singh",
      email: "patient2@viqure.com",
      phone: "+919000000002",
      passwordHash: patientHash,
      role: "patient",
      gender: "female",
      dob: new Date("1998-06-14"),
      isVerified: true,
      address: { line: "44 Green Park", city: "Delhi", state: "Delhi", pincode: "110016" },
    },
    {
      name: "Rahul Verma",
      email: "patient3@viqure.com",
      phone: "+919000000003",
      passwordHash: patientHash,
      role: "patient",
      gender: "male",
      dob: new Date("1994-11-03"),
      isVerified: true,
      address: { line: "8 MG Road", city: "Gurugram", state: "Haryana", pincode: "122001" },
    },
  ]);

  const doctors = await Doctor.insertMany([
    {
      doctorName: "Dr. Rakesh Sharma",
      email: "rakesh.sharma@viqure.com",
      passwordHash: doctorHash,
      mobileNumber: "+919100000001",
      gender: "male",
      dob: new Date("1983-04-12"),
      licenseNumber: "MCI-NOIDA-001",
      specializations: ["Cardiology"],
      qualifications: ["MBBS", "MD Cardiology"],
      yearsOfExperience: 10,
      consultationFees: 800,
      city: "Noida",
      description: "Cardiologist focused on preventive heart care and long-term lifestyle management.",
      status: "approved",
      approvalStatus: "approved",
      isAvailable: true,
    },
    {
      doctorName: "Dr. Anjali Mehta",
      email: "anjali.mehta@viqure.com",
      passwordHash: doctorHash,
      mobileNumber: "+919100000002",
      gender: "female",
      dob: new Date("1988-09-22"),
      licenseNumber: "MCI-DELHI-002",
      specializations: ["Dermatology"],
      qualifications: ["MBBS", "MD Dermatology"],
      yearsOfExperience: 7,
      consultationFees: 650,
      city: "Delhi",
      description: "Dermatologist handling acne, pigmentation, and long-term skin routines.",
      status: "approved",
      approvalStatus: "approved",
      isAvailable: true,
    },
    {
      doctorName: "Dr. Kunal Bansal",
      email: "kunal.bansal@viqure.com",
      passwordHash: doctorHash,
      mobileNumber: "+919100000003",
      gender: "male",
      dob: new Date("1990-01-18"),
      licenseNumber: "MCI-GGN-003",
      specializations: ["Pediatrics"],
      qualifications: ["MBBS", "DCH"],
      yearsOfExperience: 5,
      consultationFees: 550,
      city: "Gurugram",
      description: "Pediatric specialist for routine child consultations and follow-up care.",
      status: "pending",
      approvalStatus: "pending",
      isAvailable: true,
    },
  ]);

  const categories = await Category.insertMany([
    {
      name: "Cardiology",
      slug: "cardiology",
      description: "Heart and cardiovascular specialists",
      type: "specialty",
      isActive: true,
    },
    {
      name: "Dermatology",
      slug: "dermatology",
      description: "Skin, hair, and nail specialists",
      type: "specialty",
      isActive: true,
    },
    {
      name: "Pediatrics",
      slug: "pediatrics",
      description: "Child healthcare specialists",
      type: "specialty",
      isActive: true,
    },
    {
      name: "Medicines",
      slug: "medicines",
      description: "OTC and wellness medicines",
      type: "product",
      isActive: true,
    },
    {
      name: "Devices",
      slug: "devices",
      description: "Home care and health monitoring devices",
      type: "product",
      isActive: true,
    },
    {
      name: "Supplements",
      slug: "supplements",
      description: "Daily nutritional support products",
      type: "product",
      isActive: true,
    },
  ]);

  const categoryMap = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const products = await Product.insertMany([
    { name: "Paracare 650", brand: "HealWell", category: "medicines", baseCost: 45, discountFactor: 0.08, stockQty: 120, sku: "MED-001", days: 2 },
    { name: "Cough Relief Syrup", brand: "BreathePlus", category: "medicines", baseCost: 110, discountFactor: 0.1, stockQty: 80, sku: "MED-002", days: 3 },
    { name: "Acidity Guard Tablets", brand: "DigestZen", category: "medicines", baseCost: 95, discountFactor: 0.05, stockQty: 60, sku: "MED-003", days: 2 },
    { name: "Digital Thermometer", brand: "MediCheck", category: "devices", baseCost: 220, discountFactor: 0.12, stockQty: 40, sku: "DEV-001", days: 4 },
    { name: "Automatic BP Monitor", brand: "PulseTrack", category: "devices", baseCost: 1650, discountFactor: 0.15, stockQty: 18, sku: "DEV-002", days: 5 },
    { name: "Portable Nebulizer", brand: "AirEase", category: "devices", baseCost: 2100, discountFactor: 0.07, stockQty: 15, sku: "DEV-003", days: 5 },
    { name: "Daily Multivitamin", brand: "NutriOne", category: "supplements", baseCost: 499, discountFactor: 0.2, stockQty: 90, sku: "SUP-001", days: 3 },
    { name: "Vitamin D3 Drops", brand: "SunnyLife", category: "supplements", baseCost: 350, discountFactor: 0.09, stockQty: 70, sku: "SUP-002", days: 3 },
    { name: "Whey Protein Lite", brand: "FitCore", category: "supplements", baseCost: 1899, discountFactor: 0.18, stockQty: 35, sku: "SUP-003", days: 4 },
    { name: "Omega 3 Capsules", brand: "HeartFuel", category: "supplements", baseCost: 799, discountFactor: 0.11, stockQty: 50, sku: "SUP-004", days: 4 },
    { name: "Skin Calm Gel", brand: "DermaSoft", category: "medicines", baseCost: 260, discountFactor: 0.06, stockQty: 45, sku: "MED-004", days: 3 },
    { name: "Pulse Oximeter", brand: "OxySure", category: "devices", baseCost: 1399, discountFactor: 0.14, stockQty: 22, sku: "DEV-004", days: 4 },
  ].map((item) => ({
    name: item.name,
    slug: slugify(item.name),
    description: `${item.name} seeded sample product for backend testing.`,
    brand: item.brand,
    category: {
      categoryId: categoryMap[item.category]._id,
      name: categoryMap[item.category].name,
    },
    images: [`https://placehold.co/600x400?text=${encodeURIComponent(item.name)}`],
    baseCost: item.baseCost,
    discountFactor: item.discountFactor,
    inventory: {
      stockQty: item.stockQty,
      sku: item.sku,
      lowStockThreshold: 5,
    },
    estimatedDeliveryDays: item.days,
    isAvailable: true,
  })));

  const approvedDoctors = doctors.filter((doctor) => doctor.status === "approved");
  const futureSlots = [];
  const baseDate = addDays(new Date(), 1);

  approvedDoctors.forEach((doctor, doctorIndex) => {
    for (let dayOffset = 0; dayOffset < 3; dayOffset += 1) {
      const slotDate = formatDateOnly(addDays(baseDate, dayOffset));
      ["10:00", "10:30", "11:00"].forEach((startTime, slotIndex) => {
        const endTime = ["10:30", "11:00", "11:30"][slotIndex];
        futureSlots.push({
          doctorId: doctor._id,
          date: slotDate,
          startTime,
          endTime,
          isBooked: false,
        });
      });
    }
  });

  const slots = await Slot.insertMany(futureSlots);

  const completedAppointment = await Appointment.create({
    patientId: patients[0]._id,
    doctorId: approvedDoctors[0]._id,
    consultationFees: approvedDoctors[0].consultationFees,
    appointmentDate: addDays(new Date(), -7),
    appointmentStartDateTime: new Date(`${formatDateOnly(addDays(new Date(), -7))}T10:00:00`),
    appointmentEndDateTime: new Date(`${formatDateOnly(addDays(new Date(), -7))}T10:30:00`),
    slotTime: "10:00 - 10:30",
    consultationType: "VIDEO",
    appointmentStatus: "COMPLETED",
    paymentStatus: "PAID",
    meetingId: "seed-completed-meeting",
    doctorRemarks: "Continue medication and repeat blood tests after 30 days.",
    doctorRemarksMode: "Text",
  });

  const pendingAppointmentSlot = slots[0];
  pendingAppointmentSlot.isBooked = true;
  await pendingAppointmentSlot.save();

  const pendingAppointment = await Appointment.create({
    patientId: patients[1]._id,
    doctorId: approvedDoctors[0]._id,
    consultationFees: approvedDoctors[0].consultationFees,
    appointmentDate: new Date(pendingAppointmentSlot.date),
    appointmentStartDateTime: new Date(`${pendingAppointmentSlot.date}T${pendingAppointmentSlot.startTime}:00`),
    appointmentEndDateTime: new Date(`${pendingAppointmentSlot.date}T${pendingAppointmentSlot.endTime}:00`),
    slotTime: `${pendingAppointmentSlot.startTime} - ${pendingAppointmentSlot.endTime}`,
    consultationType: "VIDEO",
    appointmentStatus: "PENDING",
    paymentStatus: "PENDING",
    meetingId: "seed-pending-meeting",
  });

  const appointmentPayment = await Payment.create({
    userId: patients[0]._id,
    appointmentId: completedAppointment._id,
    paymentType: "APPOINTMENT",
    amount: completedAppointment.consultationFees,
    paymentMethod: "UPI",
    paymentStatus: "SUCCESS",
    transactionId: "APPT-PAY-001",
    paidAt: addDays(new Date(), -7),
  });

  completedAppointment.paymentId = appointmentPayment._id;
  await completedAppointment.save();

  const deliveredOrder = await Order.create({
    userId: patients[0]._id,
    items: [
      {
        productId: products[0]._id,
        productSnapshot: {
          name: products[0].name,
          brand: products[0].brand,
          image: products[0].images[0],
          mrp: products[0].baseCost,
          sellingPrice: Number((products[0].baseCost * (1 - products[0].discountFactor)).toFixed(2)),
        },
        quantity: 2,
        unitPrice: Number((products[0].baseCost * (1 - products[0].discountFactor)).toFixed(2)),
        totalPrice: Number((2 * products[0].baseCost * (1 - products[0].discountFactor)).toFixed(2)),
        discount: products[0].discountFactor * 100,
      },
      {
        productId: products[6]._id,
        productSnapshot: {
          name: products[6].name,
          brand: products[6].brand,
          image: products[6].images[0],
          mrp: products[6].baseCost,
          sellingPrice: Number((products[6].baseCost * (1 - products[6].discountFactor)).toFixed(2)),
        },
        quantity: 1,
        unitPrice: Number((products[6].baseCost * (1 - products[6].discountFactor)).toFixed(2)),
        totalPrice: Number((products[6].baseCost * (1 - products[6].discountFactor)).toFixed(2)),
        discount: products[6].discountFactor * 100,
      },
    ],
    pricing: {
      subtotal: 881.08,
      deliveryCharge: 0,
      discount: 0,
      finalAmount: 881.08,
      currency: "INR",
    },
    status: "delivered",
    shippingAddress: {
      fullName: patients[0].name,
      phone: patients[0].phone,
      addressLine: patients[0].address.line,
      city: patients[0].address.city,
      state: patients[0].address.state,
      pincode: patients[0].address.pincode,
    },
  });

  const pendingOrder = await Order.create({
    userId: patients[1]._id,
    items: [
      {
        productId: products[3]._id,
        productSnapshot: {
          name: products[3].name,
          brand: products[3].brand,
          image: products[3].images[0],
          mrp: products[3].baseCost,
          sellingPrice: Number((products[3].baseCost * (1 - products[3].discountFactor)).toFixed(2)),
        },
        quantity: 1,
        unitPrice: Number((products[3].baseCost * (1 - products[3].discountFactor)).toFixed(2)),
        totalPrice: Number((products[3].baseCost * (1 - products[3].discountFactor)).toFixed(2)),
        discount: products[3].discountFactor * 100,
      },
    ],
    pricing: {
      subtotal: Number((products[3].baseCost * (1 - products[3].discountFactor)).toFixed(2)),
      deliveryCharge: 49,
      discount: 0,
      finalAmount: Number((products[3].baseCost * (1 - products[3].discountFactor) + 49).toFixed(2)),
      currency: "INR",
    },
    status: "pending",
    shippingAddress: {
      fullName: patients[1].name,
      phone: patients[1].phone,
      addressLine: patients[1].address.line,
      city: patients[1].address.city,
      state: patients[1].address.state,
      pincode: patients[1].address.pincode,
    },
  });

  const deliveries = await Delivery.insertMany([
    {
      orderId: deliveredOrder._id,
      userId: deliveredOrder.userId,
      status: "delivered",
      deliveryAddress: deliveredOrder.shippingAddress,
      deliveryCharge: deliveredOrder.pricing.deliveryCharge,
      estimatedDeliveryDate: addDays(new Date(), -4),
      actualDeliveryDate: addDays(new Date(), -3),
      verificationStatus: "verified",
    },
    {
      orderId: pendingOrder._id,
      userId: pendingOrder.userId,
      status: "pending",
      deliveryAddress: pendingOrder.shippingAddress,
      deliveryCharge: pendingOrder.pricing.deliveryCharge,
      estimatedDeliveryDate: addDays(new Date(), 3),
      verificationStatus: "unverified",
    },
  ]);

  deliveredOrder.deliveryId = deliveries[0]._id;
  pendingOrder.deliveryId = deliveries[1]._id;
  await deliveredOrder.save();
  await pendingOrder.save();

  await Payment.create({
    userId: patients[0]._id,
    orderId: deliveredOrder._id,
    paymentType: "STORE_PURCHASE",
    amount: deliveredOrder.pricing.finalAmount,
    paymentMethod: "CARD",
    paymentStatus: "SUCCESS",
    transactionId: "ORD-PAY-001",
    paidAt: addDays(new Date(), -5),
  });

  await Review.insertMany([
    {
      userId: patients[0]._id,
      targetEntity: "doctor",
      targetId: approvedDoctors[0]._id,
      rating: 5,
      comment: "Consultation was clear and helpful.",
      purchaseVerified: true,
    },
    {
      userId: patients[0]._id,
      targetEntity: "product",
      targetId: products[0]._id,
      rating: 4,
      comment: "Product arrived on time and matched expectations.",
      purchaseVerified: true,
    },
  ]);

  await MedicalRecord.create({
    patientId: patients[0]._id,
    doctorId: approvedDoctors[0]._id,
    appointmentId: completedAppointment._id,
    bloodGroup: "B+",
    height: 174,
    weight: 71,
    diagnosis: "Mild hypertension",
    symptoms: ["fatigue", "slight chest discomfort"],
    treatment: "Reduce sodium intake and continue medication",
    followUpDate: addDays(new Date(), 21),
    medicalDocuments: [],
  });

  await Notification.insertMany([
    {
      userId: approvedDoctors[0]._id,
      userModel: "Doctor",
      title: "New Appointment Booked",
      message: "A patient booked a new consultation slot.",
      type: "appointment",
      refId: pendingAppointment._id,
      refModel: "Appointment",
    },
    {
      userId: patients[0]._id,
      userModel: "User",
      title: "Order Delivered",
      message: "Your latest order has been delivered successfully.",
      type: "order_delivered",
      refId: deliveredOrder._id,
      refModel: "Order",
    },
  ]);

  console.log("Seed summary:");
  console.log(`- Admins: 1 (${admin.email})`);
  console.log(`- Patients: ${patients.length}`);
  console.log(`- Doctors: ${doctors.length} (${approvedDoctors.length} approved, ${doctors.length - approvedDoctors.length} pending)`);
  console.log(`- Categories: ${categories.length}`);
  console.log(`- Slots: ${slots.length}`);
  console.log(`- Products: ${products.length}`);
  console.log(`- Appointments: 2`);
  console.log(`- Orders: 2`);
  console.log(`- Deliveries: ${deliveries.length}`);
  console.log(`- Reviews: 2`);
  console.log("Credentials:");
  console.log("- Admin: admin@viqure.com / Admin@123");
  console.log("- Doctor: rakesh.sharma@viqure.com / Doctor@123");
  console.log("- Patient: patient1@viqure.com / Patient@123");

  await mongoose.disconnect();
  console.log("Seed complete.");
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect().catch(() => null);
  process.exit(1);
});
