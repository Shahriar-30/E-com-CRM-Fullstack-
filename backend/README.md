emailSettings: {
subscribed: true,
welcomeSent: false,
marketingEmails: true,
transactionalEmails: true,
lastEmailSentAt: Date,
unsubscribedAt: Date
}

```

This tells you — is this customer okay to email? Have they unsubscribed? When did we last email them?

---

## 🗂️ Every Collection Explained

---

### 1. 👤 Customers
**What it is:** The heart of the CRM. Every person who has ever bought from or signed up on your store.

**Key fields and what they mean:**
- `name`, `email`, `phone` — basic contact info
- `source` — how they found you (Google ad, Instagram, referral, etc.)
- `totalSpent` — lifetime value of this customer
- `orderCount` — how many times they've bought
- `status` — are they new, loyal, at-risk, or VIP?
- `tags` — custom labels you put on them ("influencer", "wholesale", etc.)
- `lastOrderAt` — last time they bought. If this is old, they're at risk of churning
- `emailSettings` — *(new)* their email preferences and subscription status

**Why it matters:** Every other collection connects back to this one. It's the source of truth for who your customer is.

---

### 2. 🧾 Orders
**What it is:** A record of every purchase made on your store.

**Key fields and what they mean:**
- `customerId` — links this order to the customer who placed it
- `couponId` — if a coupon was used, it's recorded here
- `status` — pending, processing, shipped, delivered, or cancelled
- `subtotal` — total before discount
- `discount` — how much was taken off
- `total` — final amount paid
- `paymentMethod` — card, UPI, cash on delivery, etc.
- `shippingAddress` — where to deliver it

**Why it matters:** This is your revenue record. Every rupee earned lives here.

---

### 3. 📦 OrderItems
**What it is:** The individual products inside each order. An order of 3 items = 3 OrderItem records.

**Key fields and what they mean:**
- `orderId` — which order this item belongs to
- `productId` — which product was bought
- `quantity` — how many units
- `unitPrice` — price at the time of purchase (important — product prices can change later)
- `lineTotal` — quantity × unitPrice

**Why it matters:** Without this, you can't know what was inside an order. This is what powers "customers who bought X also bought Y."

---

### 4. 🏷️ Products
**What it is:** Your product catalog — every item you sell.

**Key fields and what they mean:**
- `name` — product name
- `sku` — unique product code for inventory
- `price` — current selling price
- `category` — e.g. clothing, electronics, skincare
- `stock` — how many units are available
- `tags` — keywords for filtering and search

**Why it matters:** Connected to OrderItems so you know which products are selling, and you can filter customers by what they've bought.

---

### 5. 🎟️ Coupons
**What it is:** All your discount codes — how they work, who can use them, and how many times.

**Key fields and what they mean:**
- `code` — the code customers type at checkout (e.g. `SAVE20`)
- `discountType` — `percentage` (20% off) or `flat` (₹100 off)
- `discountValue` — how much off (20 or 100)
- `minOrderValue` — only works if order is above this amount
- `maxUses` — total number of times this coupon can be used across all customers
- `usedCount` — how many times it's been used so far
- `applicableTo` — all products, specific category, or specific product
- `isActive` — is the coupon currently live?
- `expiresAt` — after this date, coupon stops working

**Why it matters:** You can attach coupons to campaigns, track which ones drive the most sales, and control abuse.

---

### 6. 👥 Segments
**What it is:** Smart groups of customers, built automatically by rules you define.

**Key fields and what they mean:**
- `name` — e.g. "VIP Customers" or "At Risk"
- `rules` — the conditions a customer must meet to be in this group. Example: `{ field: "totalSpent", operator: ">", value: 10000 }`
- `customerIds` — list of customer IDs currently in this segment
- `count` — how many customers are in this segment right now

**Why it matters:** Instead of manually picking who to email, you define the rule once and the CRM keeps the group updated automatically.

---

### 7. 📣 Campaigns
**What it is:** A marketing message sent to a specific segment of customers.

**Key fields and what they mean:**
- `segmentId` — which group of customers to send to
- `couponId` — attach a discount code to this campaign
- `name` — internal name for the campaign
- `type` — welcome, win-back, promotional, abandoned cart, etc.
- `channel` — email or SMS
- `status` — draft, scheduled, sent, or paused
- `sentCount` — how many customers received it
- `openRate` — percentage who opened the email
- `scheduledAt` — when to send it

**Why it matters:** This is how you turn segments into action. A campaign without a segment sends to everyone; with a segment it's targeted and effective.

---

### 8. 💬 Interactions
**What it is:** A log of every time your team touched a customer — a call, email, chat, or internal note.

**Key fields and what they mean:**
- `customerId` — which customer this interaction is about
- `type` — call, email, chat, note, or meeting
- `channel` — phone, WhatsApp, email, live chat, etc.
- `notes` — what was discussed or what happened
- `createdAt` — when it happened

**Why it matters:** If a customer calls and a different team member answers, they can instantly see the full history and context. No one has to start from scratch.

---

### 9. 🎫 Support
**What it is:** Customer complaints, questions, and return requests — each one tracked as a ticket.

**Key fields and what they mean:**
- `customerId` — who raised the issue
- `orderId` — which order the issue is about (if applicable)
- `subject` — short title of the issue (e.g. "Package not delivered")
- `status` — open, in-progress, or resolved
- `priority` — low, medium, high, or urgent
- `messages` — full back-and-forth thread between customer and support team
- `resolvedAt` — when the issue was closed

**Why it matters:** Without this, support is done over email or WhatsApp and nothing is tracked. This keeps every issue visible, assigned, and resolved.

---

### 10. 📊 Analytics
**What it is:** A daily snapshot of your business performance, automatically calculated.

**Key fields and what they mean:**
- `date` — which day this snapshot is for
- `totalRevenue` — total money collected that day
- `totalOrders` — number of orders placed
- `newCustomers` — how many first-time buyers
- `repeatRate` — percentage of orders from returning customers
- `avgOrderValue` — totalRevenue ÷ totalOrders
- `couponUsage` — how many orders used a coupon that day

**Why it matters:** Instead of running slow queries every time you open the dashboard, this collection stores pre-calculated numbers so your dashboard loads instantly.

---

## 🔗 How They All Connect — Simple Version
```

Customers
├── has many → Orders
│ └── has many → OrderItems → each refs a Product
│ └── may use → Coupon
├── belongs to → Segments → targeted by → Campaigns → uses → Coupon
├── has many → Interactions
├── has many → Support Tickets → linked to → Orders
└── has emailSettings → controls what emails they get

========
Sidebar
├── Dashboard
├── Customers
├── Orders
├── Products
├── Coupons
├── Marketing
│ ├── Segments
│ └── Campaigns
├── Support
└── Analytics
