const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Doctor } = require('./server/models');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  await Promise.all([
    User.deleteMany({}),
    Doctor.deleteMany({}),
  ]);

  const [adminPassword, doctorPassword, patientPassword] = await Promise.all([
    bcrypt.hash('Admin@123', 10),
    bcrypt.hash('Doctor@123', 10),
    bcrypt.hash('Patient@123', 10),
  ]);

  await User.create({
    name: 'Viqure Admin',
    email: 'admin@viqure.com',
    phone: '+911234567890',
    passwordHash: adminPassword,
    role: 'admin',
    gender: 'male',
    isVerified: true,
  });

  const doctorUser = await User.create({
    name: 'Dr. Rakesh Sharma',
    email: 'rakesh.sharma@viqure.com',
    phone: '+911111111111',
    passwordHash: doctorPassword,
    role: 'doctor',
    gender: 'male',
    isVerified: true,
  });

  await Doctor.create({
    userId: doctorUser._id,
    licenseNumber: 'MCI-NOIDA-001',
    specializations: ['Cardiology'],
    qualifications: ['MBBS', 'MD Cardiology'],
    experience: 10,
    consultationFee: 800,
  });

  await User.create({
    name: 'Ayush Test',
    email: 'patient1@viqure.com',
    phone: '+913333333333',
    passwordHash: patientPassword,
    role: 'patient',
    gender: 'male',
    dob: new Date('2003-03-27'),
    isVerified: true,
  });

  await mongoose.disconnect();
  console.log('🌱 Seed complete. Check Atlas Data Explorer.');
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

/**
 The seed now creates only:
1 Admin User
1 Doctor User + 1 Doctor profile doc
1 Patient User (role: 'patient' with dob pre-filled)
Total: 3 User docs + 1 Doctor doc. Ready to run.
 */