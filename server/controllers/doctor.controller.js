const { Doctor } = require("../models");
const { sendSuccess, sendError } = require("../utils/response.util");

const getDoctors = async (req, res) => {
  try {
    const page  = Math.max(parseInt(req.query.page)  || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip  = (page - 1) * limit;

    const [doctors, total] = await Promise.all([
      Doctor.find({ status: "approved" })
        .select("-passwordHash -documents")
        .skip(skip)
        .limit(limit)
        .lean(),
      Doctor.countDocuments({ status: "approved" }),
    ]);

    return sendSuccess(res, {
      doctors,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("getDoctors:", err);
    return sendError(res, "Failed to fetch doctors", 500);
  }
};

const searchDoctors = async (req, res) => {
  try {
    const { specialty, city, minRating, maxFees, sort, q, page = 1, limit = 10 } = req.query;

    const filter = { status: "approved" };

    if (specialty) filter.specializations = { $in: [new RegExp(specialty, "i")] };
    if (city)      filter.city = new RegExp(city, "i");
    if (minRating) filter["stats.rating"] = { $gte: parseFloat(minRating) };
    if (maxFees)   filter.consultationFees = { $lte: parseFloat(maxFees) };
    if (q)         filter.doctorName = new RegExp(q, "i");

    let sortObj = {};
    switch (sort) {
      case "rating":    sortObj = { "stats.rating": -1 };        break;
      case "fees_asc":  sortObj = { consultationFees: 1 };       break;
      case "fees_desc": sortObj = { consultationFees: -1 };      break;
      case "experience":sortObj = { yearsOfExperience: -1 };     break;
      default:          sortObj = { "stats.totalRatings": -1 };  break;
    }

    const pageNum  = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(parseInt(limit) || 10, 50);
    const skip     = (pageNum - 1) * limitNum;

    const [doctors, total] = await Promise.all([
      Doctor.find(filter)
        .select("-passwordHash -documents")
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Doctor.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      doctors,
      pagination: { total, page: pageNum, limit: limitNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (err) {
    console.error("searchDoctors:", err);
    return sendError(res, "Search failed", 500);
  }
};

const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ _id: req.params.id, status: "approved" })
      .select("-passwordHash -documents")
      .lean();

    if (!doctor) return sendError(res, "Doctor not found", 404);
    return sendSuccess(res, { doctor });
  } catch (err) {
    console.error("getDoctorById:", err);
    return sendError(res, "Failed to fetch doctor", 500);
  }
};

module.exports = { getDoctors, searchDoctors, getDoctorById };
