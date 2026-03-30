import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { capturePayment } from "@/store/shop/order-slice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";

function PaypalReturnPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  
  // Stripe session_id bhejta hai, PayPal paymentId/PayerID
  const sessionId = params.get("session_id"); 
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");

  useEffect(() => {
    // Agar Stripe se aaya hai (sessionId) ya PayPal se (paymentId)
    const orderId = JSON.parse(sessionStorage.getItem("currentOrderId"));

    if ((sessionId || (paymentId && payerId)) && orderId) {
      
      // Stripe ke liye sessionId hi hamara paymentId hai
      const finalPaymentId = sessionId || paymentId;

      dispatch(capturePayment({ 
        paymentId: finalPaymentId, 
        payerId: payerId || "stripe_payment", // Stripe mein payerId ki zaroorat nahi hoti
        orderId 
      })).then((data) => {
        if (data?.payload?.success) {
          sessionStorage.removeItem("currentOrderId");
          window.location.href = "/shop/payment-success";
        }
      });
    }
  }, [sessionId, paymentId, payerId, dispatch]);

  return (
    <Card className="p-10 text-center">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Processing Payment... Please wait!</CardTitle>
      </CardHeader>
      <p className="text-muted-foreground mt-2">Do not refresh or close this page.</p>
    </Card>
  );
}

export default PaypalReturnPage;
