'use strict';

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

require('dotenv').config();

const {
  User,
  Category,
  Product,
  Order,
  Appointment,
  Review,
  MedicalRecord,
} = require('./server/models/index');

// ─── Global Password Hashes ───────────────────────────────────────────────────
let customerPasswordHash;
let doctorPasswordHash;
let adminPasswordHash;

// ─── Globals populated by helper functions ────────────────────────────────────
let categoryDocs   = [];
let customerDocs   = [];
let doctorDocs     = [];
let productDocs    = [];
let appointmentDocs = [];

  
// 1. CATEGORIES
   
async function createCategories() {
  const categories = [
    { name: 'Pain Relief',           icon: 'pill',       description: 'Analgesics and pain management medicines.',              isActive: true  },
    { name: 'Cold & Allergy',        icon: 'thermometer',description: 'Medicines for cold, flu, and allergic conditions.',     isActive: true  },
    { name: 'Digestive Care',        icon: 'stomach',    description: 'Products for digestive health and gut wellness.',       isActive: true  },
    { name: 'Vitamins & Supplements',icon: 'capsule',    description: 'Daily vitamins, minerals, and health supplements.',    isActive: true  },
    { name: 'First Aid',             icon: 'bandaid',    description: 'First aid essentials for home and travel.',            isActive: true  },
    { name: 'Diabetes Care',         icon: 'glucose',    description: 'Glucose monitoring, insulin accessories, and more.',   isActive: true  },
  ];

  categoryDocs = await Category.insertMany(categories);
  console.log(`✔  Categories inserted: ${categoryDocs.length}`);
}
   
// 2. USERS  (Admin + Customers + Doctors)
   
async function createUsers() {

  // ── Admin ────────────────────────────────────────────────────────────────
  const adminData = {
    email:        'admin@viqure.in',
    phone:        '+919810000001',
    passwordHash: adminPasswordHash,
    role:         'ADMIN',
    gender:       'MALE',
    dob:          new Date('1985-06-15'),
    profile:      { firstName: 'Vikash', lastName: 'Sharma' },
    addresses: [{
      type:    'WORK',
      street:  '12, Cyber Hub',
      city:    'Gurugram',
      state:   'Haryana',
      pincode: '122002',
    }],
    isVerified: true,
    isActive:   true,
  };

  await User.create(adminData);
  console.log('✔  Admin inserted: 1');

  // ── Customers ────────────────────────────────────────────────────────────
  const customerRawData = [
    { fn: 'Ayush',    ln: 'Mishra',    email: 'ayush.mishra@gmail.com',    phone: '+919811111101', gender: 'MALE',   dob: '1999-03-14', city: 'Pitampura',   state: 'Delhi',     pincode: '110034', active: true  },
    { fn: 'Rohan',    ln: 'Sharma',    email: 'rohan.sharma@gmail.com',    phone: '+919811111102', gender: 'MALE',   dob: '1997-07-22', city: 'Noida',       state: 'UP',        pincode: '201301', active: true  },
    { fn: 'Aarav',    ln: 'Verma',     email: 'aarav.verma@gmail.com',     phone: '+919811111103', gender: 'MALE',   dob: '2000-01-10', city: 'Ghaziabad',   state: 'UP',        pincode: '201002', active: true  },
    { fn: 'Priya',    ln: 'Nair',      email: 'priya.nair@gmail.com',      phone: '+919811111104', gender: 'FEMALE', dob: '1995-11-05', city: 'Faridabad',   state: 'Haryana',   pincode: '121001', active: true  },
    { fn: 'Neha',     ln: 'Kapoor',    email: 'neha.kapoor@gmail.com',     phone: '+919811111105', gender: 'FEMALE', dob: '1998-04-18', city: 'Gurugram',    state: 'Haryana',   pincode: '122001', active: true  },
    { fn: 'Rahul',    ln: 'Malhotra',  email: 'rahul.malhotra@gmail.com',  phone: '+919811111106', gender: 'MALE',   dob: '1993-09-30', city: 'Delhi',       state: 'Delhi',     pincode: '110001', active: true  },
    { fn: 'Anjali',   ln: 'Singh',     email: 'anjali.singh@gmail.com',    phone: '+919811111107', gender: 'FEMALE', dob: '2001-02-25', city: 'Noida',       state: 'UP',        pincode: '201304', active: true  },
    { fn: 'Karan',    ln: 'Gupta',     email: 'karan.gupta@gmail.com',     phone: '+919811111108', gender: 'MALE',   dob: '1996-06-12', city: 'Dwarka',      state: 'Delhi',     pincode: '110075', active: true  },
    { fn: 'Divya',    ln: 'Rao',       email: 'divya.rao@gmail.com',       phone: '+919811111109', gender: 'FEMALE', dob: '1994-08-03', city: 'Lajpat Nagar','state': 'Delhi',   pincode: '110024', active: true  },
    { fn: 'Manish',   ln: 'Tiwari',    email: 'manish.tiwari@gmail.com',   phone: '+919811111110', gender: 'MALE',   dob: '1992-12-19', city: 'Rohini',      state: 'Delhi',     pincode: '110085', active: true  },
    { fn: 'Pooja',    ln: 'Agarwal',   email: 'pooja.agarwal@gmail.com',   phone: '+919811111111', gender: 'FEMALE', dob: '1999-05-27', city: 'Sonipat',     state: 'Haryana',   pincode: '131001', active: true  },
    { fn: 'Suresh',   ln: 'Pillai',    email: 'suresh.pillai@gmail.com',   phone: '+919811111112', gender: 'MALE',   dob: '1990-10-08', city: 'Greater Noida','state': 'UP',     pincode: '201310', active: true  },
    { fn: 'Ritu',     ln: 'Bhatia',    email: 'ritu.bhatia@gmail.com',     phone: '+919811111113', gender: 'FEMALE', dob: '1997-03-16', city: 'Janakpuri',   state: 'Delhi',     pincode: '110058', active: true  },
    { fn: 'Deepak',   ln: 'Joshi',     email: 'deepak.joshi@gmail.com',    phone: '+919811111114', gender: 'MALE',   dob: '1988-07-04', city: 'Vaishali',    state: 'UP',        pincode: '201010', active: false },
    { fn: 'Swati',    ln: 'Chaudhary', email: 'swati.chaudhary@gmail.com', phone: '+919811111115', gender: 'FEMALE', dob: '2002-09-21', city: 'Indirapuram', state: 'UP',        pincode: '201014', active: false },
  ];

  const customerInserts = customerRawData.map(c => ({
    email:        c.email,
    phone:        c.phone,
    passwordHash: customerPasswordHash,
    role:         'CUSTOMER',
    gender:       c.gender,
    dob:          new Date(c.dob),
    profile:      { firstName: c.fn, lastName: c.ln },
    addresses: [{
      type:    'HOME',
      street:  `${Math.floor(Math.random() * 200) + 1}, Sector ${Math.floor(Math.random() * 50) + 1}`,
      city:    c.city,
      state:   c.state,
      pincode: c.pincode,
    }],
    cart:       [],
    isVerified: true,
    isActive:   c.active,
  }));

  customerDocs = await User.insertMany(customerInserts);
  console.log(`✔  Customers inserted: ${customerDocs.length}`);
}


   
// 3. DOCTORS
   
