import express from "express";
import { isAuthenticated } from "../middlewares/auth.js"
import { buySubscription, cancelSubscription, getRazorPayKey, paymentVerification } from "../controllers/paymentController.js";

const router = express.Router();

//Buy Subscription
router.route("/subscribe")
    .get(isAuthenticated, buySubscription)

// Verify Payment and Save reference to database
router.route("/paymentverification")
    .post(isAuthenticated, paymentVerification);

//Get Razorpay Key
router.route("/razorpaykey") 
    .get(getRazorPayKey);

//Cancel Subscription
router.route("/subscribe/cancel")
    .delete(isAuthenticated,cancelSubscription)


export default router;