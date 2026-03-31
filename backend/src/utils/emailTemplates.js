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

// Campaign Type Specific Templates
export const getWelcomeCampaignTemplate = (couponCode) => {
  return `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #333; margin-bottom: 15px;">Welcome to Our Community! 🎉</h2>
    <p style="color: #555; line-height: 1.6;">Dear Valued Customer,</p>
    <p style="color: #555; line-height: 1.6;">We're excited to have you join us! As a token of our appreciation, we're offering you a special welcome discount.</p>
    <div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #3b82f6; border-radius: 4px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #1e40af; font-size: 14px; font-weight: bold;">EXCLUSIVE WELCOME OFFER</p>
      ${couponCode ? `<p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #3b82f6;">${couponCode}</p>` : ""}
      <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 12px;">Use this code at checkout</p>
    </div>
    <p style="color: #555; line-height: 1.6;">Explore our products and find the perfect items just for you. If you have any questions, our team is always here to help.</p>
    <br/>
    <p style="color: #555;">Best regards,<br/><strong>The Team</strong></p>
  </div>`;
};

export const getPromotionalCampaignTemplate = (couponCode) => {
  return `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #333; margin-bottom: 15px;">Limited Time Promotion! ⏰</h2>
    <p style="color: #555; line-height: 1.6;">Dear Valued Customer,</p>
    <p style="color: #555; line-height: 1.6;">We have an exciting offer just for you! Don't miss this limited-time promotional event.</p>
    <div style="background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #92400e; font-size: 14px; font-weight: bold;">PROMOTIONAL DISCOUNT CODE</p>
      ${couponCode ? `<p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #f59e0b;">${couponCode}</p>` : ""}
      <p style="margin: 5px 0 0 0; color: #92400e; font-size: 12px;">Valid for a limited time only!</p>
    </div>
    <p style="color: #555; line-height: 1.6;">Hurry and grab this opportunity before it's gone. Apply the code above at checkout to enjoy your exclusive discount.</p>
    <br/>
    <p style="color: #555;">Best regards,<br/><strong>The Team</strong></p>
  </div>`;
};

export const getWinBackCampaignTemplate = (couponCode) => {
  return `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #333; margin-bottom: 15px;">We Miss You! 💔</h2>
    <p style="color: #555; line-height: 1.6;">Dear Valued Customer,</p>
    <p style="color: #555; line-height: 1.6;">It's been a while since we've seen you! We've missed you and we'd love to welcome you back with a special offer.</p>
    <div style="background: #fce7f3; padding: 20px; border-left: 4px solid #ec4899; border-radius: 4px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #be185d; font-size: 14px; font-weight: bold;">WIN-BACK OFFER</p>
      ${couponCode ? `<p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #ec4899;">${couponCode}</p>` : ""}
      <p style="margin: 5px 0 0 0; color: #be185d; font-size: 12px;">Come back and enjoy this exclusive discount</p>
    </div>
    <p style="color: #555; line-height: 1.6;">We've added new products and improved our services. Come back to see what's new and reconnect with us using the code above.</p>
    <br/>
    <p style="color: #555;">We can't wait to serve you again,<br/><strong>The Team</strong></p>
  </div>`;
};

export const getAbandonedCartCampaignTemplate = (couponCode) => {
  return `<div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px;">
    <h2 style="color: #333; margin-bottom: 15px;">Don't Forget Your Cart! 🛒</h2>
    <p style="color: #555; line-height: 1.6;">Hi,</p>
    <p style="color: #555; line-height: 1.6;">We noticed you left some great items in your cart. Don't miss out on these products!</p>
    <div style="background: #dbeafe; padding: 20px; border-left: 4px solid #0284c7; border-radius: 4px; margin: 20px 0; text-align: center;">
      <p style="margin: 0; color: #0c2340; font-size: 14px; font-weight: bold;">COMPLETE YOUR PURCHASE</p>
      ${couponCode ? `<p style="margin: 10px 0 0 0; font-size: 24px; font-weight: bold; color: #0284c7;">${couponCode}</p>` : ""}
      <p style="margin: 5px 0 0 0; color: #0c2340; font-size: 12px;">Use this code for an extra discount</p>
    </div>
    <p style="color: #555; line-height: 1.6;">Your items are waiting for you. Click below to complete your order with the discount code above applied.</p>
    <br/>
    <p style="color: #555;">Happy shopping,<br/><strong>The Team</strong></p>
  </div>`;
};

// Get template by campaign type
export const getCampaignTemplate = (campaignType, couponCode) => {
  switch (campaignType) {
    case "welcome":
      return getWelcomeCampaignTemplate(couponCode);
    case "promotional":
      return getPromotionalCampaignTemplate(couponCode);
    case "win-back":
      return getWinBackCampaignTemplate(couponCode);
    case "abandoned cart":
      return getAbandonedCartCampaignTemplate(couponCode);
    default:
      return getPromotionalCampaignTemplate(couponCode);
  }
};
