const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Order = require("../../models/Order");
const Cart = require("../../models/Cart");
const Product = require("../../models/Product");

const createOrder = async (req, res) => {
  try {
    const {
      userId, cartItems, addressInfo, orderStatus, 
      paymentMethod, paymentStatus, totalAmount, 
      orderDate, orderUpdateDate, cartId,
    } = req.body;

    // 1. Stripe Checkout Session Create karein
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: cartItems.map((item) => ({
        price_data: {
          currency: "usd",
          product_data: { 
            name: item.title,
            metadata: { productId: item.productId } 
          },
          unit_amount: Math.round(item.price * 100), // Stripe cents mein calculation karta hai
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/shop/stripe-return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/shop/stripe-cancel`,
    });

    // 2. Database mein Order save karein (Pending status ke sath)
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId: session.id, // Yahan Stripe Session ID save hogi
      payerId: "", // Stripe mein iski zaroorat nahi hoti, empty chhor dein
    });

    await newlyCreatedOrder.save();

    res.status(201).json({
      success: true,
      approvalURL: session.url,
      orderId: newlyCreatedOrder._id,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Stripe payment initiation failed!",
    });
  }
};

const capturePayment = async (req, res) => {
  try {
    const { paymentId, orderId } = req.body; // paymentId yahan Stripe Session ID hogi

    let order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order can not be found",
      });
    }

    // Stripe Session confirm karein (Optional check)
    const session = await stripe.checkout.sessions.retrieve(paymentId);
    if (session.payment_status !== "paid") {
        return res.status(400).json({ success: false, message: "Payment not verified" });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";

    // Stock update logic (Same as before)
    for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (product) {
        product.totalStock -= item.quantity;
        await product.save();
      }
    }

    // Cart delete logic (Same as before)
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order confirmed",
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};
const getAllOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await Order.find({ userId });

    if (!orders.length) {
      return res.status(404).json({
        success: false,
        message: "No orders found!",
      });
    }

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found!",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

// ... baki functions (getAllOrdersByUser, getOrderDetails) same rahenge

module.exports = {
  createOrder,
  capturePayment,
  getAllOrdersByUser,
  getOrderDetails,
};