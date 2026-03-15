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

export const generateOrderConfirmationEmail = (name, orderId, total) => {
  return {
    subject: `Order Confirmation #${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${name},</h2>
        <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
        <h3>Order Summary</h3>
        <p><strong>Total Amount:</strong> $${total}</p>
        <p>We are processing your order and will notify you when it ships.</p>
        <br/>
        <p>Thanks for shopping with us!</p>
      </div>
    `,
  };
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
