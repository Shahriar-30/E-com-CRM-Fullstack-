export const generateWelcomeEmail = (name) => {
  return {
    subject: "Welcome to the Family! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for placing your first order with us. We are thrilled to have you here.</p>
        <p>Stay tuned for exclusive updates and offers.</p>
        <br/>
        <p>Best regards,<br/>The Team</p>
      </div>
    `,
  };
};

export const generateOrderStatusEmail = (name, orderId, status, total) => {
  const statusConfig = {
    pending: {
      subject: `Order Confirmation #${orderId}`,
      color: "#eab308", // yellow-500
      message: `Your order <strong>#${orderId}</strong> has been placed successfully. We will notify you once processing begins.`,
    },
    processing: {
      subject: `Update: We're working on Order #${orderId}`,
      color: "#3b82f6", // blue-500
      message: `We are currently processing your order <strong>#${orderId}</strong>. We are getting everything ready for you!`,
    },
    shipped: {
      subject: `Order #${orderId} Shipped! 🚚`,
      color: "#6366f1", // indigo-500
      message: `Great news! Your order <strong>#${orderId}</strong> has been shipped and is on its way.`,
    },
    delivered: {
      subject: `Order #${orderId} Delivered 🎉`,
      color: "#22c55e", // green-500
      message: `Your order <strong>#${orderId}</strong> has been delivered. We hope you enjoy your purchase!`,
    },
    cancelled: {
      subject: `Order #${orderId} Cancelled`,
      color: "#ef4444", // red-500
      message: `Your order <strong>#${orderId}</strong> has been cancelled. If you have questions, please contact our support.`,
    },
  };

  const config = statusConfig[status.toLowerCase()] || statusConfig.pending;

  return {
    subject: config.subject,
    text: config.message.replace(/<[^>]*>/g, ""), // Plain text fallback
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Hi ${name},</h2>
        <p style="font-size: 16px; color: #555;">${config.message}</p>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f9fafb; border-left: 4px solid ${config.color}; border-radius: 4px;">
           <p style="margin: 0; font-weight: bold; color: #374151;">
             Current Status: <span style="color: ${config.color}; text-transform: uppercase;">${status}</span>
           </p>
           ${total ? `<p style="margin: 5px 0 0 0; color: #6b7280;">Total Amount: $${total}</p>` : ""}
        </div>

        <p style="color: #666; font-size: 14px;">You can view more details in your account.</p>
        <br/>
        <p style="color: #999; font-size: 12px;">Thanks for shopping with us!</p>
      </div>
    `,
  };
};

export const generateOrderConfirmationEmail = (name, orderId, total) => {
  // Reuse the generalized status email for the initial confirmation (pending)
  return generateOrderStatusEmail(name, orderId, "pending", total);
};

export const generateCampaignEmail = (name, content, couponCode) => {
  return {
    subject: "Special Offer Just for You! 🎁",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hello ${name},</h2>
        <p>${content}</p>
        ${
          couponCode
            ? `<div style="background: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
               <h3>Use Code: <span style="color: #e63946;">${couponCode}</span></h3>
             </div>`
            : ""
        }
        <p>Don't miss out!</p>
        <hr/>
        <p style="font-size: 12px; color: #888;">
          To unsubscribe from marketing emails, <a href="#">click here</a>.
        </p>
      </div>
    `,
  };
};