async function createDoctors() {
  const baseDate = new Date('2025-07-01');

  function buildSlots(count = 6) {
    const slots = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      slots.push({ date: d, startTime: '10:00', endTime: '10:30', isBooked: i < 2 });
      slots.push({ date: d, startTime: '11:00', endTime: '11:30', isBooked: false });
      slots.push({ date: d, startTime: '14:00', endTime: '14:30', isBooked: i < 1 });
    }
    return slots;
  }

  const doctorRawData = [
    // APPROVED (7)
    {
      fn: 'Amit',    ln: 'Sharma',    email: 'dr.amit.sharma@viqure.in',    phone: '+919822220001',
      gender: 'MALE',   dob: '1978-04-10', specialty: 'Cardiology',
      license: 'MCI-DL-2005-4821', fee: 800,  exp: 19, rating: 4.8, totalRatings: 124, totalAppts: 312,
      quals: ['MBBS – AIIMS Delhi', 'MD Cardiology – AIIMS Delhi', 'DM Cardiology – PGIMER Chandigarh'],
      bio: 'Senior cardiologist with 19 years of experience in interventional cardiology and cardiac imaging.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Neha',    ln: 'Verma',     email: 'dr.neha.verma@viqure.in',     phone: '+919822220002',
      gender: 'FEMALE', dob: '1985-09-22', specialty: 'Dermatology',
      license: 'MCI-DL-2011-7732', fee: 600,  exp: 13, rating: 4.6, totalRatings: 98,  totalAppts: 241,
      quals: ['MBBS – Maulana Azad Medical College', 'MD Dermatology – LHMC Delhi'],
      bio: 'Expert dermatologist specialising in acne, pigmentation, and cosmetic dermatology.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Rajesh',  ln: 'Kumar',     email: 'dr.rajesh.kumar@viqure.in',   phone: '+919822220003',
      gender: 'MALE',   dob: '1975-12-01', specialty: 'General Medicine',
      license: 'MCI-DL-2001-3310', fee: 400,  exp: 23, rating: 4.5, totalRatings: 210, totalAppts: 580,
      quals: ['MBBS – Safdarjung Hospital', 'MD General Medicine – PGIMER Chandigarh'],
      bio: 'Experienced general physician providing comprehensive primary care for adults and elderly.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Sonia',   ln: 'Mehta',     email: 'dr.sonia.mehta@viqure.in',    phone: '+919822220004',
      gender: 'FEMALE', dob: '1983-03-14', specialty: 'Pediatrics',
      license: 'MCI-DL-2009-6128', fee: 550,  exp: 15, rating: 4.9, totalRatings: 175, totalAppts: 427,
      quals: ['MBBS – Lady Hardinge Medical College', 'MD Pediatrics – AIIMS Delhi'],
      bio: 'Dedicated paediatrician with a focus on child nutrition, immunisation, and developmental health.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Vikram',  ln: 'Singh',     email: 'dr.vikram.singh@viqure.in',   phone: '+919822220005',
      gender: 'MALE',   dob: '1979-07-19', specialty: 'Orthopedics',
      license: 'MCI-DL-2006-5543', fee: 700,  exp: 18, rating: 4.7, totalRatings: 143, totalAppts: 355,
      quals: ['MBBS – UCMS Delhi', 'MS Orthopaedics – AIIMS Delhi', 'Fellowship Joint Replacement – UK'],
      bio: 'Orthopaedic surgeon specialising in joint replacement, sports injuries, and spine care.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Preethi', ln: 'Nambiar',   email: 'dr.preethi.nambiar@viqure.in',phone: '+919822220006',
      gender: 'FEMALE', dob: '1987-11-30', specialty: 'ENT',
      license: 'MCI-DL-2013-8840', fee: 500,  exp: 11, rating: 4.4, totalRatings: 67,  totalAppts: 189,
      quals: ['MBBS – Kasturba Medical College', 'MS ENT – JIPMER Puducherry'],
      bio: 'ENT specialist with expertise in sinusitis, hearing disorders, and head & neck surgeries.',
      approvalStatus: 'APPROVED',
    },
    {
      fn: 'Arun',    ln: 'Pillai',    email: 'dr.arun.pillai@viqure.in',    phone: '+919822220007',
      gender: 'MALE',   dob: '1981-02-08', specialty: 'General Medicine',
      license: 'MCI-DL-2007-6001', fee: 350,  exp: 17, rating: 4.3, totalRatings: 89,  totalAppts: 263,
      quals: ['MBBS – Trivandrum Medical College', 'MD General Medicine – KEM Mumbai'],
      bio: 'General physician with a patient-first approach, experienced in chronic disease management.',
      approvalStatus: 'APPROVED',
    },
    // PENDING (2)
    {
      fn: 'Kavya',   ln: 'Reddy',     email: 'dr.kavya.reddy@viqure.in',    phone: '+919822220008',
      gender: 'FEMALE', dob: '1990-06-25', specialty: 'Dermatology',
      license: 'MCI-TS-2016-9901', fee: 450,  exp: 8,  rating: 0,   totalRatings: 0,   totalAppts: 0,
      quals: ['MBBS – Osmania Medical College', 'MD Dermatology – Nizam Institute'],
      bio: 'Dermatologist seeking to serve patients with evidence-based skincare treatments.',
      approvalStatus: 'PENDING',
    },
    {
      fn: 'Sameer',  ln: 'Chandra',   email: 'dr.sameer.chandra@viqure.in', phone: '+919822220009',
      gender: 'MALE',   dob: '1988-10-14', specialty: 'Pediatrics',
      license: 'MCI-MH-2014-4422', fee: 500,  exp: 10, rating: 0,   totalRatings: 0,   totalAppts: 0,
      quals: ['MBBS – BJ Medical College Pune', 'DCH – KEM Mumbai'],
      bio: 'Paediatrician passionate about preventive child healthcare and early childhood development.',
      approvalStatus: 'PENDING',
    },
    // REJECTED (1)
    {
      fn: 'Gaurav',  ln: 'Bansal',    email: 'dr.gaurav.bansal@viqure.in',  phone: '+919822220010',
      gender: 'MALE',   dob: '1982-01-17', specialty: 'Cardiology',
      license: 'MCI-RJ-2008-3387', fee: 600,  exp: 16, rating: 0,   totalRatings: 0,   totalAppts: 0,
      quals: ['MBBS – SMS Medical College Jaipur'],
      bio: 'Cardiologist applicant. Application rejected due to incomplete documentation.',
      approvalStatus: 'REJECTED',
    },
  ];

  const doctorInserts = doctorRawData.map(d => ({
    email:        d.email,
    phone:        d.phone,
    passwordHash: doctorPasswordHash,
    role:         'DOCTOR',
    gender:       d.gender,
    dob:          new Date(d.dob),
    profile:      { firstName: d.fn, lastName: d.ln },
    addresses: [{
      type:    'WORK',
      street:  'Viqure Clinic, Sector 18',
      city:    'Noida',
      state:   'UP',
      pincode: '201301',
    }],
    detailsOfHealthCareProfessional: {
      medicalLicense:      d.license,
      approvalStatus:      d.approvalStatus,
      consultationFee:     d.fee,
      qualifications:      d.quals,
      yearsOfExperience:   d.exp,
      bio:                 d.bio,
      averageRating:       d.rating,
      timeSlots:           d.approvalStatus === 'APPROVED' ? buildSlots(6) : [],
      isAvailable:         d.approvalStatus === 'APPROVED',
      stats: {
        rating:            d.rating,
        totalRatings:      d.totalRatings,
        totalAppointments: d.totalAppts,
      },
    },
    isVerified: d.approvalStatus === 'APPROVED',
    isActive:   d.approvalStatus !== 'REJECTED',
  }));

  doctorDocs = await User.insertMany(doctorInserts);
  console.log(`✔  Doctors inserted: ${doctorDocs.length}`);
}


   
// 4. PRODUCTS
   
