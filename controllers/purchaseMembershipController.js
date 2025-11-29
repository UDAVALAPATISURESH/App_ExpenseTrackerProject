const cashfreeService = require("../services/cashfreeService");
const Order = require("../models/ordersModel");
const User = require("../models/userModel");

exports.purchasePremium = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if user is already premium
    const existingUser = await User.findByPk(userId);
    if (existingUser && existingUser.isPremiumUser) {
      return res.status(200).json({
        message: "You are already premium User.",
        isPremium: true,
      });
    }

    // Create new order
    const orderId = "order_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
    const orderAmount = 2000.0;
    const customerPhone = "7798745712";

    const order = await Order.create({
      orderid: orderId,
      status: "PENDING",
      userId: userId,
    });

    if (!order || !order.id) {
      console.error("Order creation failed — missing ID");
      return res.status(500).json({ message: "Order creation failed" });
    }

    // Auto-fail pending order after 5 minutes
    setTimeout(async () => {
      try {
        const currentOrder = await Order.findOne({ where: { orderid: orderId } });
        if (currentOrder && currentOrder.status === "PENDING") {
          await currentOrder.update({ status: "FAILED" });
          console.log(`Order ${orderId} marked as FAILED after 5 minutes`);
        }
      } catch (timeoutErr) {
        console.error("Failed to update order status after timeout:", timeoutErr);
      }
    }, 5 * 60 * 1000); // 5 minutes

    // Proceed with payment
    const paymentSessionId = await cashfreeService.createOrder({
      orderId,
      orderAmount,
      userId,
      customerPhone,
      dbOrderId: order.id.toString(),
    });

    res.status(201).json({ paymentSessionId, orderId });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Failed to create payment session" });
  }
};

exports.updateTransactionStatus = async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const status = await cashfreeService.getPaymentStatus(orderId);

    const order = await Order.findOne({ where: { orderid: orderId } });
    if (order) {
      await order.update({ status: status });

      if (status === "SUCCESS") {
        // Update user to premium
        const user = await User.findByPk(order.userId);
        if (user) {
          await user.update({ isPremiumUser: true });
        }
      }
    }

    return res.json({
      status: status,
      success: true,
      message: "Transaction successful",
    });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    await Order.update(
      { status: "FAILED" },
      { where: { orderid: req.params.orderId } }
    );

    return res.status(500).json({ message: "Error fetching payment status", status: "Failed" });
  }
};