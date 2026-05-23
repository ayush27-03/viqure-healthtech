const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcryptjs");

const { Doctor } = require("./server/models");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  const doctorHash = await bcrypt.hash("Doctor@123", 10);
  await Doctor.deleteMany({});

  await Doctor.insertMany([
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

  console.log("Seed complete. Only doctors seeded.");
  await mongoose.disconnect();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await mongoose.disconnect().catch(() => null);
  process.exit(1);
});