async function createProducts() {
  const cat = name => categoryDocs.find(c => c.name === name)._id;

  const nearExpiry  = new Date('2025-09-01');
  const goodExpiry  = new Date('2027-06-01');
  const farExpiry   = new Date('2028-01-01');

  const productRawData = [
    // ── Pain Relief (5) ───────────────────────────────────────────────────
    {
      name: 'Dolo 650', catName: 'Pain Relief', description: 'Paracetamol 650 mg tablet for fever and mild pain.',
      sku: 'PR-DOL-650', supplier: 'Micro Labs Ltd', warehouse: 'WH-NOIDA-01',
      stock: 500, reorder: 50,
      batch: { batchNumber: 'BT-DOL-001', expiryDate: goodExpiry, quantity: 500 },
      mrp: 32, purchase: 18, base: 29, disc: 0, tax: 5, final: 29,
      specs: { dosage: '1 tablet every 4–6 hours', saltComposition: 'Paracetamol 650mg', form: 'Tablet', packSize: '15 tablets' },
    },
    {
      name: 'Crocin Advance', catName: 'Pain Relief', description: 'Fast-acting paracetamol tablet for headache and body ache.',
      sku: 'PR-CRC-ADV', supplier: 'GSK India', warehouse: 'WH-NOIDA-01',
      stock: 320, reorder: 40,
      batch: { batchNumber: 'BT-CRC-001', expiryDate: goodExpiry, quantity: 320 },
      mrp: 45, purchase: 25, base: 40, disc: 5, tax: 5, final: 38,
      specs: { dosage: '1 tablet every 6 hours', saltComposition: 'Paracetamol 500mg', form: 'Tablet', packSize: '15 tablets' },
    },
    {
      name: 'Combiflam', catName: 'Pain Relief', description: 'Ibuprofen + Paracetamol combination for pain and inflammation.',
      sku: 'PR-CMB-400', supplier: 'Sanofi India', warehouse: 'WH-NOIDA-01',
      stock: 18, reorder: 30,
      batch: { batchNumber: 'BT-CMB-001', expiryDate: nearExpiry, quantity: 18 },
      mrp: 52, purchase: 30, base: 48, disc: 0, tax: 12, final: 48,
      specs: { dosage: '1 tablet three times daily after food', saltComposition: 'Ibuprofen 400mg + Paracetamol 325mg', form: 'Tablet', packSize: '20 tablets' },
    },
    {
      name: 'Volini Spray', catName: 'Pain Relief', description: 'Topical analgesic spray for muscle and joint pain.',
      sku: 'PR-VOL-SPR', supplier: 'Pfizer India', warehouse: 'WH-NOIDA-01',
      stock: 95, reorder: 20,
      batch: { batchNumber: 'BT-VOL-001', expiryDate: goodExpiry, quantity: 95 },
      mrp: 185, purchase: 110, base: 170, disc: 8, tax: 12, final: 156,
      specs: { saltComposition: 'Diclofenac Diethylamine 4% w/w', form: 'Topical Spray', packSize: '60g' },
    },
    {
      name: 'Moov Cream', catName: 'Pain Relief', description: 'Ayurvedic pain relief cream for back pain and sprains.',
      sku: 'PR-MOV-CRM', supplier: 'Reckitt India', warehouse: 'WH-NOIDA-02',
      stock: 210, reorder: 25,
      batch: { batchNumber: 'BT-MOV-001', expiryDate: farExpiry, quantity: 210 },
      mrp: 95, purchase: 55, base: 88, disc: 5, tax: 12, final: 84,
      specs: { saltComposition: 'Mint Oil 5% + Turpentine Oil 3%', form: 'Cream', packSize: '50g' },
    },

    // ── Cold & Allergy (5) ────────────────────────────────────────────────
    {
      name: 'Cetirizine 10mg', catName: 'Cold & Allergy', description: 'Second-generation antihistamine for allergic rhinitis and urticaria.',
      sku: 'CA-CET-010', supplier: 'Sun Pharma', warehouse: 'WH-NOIDA-01',
      stock: 400, reorder: 40,
      batch: { batchNumber: 'BT-CET-001', expiryDate: goodExpiry, quantity: 400 },
      mrp: 25, purchase: 10, base: 22, disc: 0, tax: 5, final: 22,
      specs: { saltComposition: 'Cetirizine HCl 10mg', form: 'Tablet', packSize: '10 tablets' },
    },
    {
      name: 'Benadryl Cough Syrup', catName: 'Cold & Allergy', description: 'Diphenhydramine-based syrup for dry cough and allergic cough.',
      sku: 'CA-BND-SYR', supplier: 'Pfizer India', warehouse: 'WH-NOIDA-02',
      stock: 130, reorder: 30,
      batch: { batchNumber: 'BT-BND-001', expiryDate: goodExpiry, quantity: 130 },
      mrp: 115, purchase: 65, base: 105, disc: 5, tax: 12, final: 100,
      specs: { saltComposition: 'Diphenhydramine 14.08mg + Ammonium Chloride', form: 'Syrup', packSize: '100 ml' },
    },
    {
      name: 'Allegra 120mg', catName: 'Cold & Allergy', description: 'Non-drowsy antihistamine for seasonal allergic rhinitis.',
      sku: 'CA-ALG-120', supplier: 'Sanofi India', warehouse: 'WH-NOIDA-01',
      stock: 9, reorder: 20,
      batch: { batchNumber: 'BT-ALG-001', expiryDate: nearExpiry, quantity: 9 },
      mrp: 140, purchase: 90, base: 128, disc: 0, tax: 5, final: 128,
      specs: { saltComposition: 'Fexofenadine HCl 120mg', form: 'Tablet', packSize: '10 tablets' },
    },
    {
      name: 'Ascoril LS Syrup', catName: 'Cold & Allergy', description: 'Expectorant and bronchodilator syrup for productive cough.',
      sku: 'CA-ASC-SYR', supplier: 'Glenmark Pharma', warehouse: 'WH-NOIDA-01',
      stock: 175, reorder: 25,
      batch: { batchNumber: 'BT-ASC-001', expiryDate: goodExpiry, quantity: 175 },
      mrp: 130, purchase: 75, base: 119, disc: 0, tax: 12, final: 119,
      specs: { saltComposition: 'Levosalbutamol + Ambroxol + Guaifenesin', form: 'Syrup', packSize: '100 ml' },
    },
    {
      name: 'Vicks VapoRub', catName: 'Cold & Allergy', description: 'Topical ointment for nasal congestion, cough, and cold relief.',
      sku: 'CA-VCK-RUB', supplier: 'P&G India', warehouse: 'WH-NOIDA-02',
      stock: 280, reorder: 30,
      batch: { batchNumber: 'BT-VCK-001', expiryDate: farExpiry, quantity: 280 },
      mrp: 68, purchase: 38, base: 62, disc: 0, tax: 12, final: 62,
      specs: { saltComposition: 'Camphor 5.26% + Menthol 2.82% + Eucalyptus Oil 1.49%', form: 'Ointment', packSize: '25g' },
    },

    // ── Digestive Care (5) ────────────────────────────────────────────────
    {
      name: 'Pantocid DSR', catName: 'Digestive Care', description: 'Proton pump inhibitor for acid reflux and GERD.',
      sku: 'DC-PAN-DSR', supplier: 'Sun Pharma', warehouse: 'WH-NOIDA-01',
      stock: 260, reorder: 35,
      batch: { batchNumber: 'BT-PAN-001', expiryDate: goodExpiry, quantity: 260 },
      mrp: 195, purchase: 110, base: 175, disc: 10, tax: 5, final: 157,
      specs: { saltComposition: 'Pantoprazole 40mg + Domperidone 30mg SR', form: 'Capsule', packSize: '15 capsules' },
    },
    {
      name: 'Digene Gel', catName: 'Digestive Care', description: 'Antacid gel for acidity, heartburn, and indigestion.',
      sku: 'DC-DGN-GEL', supplier: 'Abbott India', warehouse: 'WH-NOIDA-01',
      stock: 320, reorder: 40,
      batch: { batchNumber: 'BT-DGN-001', expiryDate: goodExpiry, quantity: 320 },
      mrp: 88, purchase: 48, base: 80, disc: 0, tax: 12, final: 80,
      specs: { saltComposition: 'Magnesium Hydroxide + Aluminium Hydroxide + Simethicone', form: 'Gel', packSize: '200 ml' },
    },
    {
      name: 'Electral Powder', catName: 'Digestive Care', description: 'ORS sachets for rehydration in diarrhoea and dehydration.',
      sku: 'DC-ELC-ORS', supplier: 'Franco-Indian Pharma', warehouse: 'WH-NOIDA-02',
      stock: 500, reorder: 60,
      batch: { batchNumber: 'BT-ELC-001', expiryDate: farExpiry, quantity: 500 },
      mrp: 28, purchase: 12, base: 25, disc: 0, tax: 5, final: 25,
      specs: { saltComposition: 'Sodium Chloride + Potassium Chloride + Glucose Anhydrous', form: 'Powder Sachet', packSize: '21.8g sachet' },
    },
    {
      name: 'ENO Powder', catName: 'Digestive Care', description: 'Fast-acting antacid powder for instant relief from acidity.',
      sku: 'DC-ENO-PWD', supplier: 'GSK India', warehouse: 'WH-NOIDA-01',
      stock: 12, reorder: 20,
      batch: { batchNumber: 'BT-ENO-001', expiryDate: nearExpiry, quantity: 12 },
      mrp: 36, purchase: 18, base: 32, disc: 0, tax: 12, final: 32,
      specs: { saltComposition: 'Sodium Bicarbonate + Citric Acid', form: 'Effervescent Powder', packSize: '5g sachet' },
    },
    {
      name: 'Omez 20mg', catName: 'Digestive Care', description: 'Omeprazole capsule for peptic ulcers and acid reflux.',
      sku: 'DC-OMZ-020', supplier: 'Dr Reddys Laboratories', warehouse: 'WH-NOIDA-01',
      stock: 185, reorder: 30,
      batch: { batchNumber: 'BT-OMZ-001', expiryDate: goodExpiry, quantity: 185 },
      mrp: 60, purchase: 30, base: 54, disc: 5, tax: 5, final: 51,
      specs: { saltComposition: 'Omeprazole 20mg', form: 'Capsule', packSize: '10 capsules' },
    },

    // ── Vitamins & Supplements (5) ────────────────────────────────────────
    {
      name: 'Limcee 500mg', catName: 'Vitamins & Supplements', description: 'Chewable Vitamin C tablet for immunity and antioxidant support.',
      sku: 'VS-LMC-500', supplier: 'Abbott India', warehouse: 'WH-NOIDA-01',
      stock: 600, reorder: 50,
      batch: { batchNumber: 'BT-LMC-001', expiryDate: farExpiry, quantity: 600 },
      mrp: 35, purchase: 15, base: 30, disc: 0, tax: 5, final: 30,
      specs: { saltComposition: 'Ascorbic Acid 500mg', form: 'Chewable Tablet', packSize: '15 tablets' },
    },
    {
      name: 'Supradyn Daily', catName: 'Vitamins & Supplements', description: 'Multivitamin and multimineral tablet for daily nutritional support.',
      sku: 'VS-SPD-DLY', supplier: 'Bayer India', warehouse: 'WH-NOIDA-01',
      stock: 240, reorder: 30,
      batch: { batchNumber: 'BT-SPD-001', expiryDate: goodExpiry, quantity: 240 },
      mrp: 165, purchase: 95, base: 150, disc: 5, tax: 12, final: 142,
      specs: { form: 'Effervescent Tablet', packSize: '15 tablets' },
    },
    {
      name: 'Zincovit Tablet', catName: 'Vitamins & Supplements', description: 'Zinc + multivitamin tablet for immune defence and growth.',
      sku: 'VS-ZCV-TAB', supplier: 'Apex Laboratories', warehouse: 'WH-NOIDA-02',
      stock: 310, reorder: 30,
      batch: { batchNumber: 'BT-ZCV-001', expiryDate: goodExpiry, quantity: 310 },
      mrp: 170, purchase: 95, base: 155, disc: 5, tax: 12, final: 147,
      specs: { saltComposition: 'Zinc 4mg + Vitamins A, B, C, D', form: 'Tablet', packSize: '15 tablets' },
    },
    {
      name: 'Revital H', catName: 'Vitamins & Supplements', description: 'Ginseng-based energy supplement for vitality and stamina.',
      sku: 'VS-RVT-H00', supplier: 'Sun Pharma', warehouse: 'WH-NOIDA-01',
      stock: 8, reorder: 20,
      batch: { batchNumber: 'BT-RVT-001', expiryDate: nearExpiry, quantity: 8 },
      mrp: 295, purchase: 170, base: 269, disc: 5, tax: 12, final: 255,
      specs: { saltComposition: 'Ginseng 42.5mg + Vitamins + Minerals', form: 'Capsule', packSize: '30 capsules' },
    },
    {
      name: 'Shelcal 500', catName: 'Vitamins & Supplements', description: 'Calcium and Vitamin D3 supplement for bone strength.',
      sku: 'VS-SHC-500', supplier: 'Elder Pharma', warehouse: 'WH-NOIDA-01',
      stock: 190, reorder: 25,
      batch: { batchNumber: 'BT-SHC-001', expiryDate: goodExpiry, quantity: 190 },
      mrp: 120, purchase: 65, base: 110, disc: 0, tax: 5, final: 110,
      specs: { saltComposition: 'Calcium Carbonate 1250mg + Vitamin D3 250 IU', form: 'Tablet', packSize: '15 tablets' },
    },

    // ── First Aid (5) ─────────────────────────────────────────────────────
    {
      name: 'Dettol Antiseptic Liquid', catName: 'First Aid', description: 'Multi-use antiseptic liquid for cuts, wounds, and surface disinfection.',
      sku: 'FA-DTL-LQD', supplier: 'Reckitt India', warehouse: 'WH-NOIDA-02',
      stock: 350, reorder: 40,
      batch: { batchNumber: 'BT-DTL-001', expiryDate: farExpiry, quantity: 350 },
      mrp: 99, purchase: 55, base: 89, disc: 0, tax: 18, final: 89,
      specs: { saltComposition: 'Chloroxylenol 4.8% w/v', form: 'Liquid', packSize: '100 ml' },
    },
    {
      name: 'Band Aid Classic', catName: 'First Aid', description: 'Flexible fabric adhesive bandages for minor cuts and blisters.',
      sku: 'FA-BND-AID', supplier: 'Johnson & Johnson India', warehouse: 'WH-NOIDA-02',
      stock: 420, reorder: 50,
      batch: { batchNumber: 'BT-BND-AID-001', expiryDate: farExpiry, quantity: 420 },
      mrp: 65, purchase: 35, base: 58, disc: 5, tax: 18, final: 55,
      specs: { form: 'Adhesive Strip', packSize: '10 strips' },
    },
    {
      name: 'Savlon Antiseptic Cream', catName: 'First Aid', description: 'Topical antiseptic cream to prevent infection in minor skin injuries.',
      sku: 'FA-SVL-CRM', supplier: 'ITC Ltd', warehouse: 'WH-NOIDA-02',
      stock: 15, reorder: 25,
      batch: { batchNumber: 'BT-SVL-001', expiryDate: nearExpiry, quantity: 15 },
      mrp: 78, purchase: 42, base: 70, disc: 0, tax: 12, final: 70,
      specs: { saltComposition: 'Cetrimide 0.5% + Chlorhexidine 0.1%', form: 'Cream', packSize: '30g' },
    },
    {
      name: 'Cotton Roll Sterile', catName: 'First Aid', description: 'Absorbent cotton roll for wound dressing and cleaning.',
      sku: 'FA-CTN-ROL', supplier: 'Romsons India', warehouse: 'WH-NOIDA-02',
      stock: 200, reorder: 30,
      batch: { batchNumber: 'BT-CTN-001', expiryDate: farExpiry, quantity: 200 },
      mrp: 45, purchase: 20, base: 40, disc: 0, tax: 5, final: 40,
      specs: { form: 'Cotton Roll', packSize: '50g' },
    },
    {
      name: 'Sterile Gauze Pad', catName: 'First Aid', description: 'Non-adherent sterile gauze pads for wound care and dressing.',
      sku: 'FA-GZP-STR', supplier: 'Romsons India', warehouse: 'WH-NOIDA-02',
      stock: 145, reorder: 25,
      batch: { batchNumber: 'BT-GZP-001', expiryDate: farExpiry, quantity: 145 },
      mrp: 55, purchase: 25, base: 48, disc: 0, tax: 5, final: 48,
      specs: { form: 'Gauze Pad', packSize: '10 pads, 10x10 cm' },
    },

    // ── Diabetes Care (5) ─────────────────────────────────────────────────
    {
      name: 'OneTouch Select Test Strips', catName: 'Diabetes Care', description: 'Blood glucose test strips compatible with OneTouch Select glucometers.',
      sku: 'DC-OTS-STR', supplier: 'LifeScan India', warehouse: 'WH-NOIDA-01',
      stock: 220, reorder: 30,
      batch: { batchNumber: 'BT-OTS-001', expiryDate: goodExpiry, quantity: 220 },
      mrp: 699, purchase: 420, base: 649, disc: 5, tax: 12, final: 617,
      specs: { form: 'Test Strip', packSize: '50 strips', compatibility: 'OneTouch Select / Select Plus' },
    },
    {
      name: 'Accu-Chek Active Test Strips', catName: 'Diabetes Care', description: 'Blood glucose test strips for Accu-Chek Active glucose monitoring system.',
      sku: 'DC-ACK-STR', supplier: 'Roche Diabetes Care India', warehouse: 'WH-NOIDA-01',
      stock: 7, reorder: 20,
      batch: { batchNumber: 'BT-ACK-001', expiryDate: nearExpiry, quantity: 7 },
      mrp: 749, purchase: 450, base: 699, disc: 5, tax: 12, final: 664,
      specs: { form: 'Test Strip', packSize: '50 strips', compatibility: 'Accu-Chek Active' },
    },
    {
      name: 'Sugar Free Gold Tablets', catName: 'Diabetes Care', description: 'Zero-calorie sweetener tablets made with Aspartame for diabetics.',
      sku: 'DC-SFG-TAB', supplier: 'Zydus Wellness', warehouse: 'WH-NOIDA-01',
      stock: 380, reorder: 40,
      batch: { batchNumber: 'BT-SFG-001', expiryDate: farExpiry, quantity: 380 },
      mrp: 135, purchase: 75, base: 120, disc: 5, tax: 12, final: 114,
      specs: { saltComposition: 'Aspartame 18mg per tablet', form: 'Tablet', packSize: '300 tablets' },
    },
    {
      name: 'Dr. Gene AccuSure Glucometer Kit', catName: 'Diabetes Care', description: 'Complete blood glucose monitoring kit with glucometer and 10 test strips.',
      sku: 'DC-AGM-KIT', supplier: 'Dr Gene India', warehouse: 'WH-NOIDA-01',
      stock: 60, reorder: 15,
      batch: { batchNumber: 'BT-AGM-001', expiryDate: goodExpiry, quantity: 60 },
      mrp: 999, purchase: 600, base: 899, disc: 10, tax: 12, final: 809,
      specs: { form: 'Kit', packSize: 'Glucometer + 10 strips + Lancets + Lancing Device + Case' },
    },
    {
      name: 'BD Ultra-Fine Pen Lancets', catName: 'Diabetes Care', description: '33G ultra-fine pen lancets for near-painless blood sampling.',
      sku: 'DC-BDL-33G', supplier: 'Becton Dickinson India', warehouse: 'WH-NOIDA-01',
      stock: 11, reorder: 20,
      batch: { batchNumber: 'BT-BDL-001', expiryDate: nearExpiry, quantity: 11 },
      mrp: 295, purchase: 175, base: 269, disc: 5, tax: 12, final: 255,
      specs: { gauge: '33G', form: 'Lancet', packSize: '100 lancets' },
    },
  ];

  const productInserts = productRawData.map(p => ({
    name:        p.name,
    categoryId:  cat(p.catName),
    description: p.description,
    images:      [`https://cdn.viqure.in/products/${p.sku.toLowerCase()}.jpg`],
    pricing: {
      mrp:                p.mrp,
      purchasePrice:      p.purchase,
      basePrice:          p.base,
      discountPercentage: p.disc,
      taxRate:            p.tax,
      finalPrice:         p.final,
    },
    inventory: {
      sku:          p.sku,
      supplier:     p.supplier,
      warehouse:    p.warehouse,
      stockCount:   p.stock,
      reorderLevel: p.reorder,
      batches:      [p.batch],
    },
    specifications: p.specs,
    isActive: true,
  }));

  productDocs = await Product.insertMany(productInserts);
  console.log(`✔  Products inserted: ${productDocs.length}`);
}


   
// 5. ASSIGN CARTS  (5 customers)
   
