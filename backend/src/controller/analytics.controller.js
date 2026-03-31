import { Order } from "../models/order.models.js";
import { Customer } from "../models/customer.model.js";
import { Analytic } from "../models/analytic.model.js";
import { apiError } from "../utils/apiError.js";
import { apiRes } from "../utils/apiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Calculates analytics for a given date and stores it in the database.
 * Defaults to yesterday if no date is provided.
 * @param {Date} [targetDate] - The date to calculate analytics for.
 * @param {String} [userId] - The user ID to calculate analytics for. If not provided, uses global data.
 */
export const calculateDailyAnalytics = async (targetDate, userId) => {
  const dateToProcess = targetDate ? new Date(targetDate) : new Date();
  if (!targetDate) {
    // By default, process yesterday's data for the cron job
    dateToProcess.setDate(dateToProcess.getDate() - 1);
  }

  const startOfDay = new Date(dateToProcess);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(dateToProcess);
  endOfDay.setUTCHours(23, 59, 59, 999);

  // 1. Get all orders for the day
  let orderQuery = {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  };

  // If userId is provided, filter orders by that user's customers
  if (userId) {
    const userCustomers = await Customer.find({ createdBy: userId }).select(
      "_id"
    );
    const userCustomerIds = userCustomers.map((c) => c._id);
    orderQuery.customerId = { $in: userCustomerIds };
  }

  const orders = await Order.find(orderQuery);

  // 2. Calculate basic order stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const couponUsage = orders.filter((order) => order.couponId).length;

  // 3. Calculate new customers
  let customerQuery = {
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  };
  if (userId) {
    customerQuery.createdBy = userId;
  }
  const newCustomers = await Customer.countDocuments(customerQuery);

  // 4. Calculate repeat rate
  let returningCustomerOrderCount = 0;
  if (totalOrders > 0) {
    const customerIdsInOrders = orders.map((order) => order.customerId);
    const returningCustomers = await Customer.find({
      _id: { $in: customerIdsInOrders },
      createdAt: { $lt: startOfDay },
    }).select("_id");

    const returningCustomerIds = returningCustomers.map((c) => c._id);
    returningCustomerOrderCount = orders.filter((order) =>
      returningCustomerIds.some((id) => id.equals(order.customerId))
    ).length;
  }

  const repeatRate =
    totalOrders > 0 ? (returningCustomerOrderCount / totalOrders) * 100 : 0;

  // 5. Save to Analytics collection
  const analyticsData = {
    date: startOfDay,
    totalRevenue,
    totalOrders,
    newCustomers,
    repeatRate: `${repeatRate.toFixed(2)}%`,
    avgOrderValue,
    couponUsage,
  };

  if (userId) {
    analyticsData.createdBy = userId;
  }

  const query = { date: startOfDay };
  if (userId) {
    query.createdBy = userId;
  }

  await Analytic.findOneAndUpdate(query, analyticsData, {
    upsert: true,
  });

  console.log(`Analytics calculated for ${startOfDay.toDateString()}`);
  return analyticsData;
};

export const getAnalytics = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    throw new apiError(400, "Start date and end date are required");
  }

  const start = new Date(startDate);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(23, 59, 59, 999);

  const dailyData = await Analytic.find({
    date: { $gte: start, $lte: end },
    createdBy: req.user._id,
  }).sort({ date: "asc" });

  const summary = await Analytic.aggregate([
    {
      $match: {
        date: { $gte: start, $lte: end },
        createdBy: req.user._id,
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalRevenue" },
        totalOrders: { $sum: "$totalOrders" },
        newCustomers: { $sum: "$newCustomers" },
        totalCouponUsage: { $sum: "$couponUsage" },
      },
    },
    {
      $project: {
        _id: 0,
        totalRevenue: 1,
        totalOrders: 1,
        newCustomers: 1,
        totalCouponUsage: 1,
        avgOrderValue: {
          $cond: [
            { $eq: ["$totalOrders", 0] },
            0,
            { $divide: ["$totalRevenue", "$totalOrders"] },
          ],
        },
      },
    },
  ]);

  res
    .status(200)
    .json(
      new apiRes(
        200,
        { dailyData, summary: summary[0] || {} },
        "Analytics fetched successfully"
      )
    );
});

export const refreshAnalytics = asyncHandler(async (req, res) => {
  // Calculate for today (new Date()) to provide real-time updates for the dashboard
  await calculateDailyAnalytics(new Date(), req.user._id);

  res
    .status(200)
    .json(new apiRes(200, null, "Analytics refreshed successfully"));
});
