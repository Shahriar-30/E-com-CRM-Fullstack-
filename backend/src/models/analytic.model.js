import mongoose from "mongoose";

const analyticSchema = new mongoose.Schema(
  {
    date: Date,
    totalRevenue: Number,
    totalOrders: Number,
    newCustomers: Number,
    repeatRate: String,
    avgOrderValue: Number,
    couponUsage: Number,
  },
  { timestamps: true }
);

export const Analytic = mongoose.model("Analtic", analyticSchema);