async function assignCarts() {
  const cartAssignments = [
    { custIdx: 0, items: [{ pIdx: 0, qty: 2 }, { pIdx: 15, qty: 1 }] },
    { custIdx: 1, items: [{ pIdx: 5, qty: 1 }, { pIdx: 6, qty: 1 }, { pIdx: 16, qty: 1 }] },
    { custIdx: 2, items: [{ pIdx: 10, qty: 3 }] },
    { custIdx: 3, items: [{ pIdx: 20, qty: 1 }, { pIdx: 21, qty: 2 }] },
    { custIdx: 4, items: [{ pIdx: 25, qty: 1 }, { pIdx: 28, qty: 1 }] },
  ];

  for (const assignment of cartAssignments) {
    const cart = assignment.items.map(i => ({
      productId: productDocs[i.pIdx]._id,
      quantity:  i.qty,
    }));
    await User.findByIdAndUpdate(customerDocs[assignment.custIdx]._id, { cart });
  }

  console.log(`✔  Carts assigned: ${cartAssignments.length} customers`);
}


   
// 6. APPOINTMENTS
   
async function createAppointments() {
  const approvedDoctors = doctorDocs.filter(d =>
    d.detailsOfHealthCareProfessional.approvalStatus === 'APPROVED'
  );

  const d  = idx => approvedDoctors[idx % approvedDoctors.length]._id;
  const p  = idx => customerDocs[idx]._id;
  const dt = (y, m, day, h = 10, min = 0) => new Date(y, m - 1, day, h, min);

  const appointmentData = [
    // BOOKED (3)
    {
      patientId: p(0), doctorId: d(0),
      schedule:  { scheduledAt: dt(2025, 7, 15), slotTime: '10:00 AM', startDateTime: dt(2025, 7, 15, 10), endDateTime: dt(2025, 7, 15, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0001', meetingLink: 'https://meet.viqure.in/MTG-2025-0001' },
      financials: { consultationFee: 800, taxAmount: 144, totalAmount: 944, refundableAmount: 944 },
      paymentDetails: { status: 'PENDING', currency: 'INR' },
      appointmentStatus: 'BOOKED', reason: 'Chest pain and palpitations for the past 3 days.',
    },
    {
      patientId: p(1), doctorId: d(1),
      schedule:  { scheduledAt: dt(2025, 7, 16), slotTime: '11:00 AM', startDateTime: dt(2025, 7, 16, 11), endDateTime: dt(2025, 7, 16, 11, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0002', meetingLink: 'https://meet.viqure.in/MTG-2025-0002' },
      financials: { consultationFee: 600, taxAmount: 108, totalAmount: 708, refundableAmount: 708 },
      paymentDetails: { status: 'PENDING', currency: 'INR' },
      appointmentStatus: 'BOOKED', reason: 'Acne breakout on face and neck. Looking for dermatologist advice.',
    },
    {
      patientId: p(2), doctorId: d(2),
      schedule:  { scheduledAt: dt(2025, 7, 17), slotTime: '02:00 PM', startDateTime: dt(2025, 7, 17, 14), endDateTime: dt(2025, 7, 17, 14, 30) },
      meeting:   { consultationType: 'PHONE', meetingId: 'MTG-2025-0003', meetingLink: '' },
      financials: { consultationFee: 400, taxAmount: 72, totalAmount: 472, refundableAmount: 472 },
      paymentDetails: { status: 'PENDING', currency: 'INR' },
      appointmentStatus: 'BOOKED', reason: 'Persistent fever and body ache for 4 days.',
    },

    // CONFIRMED (3)
    {
      patientId: p(3), doctorId: d(3),
      schedule:  { scheduledAt: dt(2025, 7, 18), slotTime: '10:00 AM', startDateTime: dt(2025, 7, 18, 10), endDateTime: dt(2025, 7, 18, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0004', meetingLink: 'https://meet.viqure.in/MTG-2025-0004' },
      financials: { consultationFee: 550, taxAmount: 99, totalAmount: 649, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-CONF-0001', status: 'PAID', currency: 'INR', paidAt: dt(2025, 7, 14) },
      appointmentStatus: 'CONFIRMED', reason: 'Child with recurring ear infections and hearing difficulty.',
    },
    {
      patientId: p(4), doctorId: d(4),
      schedule:  { scheduledAt: dt(2025, 7, 19), slotTime: '11:00 AM', startDateTime: dt(2025, 7, 19, 11), endDateTime: dt(2025, 7, 19, 11, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0005', meetingLink: 'https://meet.viqure.in/MTG-2025-0005' },
      financials: { consultationFee: 700, taxAmount: 126, totalAmount: 826, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-CONF-0002', status: 'PAID', currency: 'INR', paidAt: dt(2025, 7, 15) },
      appointmentStatus: 'CONFIRMED', reason: 'Right knee pain after sports injury. Difficulty walking.',
    },
    {
      patientId: p(5), doctorId: d(5),
      schedule:  { scheduledAt: dt(2025, 7, 20), slotTime: '02:00 PM', startDateTime: dt(2025, 7, 20, 14), endDateTime: dt(2025, 7, 20, 14, 30) },
      meeting:   { consultationType: 'IN_PERSON', meetingId: 'MTG-2025-0006', meetingLink: '' },
      financials: { consultationFee: 500, taxAmount: 90, totalAmount: 590, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-CONF-0003', status: 'PAID', currency: 'INR', paidAt: dt(2025, 7, 16) },
      appointmentStatus: 'CONFIRMED', reason: 'Blocked nose, reduced sense of smell, and sinus headache.',
    },

    // COMPLETED (5)
    {
      patientId: p(6), doctorId: d(0),
      schedule:  { scheduledAt: dt(2025, 6, 5), slotTime: '10:00 AM', startDateTime: dt(2025, 6, 5, 10), endDateTime: dt(2025, 6, 5, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0007', meetingLink: 'https://meet.viqure.in/MTG-2025-0007' },
      financials: { consultationFee: 800, taxAmount: 144, totalAmount: 944, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-COMP-0001', status: 'PAID', currency: 'INR', paidAt: dt(2025, 6, 4) },
      appointmentStatus: 'COMPLETED', reason: 'Follow-up for hypertension management.',
      doctorRemarks: { text: 'Blood pressure well-controlled on current medication. Continue Amlodipine 5mg. Advised low-sodium diet and 30 min daily walk. Next review in 4 weeks.', mode: 'Text' },
      feedback: { rating: 5, comment: 'Dr. Sharma is exceptional. Very thorough and explained everything clearly.' },
    },
    {
      patientId: p(7), doctorId: d(1),
      schedule:  { scheduledAt: dt(2025, 6, 8), slotTime: '11:00 AM', startDateTime: dt(2025, 6, 8, 11), endDateTime: dt(2025, 6, 8, 11, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0008', meetingLink: 'https://meet.viqure.in/MTG-2025-0008' },
      financials: { consultationFee: 600, taxAmount: 108, totalAmount: 708, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-COMP-0002', status: 'PAID', currency: 'INR', paidAt: dt(2025, 6, 7) },
      appointmentStatus: 'COMPLETED', reason: 'Dark patches on face and neck.',
      doctorRemarks: { text: 'Melasma confirmed. Prescribed Tri-Luma cream. Advised SPF 50 sunscreen daily. Avoid sun exposure between 10am–3pm. Review in 6 weeks.', mode: 'Text' },
      feedback: { rating: 4, comment: 'Good consultation. Prescription is working. Could be a bit more detailed about side effects.' },
    },
    {
      patientId: p(8), doctorId: d(2),
      schedule:  { scheduledAt: dt(2025, 6, 10), slotTime: '02:00 PM', startDateTime: dt(2025, 6, 10, 14), endDateTime: dt(2025, 6, 10, 14, 30) },
      meeting:   { consultationType: 'PHONE', meetingId: 'MTG-2025-0009', meetingLink: '' },
      financials: { consultationFee: 400, taxAmount: 72, totalAmount: 472, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-COMP-0003', status: 'PAID', currency: 'INR', paidAt: dt(2025, 6, 9) },
      appointmentStatus: 'COMPLETED', reason: 'Recurring stomach aches and bloating after meals.',
      doctorRemarks: { text: 'Suspected IBS. Prescribed Mebeverine 135mg twice daily. Advised to maintain a food diary and avoid spicy and fatty foods. Ordered stool test.', mode: 'Text' },
      feedback: { rating: 5, comment: 'Very helpful. The dietary advice alone has made a huge difference.' },
      reportedIssue: { issue: 'Doctor joined the call 15 minutes late.', reportedAt: dt(2025, 6, 10, 15), status: 'RESOLVED', resolution: 'Apology sent and partial refund of ₹100 issued.' },
    },
    {
      patientId: p(9), doctorId: d(3),
      schedule:  { scheduledAt: dt(2025, 6, 12), slotTime: '10:00 AM', startDateTime: dt(2025, 6, 12, 10), endDateTime: dt(2025, 6, 12, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0010', meetingLink: 'https://meet.viqure.in/MTG-2025-0010' },
      financials: { consultationFee: 550, taxAmount: 99, totalAmount: 649, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-COMP-0004', status: 'PAID', currency: 'INR', paidAt: dt(2025, 6, 11) },
      appointmentStatus: 'COMPLETED', reason: 'Child not gaining weight appropriately. Concerned about growth.',
      doctorRemarks: { text: 'Child weight and height within normal range for age. No deficiency found. Advised balanced diet with iron-rich foods. Growth chart shared. No medication required.', mode: 'Text' },
      feedback: { rating: 5, comment: 'Dr. Sonia is amazing with kids. My son was completely at ease. Highly recommend.' },
    },
    {
      patientId: p(10), doctorId: d(4),
      schedule:  { scheduledAt: dt(2025, 6, 15), slotTime: '11:00 AM', startDateTime: dt(2025, 6, 15, 11), endDateTime: dt(2025, 6, 15, 11, 30) },
      meeting:   { consultationType: 'IN_PERSON', meetingId: 'MTG-2025-0011', meetingLink: '' },
      financials: { consultationFee: 700, taxAmount: 126, totalAmount: 826, refundableAmount: 0 },
      paymentDetails: { transactionId: 'TXN-COMP-0005', status: 'PAID', currency: 'INR', paidAt: dt(2025, 6, 14) },
      appointmentStatus: 'COMPLETED', reason: 'Lower back pain radiating to left leg.',
      doctorRemarks: { text: 'L4-L5 disc herniation suspected. Ordered MRI lumbar spine. Prescribed Diclofenac + Thiocolchicoside for 5 days. Referred for physiotherapy. Advised bed rest for 48 hours.', mode: 'Text' },
      feedback: { rating: 4, comment: 'Diagnosis was spot on. MRI confirmed the disc issue. Wish wait time was shorter.' },
      reportedIssue: { issue: 'Audio issues on the video call made it very hard to hear the doctor.', reportedAt: dt(2025, 6, 15, 12), status: 'OPEN' },
    },

    // CANCELLED (2)
    {
      patientId: p(11), doctorId: d(5),
      schedule:  { scheduledAt: dt(2025, 7, 2), slotTime: '10:00 AM', startDateTime: dt(2025, 7, 2, 10), endDateTime: dt(2025, 7, 2, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0012', meetingLink: 'https://meet.viqure.in/MTG-2025-0012' },
      financials: { consultationFee: 500, taxAmount: 90, totalAmount: 590, refundableAmount: 590 },
      paymentDetails: { transactionId: 'TXN-CXL-0001', status: 'REFUNDED', currency: 'INR', paidAt: dt(2025, 6, 30) },
      appointmentStatus: 'CANCELLED', reason: 'Sinus headache and loss of smell.',
      cancellation: { cancelledBy: customerDocs[11]._id, cancelReason: 'Personal emergency. Cannot attend the consultation today.', cancelledAt: dt(2025, 7, 1) },
    },
    {
      patientId: p(12), doctorId: d(6),
      schedule:  { scheduledAt: dt(2025, 7, 5), slotTime: '02:00 PM', startDateTime: dt(2025, 7, 5, 14), endDateTime: dt(2025, 7, 5, 14, 30) },
      meeting:   { consultationType: 'PHONE', meetingId: 'MTG-2025-0013', meetingLink: '' },
      financials: { consultationFee: 350, taxAmount: 63, totalAmount: 413, refundableAmount: 413 },
      paymentDetails: { transactionId: 'TXN-CXL-0002', status: 'REFUNDED', currency: 'INR', paidAt: dt(2025, 7, 3) },
      appointmentStatus: 'CANCELLED', reason: 'General health check-up.',
      cancellation: { cancelledBy: doctorDocs.find(d => d.detailsOfHealthCareProfessional?.approvalStatus === 'APPROVED' && d.profile?.firstName === 'Arun')?._id ?? doctorDocs[6]._id, cancelReason: 'Doctor unavailable due to medical conference. Rescheduling offered.', cancelledAt: dt(2025, 7, 4) },
    },

    // REJECTED (2)
    {
      patientId: p(13), doctorId: d(0),
      schedule:  { scheduledAt: dt(2025, 7, 10), slotTime: '10:00 AM', startDateTime: dt(2025, 7, 10, 10), endDateTime: dt(2025, 7, 10, 10, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0014', meetingLink: '' },
      financials: { consultationFee: 800, taxAmount: 144, totalAmount: 944, refundableAmount: 944 },
      paymentDetails: { status: 'FAILED', currency: 'INR' },
      appointmentStatus: 'REJECTED', reason: 'Second opinion on angioplasty recommendation.',
      doctorRemarks: { text: 'Appointment rejected: payment not received. Slot could not be held. Please rebook with completed payment.', mode: 'Text' },
    },
    {
      patientId: p(14), doctorId: d(1),
      schedule:  { scheduledAt: dt(2025, 7, 11), slotTime: '11:00 AM', startDateTime: dt(2025, 7, 11, 11), endDateTime: dt(2025, 7, 11, 11, 30) },
      meeting:   { consultationType: 'VIDEO', meetingId: 'MTG-2025-0015', meetingLink: '' },
      financials: { consultationFee: 600, taxAmount: 108, totalAmount: 708, refundableAmount: 0 },
      paymentDetails: { status: 'FAILED', currency: 'INR' },
      appointmentStatus: 'REJECTED', reason: 'Skin rash consultation.',
      doctorRemarks: { text: 'Appointment rejected: incomplete medical history form submitted. Please upload required documents before rebooking.', mode: 'Text' },
    },
  ];

  appointmentDocs = await Appointment.insertMany(appointmentData);
  console.log(`✔  Appointments inserted: ${appointmentDocs.length}`);
}


   
// 7. MEDICAL RECORDS
   
async function createMedicalRecords() {
  // Link to COMPLETED appointments (indices 6–10 in appointmentDocs → local index 6–10)
  const completedAppts = appointmentDocs.filter(a => a.appointmentStatus === 'COMPLETED');

  const records = [
    // Appointment 0 (COMPLETED) — cardiology follow-up
    { patientId: completedAppts[0].patientId, doctorId: completedAppts[0].doctorId, appointmentId: completedAppts[0]._id, documentType: 'PRESCRIPTION', fileUrl: 'https://cdn.viqure.in/records/RX-2025-0601-001.pdf', notes: 'Amlodipine 5mg prescription. Valid for 30 days.', isConfidential: false },
    { patientId: completedAppts[0].patientId, doctorId: completedAppts[0].doctorId, appointmentId: completedAppts[0]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-2025-0601-001.pdf', notes: 'Lipid profile and CBC report. All values within normal range.', isConfidential: false },

    // Appointment 1 (COMPLETED) — dermatology
    { patientId: completedAppts[1].patientId, doctorId: completedAppts[1].doctorId, appointmentId: completedAppts[1]._id, documentType: 'PRESCRIPTION', fileUrl: 'https://cdn.viqure.in/records/RX-2025-0608-001.pdf', notes: 'Tri-Luma cream and Sunscreen SPF 50 prescription.', isConfidential: false },

    // Appointment 2 (COMPLETED) — general medicine
    { patientId: completedAppts[2].patientId, doctorId: completedAppts[2].doctorId, appointmentId: completedAppts[2]._id, documentType: 'PRESCRIPTION', fileUrl: 'https://cdn.viqure.in/records/RX-2025-0610-001.pdf', notes: 'Mebeverine 135mg BD prescription for IBS management.', isConfidential: false },
    { patientId: completedAppts[2].patientId, doctorId: completedAppts[2].doctorId, appointmentId: completedAppts[2]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-2025-0610-001.pdf', notes: 'Stool routine examination. Results pending.', isConfidential: false },
    { patientId: completedAppts[2].patientId, doctorId: completedAppts[2].doctorId, appointmentId: completedAppts[2]._id, documentType: 'OTHER', fileUrl: 'https://cdn.viqure.in/records/OT-2025-0610-001.pdf', notes: 'IBS food diary template shared by doctor.', isConfidential: false },

    // Appointment 3 (COMPLETED) — pediatrics
    { patientId: completedAppts[3].patientId, doctorId: completedAppts[3].doctorId, appointmentId: completedAppts[3]._id, documentType: 'OTHER', fileUrl: 'https://cdn.viqure.in/records/OT-2025-0612-001.pdf', notes: 'Growth chart shared by pediatrician. Weight/height on track.', isConfidential: false },
    { patientId: completedAppts[3].patientId, doctorId: completedAppts[3].doctorId, appointmentId: completedAppts[3]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-2025-0612-001.pdf', notes: 'Complete Blood Count (CBC). Haemoglobin slightly low — advised dietary iron.', isConfidential: false },

    // Appointment 4 (COMPLETED) — orthopedics
    { patientId: completedAppts[4].patientId, doctorId: completedAppts[4].doctorId, appointmentId: completedAppts[4]._id, documentType: 'PRESCRIPTION', fileUrl: 'https://cdn.viqure.in/records/RX-2025-0615-001.pdf', notes: 'Diclofenac + Thiocolchicoside 5-day prescription. Physiotherapy referral included.', isConfidential: false },
    { patientId: completedAppts[4].patientId, doctorId: completedAppts[4].doctorId, appointmentId: completedAppts[4]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-2025-0615-001.pdf', notes: 'MRI Lumbar Spine — L4-L5 disc herniation with mild nerve compression.', isConfidential: true },

    // Standalone records (not linked to appointment — patient-uploaded)
    { patientId: customerDocs[0]._id, doctorId: doctorDocs[0]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-STANDALONE-001.pdf', notes: 'ECG report from external clinic. Uploaded for reference.', isConfidential: false },
    { patientId: customerDocs[1]._id, documentType: 'PRESCRIPTION', fileUrl: 'https://cdn.viqure.in/records/RX-STANDALONE-001.pdf', notes: 'Old prescription from local dermatologist. Uploaded for history.', isConfidential: false },
    { patientId: customerDocs[2]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-STANDALONE-002.pdf', notes: 'Thyroid profile report. T3/T4/TSH within range.', isConfidential: false },
    { patientId: customerDocs[3]._id, documentType: 'OTHER', fileUrl: 'https://cdn.viqure.in/records/OT-STANDALONE-001.pdf', notes: 'Vaccination certificate for child. MMR booster completed.', isConfidential: false },
    { patientId: customerDocs[4]._id, documentType: 'LAB_REPORT', fileUrl: 'https://cdn.viqure.in/records/LR-STANDALONE-003.pdf', notes: 'HbA1c report — 5.9% (pre-diabetic range). Dietary counselling recommended.', isConfidential: true },
  ];

  await MedicalRecord.insertMany(records);
  console.log(`✔  Medical records inserted: ${records.length}`);
}


   
// 8. ORDERS
   
async function createOrders() {
  const pr = idx => productDocs[idx];

  function snap(p) {
    return {
      name:         p.name,
      brand:        p.inventory.supplier,
      image:        p.images[0],
      mrp:          p.pricing.mrp,
      sellingPrice: p.pricing.finalPrice,
    };
  }

  function buildItem(p, qty, disc = 0) {
    const unitPrice  = p.pricing.finalPrice;
    const totalPrice = +(unitPrice * qty).toFixed(2);
    return {
      productId:       p._id,
      productSnapshot: snap(p),
      quantity:        qty,
      unitPrice,
      totalPrice,
      discount:        disc,
    };
  }

  const addr = custIdx => {
    const c = customerDocs[custIdx];
    return {
      fullName:    `${c.profile.firstName} ${c.profile.lastName}`,
      phone:       c.phone,
      addressLine: c.addresses[0]?.street ?? 'Sector 18',
      city:        c.addresses[0]?.city   ?? 'Noida',
      state:       c.addresses[0]?.state  ?? 'UP',
      pincode:     c.addresses[0]?.pincode ?? '201301',
    };
  };

  const dt = (y, m, day) => new Date(y, m - 1, day);

  const ordersData = [
    // pending (2)
    {
      userId: customerDocs[0]._id,
      items: [buildItem(pr(0), 2), buildItem(pr(15), 1)],
      pricing: { subtotal: pr(0).pricing.finalPrice * 2 + pr(15).pricing.finalPrice, deliveryCharge: 49, discount: 0, finalAmount: pr(0).pricing.finalPrice * 2 + pr(15).pricing.finalPrice + 49, currency: 'INR' },
      status: 'pending',
      paymentDetails: { method: 'UPI', status: 'PENDING', paymentDate: dt(2025, 7, 10) },
      shipmentDetails: { status: 'PENDING', deliveryAddress: addr(0), estimatedDeliveryDate: dt(2025, 7, 14) },
    },
    {
      userId: customerDocs[1]._id,
      items: [buildItem(pr(5), 1), buildItem(pr(16), 1)],
      pricing: { subtotal: pr(5).pricing.finalPrice + pr(16).pricing.finalPrice, deliveryCharge: 0, discount: 15, finalAmount: pr(5).pricing.finalPrice + pr(16).pricing.finalPrice - 15, currency: 'INR' },
      status: 'pending',
      paymentDetails: { method: 'CARD', status: 'PENDING', paymentDate: dt(2025, 7, 11) },
      shipmentDetails: { status: 'PENDING', deliveryAddress: addr(1), estimatedDeliveryDate: dt(2025, 7, 15) },
    },

    // confirmed (2)
    {
      userId: customerDocs[2]._id,
      items: [buildItem(pr(10), 3)],
      pricing: { subtotal: pr(10).pricing.finalPrice * 3, deliveryCharge: 0, discount: 0, finalAmount: pr(10).pricing.finalPrice * 3, currency: 'INR' },
      status: 'confirmed',
      paymentDetails: { transactionId: 'TXN-ORD-0001', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 7, 8) },
      shipmentDetails: { status: 'PENDING', courier: { name: 'Delhivery', trackingNumber: 'DLV-2025-0001' }, deliveryAddress: addr(2), estimatedDeliveryDate: dt(2025, 7, 13) },
    },
    {
      userId: customerDocs[3]._id,
      items: [buildItem(pr(20), 1), buildItem(pr(21), 2)],
      pricing: { subtotal: pr(20).pricing.finalPrice + pr(21).pricing.finalPrice * 2, deliveryCharge: 49, discount: 0, finalAmount: pr(20).pricing.finalPrice + pr(21).pricing.finalPrice * 2 + 49, currency: 'INR' },
      status: 'confirmed',
      paymentDetails: { transactionId: 'TXN-ORD-0002', method: 'NETBANKING', status: 'SUCCESS', paymentDate: dt(2025, 7, 9) },
      shipmentDetails: { status: 'PENDING', courier: { name: 'BlueDart', trackingNumber: 'BD-2025-0001' }, deliveryAddress: addr(3), estimatedDeliveryDate: dt(2025, 7, 14) },
    },

    // shipped (2)
    {
      userId: customerDocs[4]._id,
      items: [buildItem(pr(25), 1), buildItem(pr(28), 1)],
      pricing: { subtotal: pr(25).pricing.finalPrice + pr(28).pricing.finalPrice, deliveryCharge: 0, discount: 50, finalAmount: pr(25).pricing.finalPrice + pr(28).pricing.finalPrice - 50, currency: 'INR' },
      status: 'shipped',
      paymentDetails: { transactionId: 'TXN-ORD-0003', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 7, 5) },
      shipmentDetails: { status: 'DISPATCHED', courier: { name: 'Ekart', trackingNumber: 'EK-2025-0001', contact: '1800-1234567' }, deliveryAddress: addr(4), estimatedDeliveryDate: dt(2025, 7, 12), lastUpdatedAt: dt(2025, 7, 7) },
    },
    {
      userId: customerDocs[5]._id,
      items: [buildItem(pr(1), 2), buildItem(pr(6), 1), buildItem(pr(11), 1)],
      pricing: { subtotal: pr(1).pricing.finalPrice * 2 + pr(6).pricing.finalPrice + pr(11).pricing.finalPrice, deliveryCharge: 49, discount: 0, finalAmount: pr(1).pricing.finalPrice * 2 + pr(6).pricing.finalPrice + pr(11).pricing.finalPrice + 49, currency: 'INR' },
      status: 'shipped',
      paymentDetails: { transactionId: 'TXN-ORD-0004', method: 'CARD', status: 'SUCCESS', paymentDate: dt(2025, 7, 6) },
      shipmentDetails: { status: 'DISPATCHED', courier: { name: 'Delhivery', trackingNumber: 'DLV-2025-0002', contact: '1800-1234567' }, deliveryAddress: addr(5), estimatedDeliveryDate: dt(2025, 7, 11), lastUpdatedAt: dt(2025, 7, 8) },
    },

    // delivered (6)
    {
      userId: customerDocs[6]._id,
      items: [buildItem(pr(0), 1), buildItem(pr(12), 2)],
      pricing: { subtotal: pr(0).pricing.finalPrice + pr(12).pricing.finalPrice * 2, deliveryCharge: 0, discount: 0, finalAmount: pr(0).pricing.finalPrice + pr(12).pricing.finalPrice * 2, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0005', method: 'COD', status: 'SUCCESS', paymentDate: dt(2025, 6, 20) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'Delhivery', trackingNumber: 'DLV-2025-0003' }, deliveryAddress: addr(6), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 6, 22) }, estimatedDeliveryDate: dt(2025, 6, 23), actualDeliveryDate: dt(2025, 6, 22) },
    },
    {
      userId: customerDocs[7]._id,
      items: [buildItem(pr(17), 1), buildItem(pr(19), 1)],
      pricing: { subtotal: pr(17).pricing.finalPrice + pr(19).pricing.finalPrice, deliveryCharge: 0, discount: 0, finalAmount: pr(17).pricing.finalPrice + pr(19).pricing.finalPrice, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0006', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 6, 15) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'BlueDart', trackingNumber: 'BD-2025-0002' }, deliveryAddress: addr(7), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 6, 17) }, estimatedDeliveryDate: dt(2025, 6, 18), actualDeliveryDate: dt(2025, 6, 17) },
    },
    {
      userId: customerDocs[8]._id,
      items: [buildItem(pr(22), 1), buildItem(pr(23), 1), buildItem(pr(24), 2)],
      pricing: { subtotal: pr(22).pricing.finalPrice + pr(23).pricing.finalPrice + pr(24).pricing.finalPrice * 2, deliveryCharge: 0, discount: 0, finalAmount: pr(22).pricing.finalPrice + pr(23).pricing.finalPrice + pr(24).pricing.finalPrice * 2, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0007', method: 'CARD', status: 'SUCCESS', paymentDate: dt(2025, 6, 10) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'Ekart', trackingNumber: 'EK-2025-0002' }, deliveryAddress: addr(8), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 6, 13) }, estimatedDeliveryDate: dt(2025, 6, 14), actualDeliveryDate: dt(2025, 6, 13) },
    },
    {
      userId: customerDocs[0]._id,
      items: [buildItem(pr(3), 1)],
      pricing: { subtotal: pr(3).pricing.finalPrice, deliveryCharge: 49, discount: 0, finalAmount: pr(3).pricing.finalPrice + 49, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0008', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 5, 28) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'Delhivery', trackingNumber: 'DLV-2025-0004' }, deliveryAddress: addr(0), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 5, 31) }, estimatedDeliveryDate: dt(2025, 6, 1), actualDeliveryDate: dt(2025, 5, 31) },
    },
    {
      userId: customerDocs[9]._id,
      items: [buildItem(pr(25), 1), buildItem(pr(27), 1)],
      pricing: { subtotal: pr(25).pricing.finalPrice + pr(27).pricing.finalPrice, deliveryCharge: 0, discount: 100, finalAmount: pr(25).pricing.finalPrice + pr(27).pricing.finalPrice - 100, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0009', method: 'NETBANKING', status: 'SUCCESS', paymentDate: dt(2025, 6, 5) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'BlueDart', trackingNumber: 'BD-2025-0003' }, deliveryAddress: addr(9), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 6, 8) }, estimatedDeliveryDate: dt(2025, 6, 9), actualDeliveryDate: dt(2025, 6, 8) },
    },
    {
      userId: customerDocs[10]._id,
      items: [buildItem(pr(14), 2), buildItem(pr(16), 1)],
      pricing: { subtotal: pr(14).pricing.finalPrice * 2 + pr(16).pricing.finalPrice, deliveryCharge: 0, discount: 0, finalAmount: pr(14).pricing.finalPrice * 2 + pr(16).pricing.finalPrice, currency: 'INR' },
      status: 'delivered',
      paymentDetails: { transactionId: 'TXN-ORD-0010', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 5, 20) },
      shipmentDetails: { status: 'DELIVERED', courier: { name: 'Ekart', trackingNumber: 'EK-2025-0003' }, deliveryAddress: addr(10), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 5, 23) }, estimatedDeliveryDate: dt(2025, 5, 24), actualDeliveryDate: dt(2025, 5, 23) },
    },

    // cancelled (2)
    {
      userId: customerDocs[11]._id,
      items: [buildItem(pr(4), 1)],
      pricing: { subtotal: pr(4).pricing.finalPrice, deliveryCharge: 49, discount: 0, finalAmount: pr(4).pricing.finalPrice + 49, currency: 'INR' },
      status: 'cancelled',
      paymentDetails: { transactionId: 'TXN-ORD-0011', method: 'UPI', status: 'FAILED', paymentDate: dt(2025, 7, 3) },
      shipmentDetails: { status: 'FAILED', deliveryAddress: addr(11) },
    },
    {
      userId: customerDocs[12]._id,
      items: [buildItem(pr(29), 1)],
      pricing: { subtotal: pr(29).pricing.finalPrice, deliveryCharge: 0, discount: 0, finalAmount: pr(29).pricing.finalPrice, currency: 'INR' },
      status: 'cancelled',
      paymentDetails: { transactionId: 'TXN-ORD-0012', method: 'CARD', status: 'FAILED', paymentDate: dt(2025, 7, 4) },
      shipmentDetails: { status: 'FAILED', deliveryAddress: addr(12) },
    },

    // returned (1)
    {
      userId: customerDocs[5]._id,
      items: [buildItem(pr(7), 1)],
      pricing: { subtotal: pr(7).pricing.finalPrice, deliveryCharge: 0, discount: 0, finalAmount: pr(7).pricing.finalPrice, currency: 'INR' },
      status: 'returned',
      paymentDetails: { transactionId: 'TXN-ORD-0013', method: 'UPI', status: 'SUCCESS', paymentDate: dt(2025, 6, 1) },
      shipmentDetails: { status: 'RETURNED', courier: { name: 'Delhivery', trackingNumber: 'DLV-RTN-2025-0001' }, deliveryAddress: addr(5), otpVerification: { status: 'VERIFIED', verifiedAt: dt(2025, 6, 4) }, estimatedDeliveryDate: dt(2025, 6, 4), actualDeliveryDate: dt(2025, 6, 4) },
    },
  ];

  await Order.insertMany(ordersData);
  console.log(`✔  Orders inserted: ${ordersData.length}`);
}


   
// 9. REVIEWS
   
async function createReviews() {
  const approvedDoctors = doctorDocs.filter(d =>
    d.detailsOfHealthCareProfessional.approvalStatus === 'APPROVED'
  );

  const doctorReviews = [
    { reviewerId: customerDocs[6]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[0]._id, rating: 5, reviewText: 'Dr. Sharma is truly exceptional. He took ample time to explain my condition and did not rush at all. The prescription has been working perfectly. Highly recommend for anyone with heart concerns.', isVerified: true,  likes: 14 },
    { reviewerId: customerDocs[7]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[1]._id, rating: 4, reviewText: 'Good consultation overall. Dr. Verma diagnosed my skin issue quickly and the cream is helping. Would be 5 stars if she had explained possible side effects more clearly.', isVerified: true,  likes: 8  },
    { reviewerId: customerDocs[8]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[2]._id, rating: 5, reviewText: 'Very patient and thorough. Diagnosed my IBS correctly when two other doctors had missed it. The dietary advice changed my quality of life immediately. Excellent doctor.', isVerified: true,  likes: 21 },
    { reviewerId: customerDocs[9]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[3]._id, rating: 5, reviewText: 'Dr. Sonia is a gem for parents. My son was scared of doctors but she made him laugh and feel comfortable immediately. Very knowledgeable and patient. Will always consult her.', isVerified: true,  likes: 17 },
    { reviewerId: customerDocs[10]._id, targetType: 'DOCTOR', targetId: approvedDoctors[4]._id, rating: 4, reviewText: 'Diagnosis was accurate and the physiotherapy referral was very helpful. The MRI recommendation was spot on. Slightly long wait time at clinic but the consultation quality is excellent.', isVerified: true,  likes: 6  },
    { reviewerId: customerDocs[0]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[0]._id, rating: 3, reviewText: 'Consultation was fine but felt a bit rushed. He gave the prescription quickly but I had more questions that were not addressed. Maybe it was a busy day. Will try again.', isVerified: false, likes: 2  },
    { reviewerId: customerDocs[1]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[1]._id, rating: 2, reviewText: 'Disappointed with the consultation. The doctor seemed distracted during the video call. The prescribed cream caused mild irritation and no follow-up was offered. Expected better.', isVerified: false, likes: 1  },
    { reviewerId: customerDocs[2]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[5]._id, rating: 4, reviewText: 'Dr. Preethi was thorough in checking my sinuses and gave a clear treatment plan. ENT specialists are hard to find on telemedicine platforms, so this was a great find.', isVerified: true,  likes: 5  },
    { reviewerId: customerDocs[3]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[6]._id, rating: 5, reviewText: 'Dr. Arun is the most patient doctor I have consulted online. He spent extra time listening to my symptoms and explained the diagnosis in very simple terms. 10 out of 10.', isVerified: true,  likes: 11 },
    { reviewerId: customerDocs[4]._id,  targetType: 'DOCTOR', targetId: approvedDoctors[2]._id, rating: 1, reviewText: 'The appointment was confirmed but doctor was unavailable at the scheduled time. Had to wait 20 minutes. Very unprofessional. The prescription issued later was generic and unhelpful.', isVerified: false, likes: 0  },
  ];

  const productReviews = [
    { reviewerId: customerDocs[6]._id,  targetType: 'PRODUCT', targetId: productDocs[0]._id,  rating: 5, reviewText: 'Dolo 650 is my go-to for fever. Works within 30 minutes and no side effects at all. The Viqure delivery was fast and packaging was good.', isVerified: true,  likes: 9  },
    { reviewerId: customerDocs[7]._id,  targetType: 'PRODUCT', targetId: productDocs[17]._id, rating: 4, reviewText: 'Zincovit has noticeably improved my energy levels after a month of use. The tablet is easy to swallow. Good value for money compared to other multivitamins.', isVerified: true,  likes: 7  },
    { reviewerId: customerDocs[8]._id,  targetType: 'PRODUCT', targetId: productDocs[22]._id, rating: 5, reviewText: 'Savlon cream is brilliant for small cuts and abrasions. Healed my daughter\'s wound without any scarring. A household essential. Great price on Viqure.', isVerified: true,  likes: 12 },
    { reviewerId: customerDocs[9]._id,  targetType: 'PRODUCT', targetId: productDocs[25]._id, rating: 4, reviewText: 'OneTouch test strips are accurate and easy to use. Result matches my lab HbA1c trend. Only minor issue is the packaging seal could be stronger to prevent moisture entry.', isVerified: true,  likes: 5  },
    { reviewerId: customerDocs[10]._id, targetType: 'PRODUCT', targetId: productDocs[14]._id, rating: 3, reviewText: 'Omez works fine for acidity but the effect lasts only about 12 hours for me. Had to take twice daily instead of once. Not a great product if your acidity is severe.', isVerified: true,  likes: 3  },
    { reviewerId: customerDocs[0]._id,  targetType: 'PRODUCT', targetId: productDocs[3]._id,  rating: 5, reviewText: 'Volini spray gives almost instant relief for lower back pain. The nozzle is precise and doesn\'t waste product. Much better than the cream version for targeted application.', isVerified: true,  likes: 18 },
    { reviewerId: customerDocs[1]._id,  targetType: 'PRODUCT', targetId: productDocs[6]._id,  rating: 2, reviewText: 'Benadryl syrup made me extremely drowsy — could not function during the day. Understand it\'s an antihistamine, but the drowsiness is way too strong. Look for non-drowsy alternatives.', isVerified: false, likes: 4  },
    { reviewerId: customerDocs[2]._id,  targetType: 'PRODUCT', targetId: productDocs[12]._id, rating: 5, reviewText: 'Electral ORS is a lifesaver during Delhi summers. Works faster than plain water for rehydration. The orange flavour is actually pleasant compared to other brands.', isVerified: true,  likes: 15 },
    { reviewerId: customerDocs[3]._id,  targetType: 'PRODUCT', targetId: productDocs[27]._id, rating: 4, reviewText: 'Sugar Free Gold is a great substitute for sugar in tea and coffee. Dissolves instantly and the sweetness level is natural. No bitter aftertaste unlike some other sweeteners.', isVerified: true,  likes: 8  },
    { reviewerId: customerDocs[4]._id,  targetType: 'PRODUCT', targetId: productDocs[20]._id, rating: 1, reviewText: 'Dettol liquid I received had only 5 months to expiry. Not acceptable for a product I use regularly. Viqure should check expiry dates before dispatch. Very disappointed.', isVerified: true,  likes: 22 },
  ];

  await Review.insertMany([...doctorReviews, ...productReviews]);
  console.log(`✔  Reviews inserted: ${doctorReviews.length + productReviews.length} (10 doctor + 10 product)`);
}


   
// ORCHESTRATOR
   
async function runOnceForCompleteDbSampleData() {
  try {
    console.log('\n── Hashing passwords …');
    customerPasswordHash = await bcrypt.hash('custom_pass123', 8);
    doctorPasswordHash   = await bcrypt.hash('doctorPass_123', 8);
    adminPasswordHash    = await bcrypt.hash('adminPass_123!', 10);

    console.log('── Dropping existing collections …');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      Order.deleteMany({}),
      Appointment.deleteMany({}),
      Review.deleteMany({}),
      MedicalRecord.deleteMany({}),
    ]);

    console.log('\n── Seeding …');
    await createCategories();
    await createUsers();
    await createDoctors();
    await createProducts();
    await assignCarts();
    await createAppointments();
    await createMedicalRecords();
    await createOrders();
    await createReviews();

    console.log('\n✅  End-to-end seed complete.\n');
    console.log('  Users        → 1 admin  |  15 customers  |  10 doctors');
    console.log('  Categories   →', categoryDocs.length);
    console.log('  Products     →', productDocs.length);
    console.log('  Appointments → 3 BOOKED | 3 CONFIRMED | 5 COMPLETED | 2 CANCELLED | 2 REJECTED');
    console.log('  Orders       → 2 pending | 2 confirmed | 2 shipped | 6 delivered | 2 cancelled | 1 returned');
    console.log('  Reviews      → 10 doctor | 10 product');
    console.log('  MedRecords   → 15');
    console.log();

  } catch (error) {
    console.error('❌  Seed failure:', error);
    throw error;
  }
}

async function completeSeed() {
  try {
    console.log('🔗  Connecting to MongoDB …');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✔  Connected.\n');

    await runOnceForCompleteDbSampleData();

  } catch (error) {
    console.error('❌  Fatal error:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌  Disconnected.');
  }
}

completeSeed();