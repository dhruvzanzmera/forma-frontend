import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

export function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;
  return (
    <div className="success-page page-wrap">
      <span className="success-mark">
        <Check size={29} />
      </span>
      <span className="eyebrow">ORDER RECEIVED</span>
      <h1>
        Good choice.
        <br />
        <em>It's on its way.</em>
      </h1>
      <p>
        Your order{" "}
        {order?.orderNumber ? <strong>{order.orderNumber}</strong> : ""} is
        confirmed. We'll keep you updated as it moves along.
      </p>
      <div className="success-actions">
        <Link
          className="button dark"
          to={order?._id ? `/orders/${order._id}` : "/orders"}
        >
          View order <ArrowRight size={15} />
        </Link>
        <Link className="text-link" to="/products">
          Back to the collection
        </Link>
      </div>
    </div>
  );
}
