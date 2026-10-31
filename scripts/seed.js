const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Brightloop BSMS database...');

  // Clean existing tables
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.discount.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.user.deleteMany();

  // Password hashes
  const adminHash = await bcrypt.hash('Admin@123!', 10);
  const staffHash = await bcrypt.hash('Staff@123!', 10);
  const financeHash = await bcrypt.hash('Finance@123!', 10);
  const customerHash = await bcrypt.hash('Customer@123!', 10);

  // 1. Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brightloop.com',
      passwordHash: adminHash,
      name: 'Elena Rostova (Admin)',
      role: 'ADMIN',
      companyName: 'Brightloop Software HQ',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'sales@brightloop.com',
      passwordHash: staffHash,
      name: 'Marcus Vance (Sales & Ops)',
      role: 'STAFF',
      companyName: 'Brightloop Sales Team',
    },
  });

  const finance = await prisma.user.create({
    data: {
      email: 'finance@brightloop.com',
      passwordHash: financeHash,
      name: 'Sarah Chen (Finance Lead)',
      role: 'ADMIN', // Finance Lead has Admin-level financial visibility
      companyName: 'Brightloop Finance & Treasury',
    },
  });

  const customer1 = await prisma.user.create({
    data: {
      email: 'alex@acmecorp.com',
      passwordHash: customerHash,
      name: 'Alex Rivera',
      role: 'CUSTOMER',
      companyName: 'Acme Global Logistics',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'claire@globex.io',
      passwordHash: customerHash,
      name: 'Claire Dupont',
      role: 'CUSTOMER',
      companyName: 'Globex Cloud Solutions',
    },
  });

  const customer3 = await prisma.user.create({
    data: {
      email: 'tony@starkind.com',
      passwordHash: customerHash,
      name: 'Tony Harrison',
      role: 'CUSTOMER',
      companyName: 'Stark Manufacturing Corp',
    },
  });

  console.log('✓ Users created');

  // 2. Tax Rules
  const taxUS = await prisma.taxRule.create({
    data: {
      name: 'US Sales Tax (8.25%)',
      rate: 8.25,
      region: 'US',
      isDefault: true,
      active: true,
    },
  });

  const taxEU = await prisma.taxRule.create({
    data: {
      name: 'EU Standard VAT (20.00%)',
      rate: 20.0,
      region: 'EU',
      isDefault: false,
      active: true,
    },
  });

  await prisma.taxRule.create({
    data: {
      name: 'Zero Tax / Export (0.00%)',
      rate: 0.0,
      region: 'GLOBAL',
      isDefault: false,
      active: true,
    },
  });

  console.log('✓ Tax rules created');

  // 3. Products & Variants
  const prodErp = await prisma.product.create({
    data: {
      name: 'Brightloop Core ERP Platform',
      type: 'Software',
      salesPrice: 1200.0,
      costPrice: 420.0,
      notes: 'Unified cloud ERP solution with multi-currency and real-time ledger accounting.',
      variants: {
        create: [
          { variantName: 'Standard Edition', priceAdjustment: 0.0 },
          { variantName: 'Odoo Brand Connector', priceAdjustment: 560.0 },
          { variantName: 'Enterprise Multi-Entity Suite', priceAdjustment: 1250.0 },
        ],
      },
    },
    include: { variants: true },
  });

  const prodCloud = await prisma.product.create({
    data: {
      name: 'Dedicated Managed Cloud & CDN',
      type: 'Service',
      salesPrice: 450.0,
      costPrice: 150.0,
      notes: 'Isolated tenant infrastructure with 99.99% SLA and geo-replicated database backups.',
      variants: {
        create: [
          { variantName: 'Standard Bandwidth (10TB)', priceAdjustment: 0.0 },
          { variantName: 'High Availability Multi-Region (50TB)', priceAdjustment: 320.0 },
        ],
      },
    },
    include: { variants: true },
  });

  const prodBi = await prisma.product.create({
    data: {
      name: 'AI Insights & Executive Analytics BI',
      type: 'Add-on',
      salesPrice: 280.0,
      costPrice: 80.0,
      notes: 'Predictive churn modeling, automated forecast reports, and cohort visualizations.',
      variants: {
        create: [
          { variantName: 'Standard Analytics', priceAdjustment: 0.0 },
          { variantName: 'AI Autonomous Anomaly Detection', priceAdjustment: 190.0 },
        ],
      },
    },
    include: { variants: true },
  });

  const prodSupport = await prisma.product.create({
    data: {
      name: '24/7 Dedicated Support SLA & TAM',
      type: 'Service',
      salesPrice: 600.0,
      costPrice: 200.0,
      notes: '15-minute response time guarantee with dedicated Technical Account Manager.',
      variants: {
        create: [
          { variantName: 'Standard 24/7 Phone & Slack', priceAdjustment: 0.0 },
        ],
      },
    },
    include: { variants: true },
  });

  console.log('✓ Products & Variants created');

  // 4. Plans
  const planStarter = await prisma.plan.create({
    data: {
      name: 'Brightloop Starter Tier',
      basePrice: 299.0,
      frequency: 'MONTHLY',
      minQuantity: 1,
      canPause: true,
      autoClose: false,
    },
  });

  const planPro = await prisma.plan.create({
    data: {
      name: 'Growth Professional Tier',
      basePrice: 899.0,
      frequency: 'MONTHLY',
      minQuantity: 1,
      canPause: true,
      autoClose: false,
    },
  });

  const planEnterprise = await prisma.plan.create({
    data: {
      name: 'Enterprise Scale Annual',
      basePrice: 8500.0,
      frequency: 'YEARLY',
      minQuantity: 1,
      canPause: true,
      autoClose: false,
    },
  });

  const planWeekly = await prisma.plan.create({
    data: {
      name: 'Weekly Sprint Operations',
      basePrice: 199.0,
      frequency: 'WEEKLY',
      minQuantity: 1,
      canPause: true,
      autoClose: false,
    },
  });

  console.log('✓ Subscription Plans created');

  // 5. Discounts
  const discountWelcome = await prisma.discount.create({
    data: {
      code: 'WELCOME20',
      discountType: 'PERCENTAGE',
      value: 20.0,
      minPurchaseAmount: 500.0,
      minQuantity: 1,
      maxUses: 100,
      currentUses: 3,
    },
  });

  const discountFixed = await prisma.discount.create({
    data: {
      code: 'SCALE500',
      discountType: 'FIXED',
      value: 500.0,
      minPurchaseAmount: 1500.0,
      minQuantity: 1,
      maxUses: 50,
      currentUses: 1,
    },
  });

  console.log('✓ Discounts created');

  // 6. Subscriptions
  // Subscription 1: Active Monthly for Acme Corp
  const sub1 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0001',
      customerId: customer1.id,
      planId: planPro.id,
      status: 'ACTIVE',
      startDate: new Date('2026-01-15'),
      nextBillingDate: new Date('2026-11-15'),
      paymentTerms: 'Net 15',
      discountId: discountWelcome.id,
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: prodErp.variants[1].id, // Odoo Brand Connector
            quantity: 1,
            unitPrice: 1760.0, // 1200 + 560
            taxRate: 8.25,
            subtotal: 1760.0,
          },
          {
            productId: prodCloud.id,
            variantId: prodCloud.variants[0].id,
            quantity: 1,
            unitPrice: 450.0,
            taxRate: 8.25,
            subtotal: 450.0,
          },
        ],
      },
    },
  });

  // Subscription 2: Active (Ready to Bill Today) for Globex
  const sub2 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0002',
      customerId: customer2.id,
      planId: planEnterprise.id,
      status: 'ACTIVE',
      startDate: new Date('2025-10-31'),
      nextBillingDate: new Date('2026-10-31'), // Billable right now
      paymentTerms: 'Net 30',
      discountId: discountFixed.id,
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: prodErp.variants[2].id, // Enterprise Multi-Entity
            quantity: 1,
            unitPrice: 2450.0,
            taxRate: 8.25,
            subtotal: 2450.0,
          },
          {
            productId: prodCloud.id,
            variantId: prodCloud.variants[1].id, // High availability
            quantity: 2,
            unitPrice: 770.0,
            taxRate: 8.25,
            subtotal: 1540.0,
          },
          {
            productId: prodBi.id,
            variantId: prodBi.variants[1].id, // AI insights
            quantity: 1,
            unitPrice: 470.0,
            taxRate: 8.25,
            subtotal: 470.0,
          },
        ],
      },
    },
  });

  // Subscription 3: Shareable Public Quotation with 1-Click Buy Token for Stark
  const sub3 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0003',
      customerId: customer3.id,
      planId: planPro.id,
      status: 'QUOTATION',
      startDate: new Date('2026-11-01'),
      expiryDate: new Date('2026-11-20'),
      paymentTerms: 'Net 15',
      shareToken: 'quote-tok-stark-2026-abc89f',
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: prodErp.variants[0].id,
            quantity: 2,
            unitPrice: 1200.0,
            taxRate: 8.25,
            subtotal: 2400.0,
          },
          {
            productId: prodSupport.id,
            variantId: prodSupport.variants[0].id,
            quantity: 1,
            unitPrice: 600.0,
            taxRate: 8.25,
            subtotal: 600.0,
          },
        ],
      },
    },
  });

  // Subscription 4: Paused Subscription (Dunning Hold) for Acme Corp
  const sub4 = await prisma.subscription.create({
    data: {
      subscriptionNumber: 'SUB-2026-0004',
      customerId: customer1.id,
      planId: planStarter.id,
      status: 'PAUSED',
      startDate: new Date('2026-05-01'),
      nextBillingDate: new Date('2026-10-15'),
      paymentTerms: 'Net 15',
      lines: {
        create: [
          {
            productId: prodBi.id,
            variantId: prodBi.variants[0].id,
            quantity: 1,
            unitPrice: 280.0,
            taxRate: 8.25,
            subtotal: 280.0,
          },
        ],
      },
    },
  });

  console.log('✓ Subscriptions created');

  // 7. Invoices & Payments
  // Invoice 1: Paid invoice for Acme Corp
  const inv1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0001',
      subscriptionId: sub1.id,
      customerId: customer1.id,
      issueDate: new Date('2026-09-15'),
      dueDate: new Date('2026-09-30'),
      subtotal: 2210.0,
      discountAmount: 442.0, // 20%
      taxAmount: 145.86,
      totalAmount: 1913.86,
      balanceDue: 0.0,
      status: 'PAID',
      dunningStage: 0,
      payments: {
        create: [
          {
            amount: 1913.86,
            paymentMethod: 'Credit Card',
            paymentDate: new Date('2026-09-28'),
            referenceNote: 'Stripe txn_3Mpq892LKhs98a',
          },
        ],
      },
    },
  });

  // Invoice 2: Confirmed pending payment for Globex
  const inv2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0002',
      subscriptionId: sub2.id,
      customerId: customer2.id,
      issueDate: new Date('2026-10-20'),
      dueDate: new Date('2026-11-20'),
      subtotal: 4460.0,
      discountAmount: 500.0,
      taxAmount: 326.7,
      totalAmount: 4286.7,
      balanceDue: 4286.7,
      status: 'CONFIRMED',
      dunningStage: 0,
    },
  });

  // Invoice 3: Overdue (Dunning Stage 2 - Day 7 Urgent) for Acme
  const inv3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0003',
      subscriptionId: sub4.id,
      customerId: customer1.id,
      issueDate: new Date('2026-10-01'),
      dueDate: new Date('2026-10-15'), // Overdue by 16 days!
      subtotal: 280.0,
      discountAmount: 0.0,
      taxAmount: 23.1,
      totalAmount: 303.1,
      balanceDue: 303.1,
      status: 'OVERDUE',
      dunningStage: 3, // Dunning Stage 3: Service Paused
    },
  });

  // Invoice 4: Overdue (Dunning Stage 1 - Day 3 Friendly) for Stark
  const inv4 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2026-0004',
      subscriptionId: sub1.id,
      customerId: customer3.id,
      issueDate: new Date('2026-10-18'),
      dueDate: new Date('2026-10-26'), // Overdue by 5 days
      subtotal: 600.0,
      discountAmount: 0.0,
      taxAmount: 49.5,
      totalAmount: 649.5,
      balanceDue: 649.5,
      status: 'OVERDUE',
      dunningStage: 1, // Friendly reminder sent
    },
  });

  console.log('✓ Invoices & Payments created');

  // 8. ERP Audit Logs & Activity Chatter
  await prisma.auditLog.createMany({
    data: [
      {
        subscriptionId: sub1.id,
        actorId: staff.id,
        action: 'STATE_CHANGE',
        details: 'Subscription created in DRAFT and converted to QUOTATION with Net 15 terms.',
        createdAt: new Date('2026-01-14T09:30:00Z'),
      },
      {
        subscriptionId: sub1.id,
        actorId: customer1.id,
        action: 'STATE_CHANGE',
        details: 'Customer accepted quotation and signed digitally via secure 1-click token.',
        createdAt: new Date('2026-01-15T11:45:00Z'),
      },
      {
        subscriptionId: sub1.id,
        actorId: admin.id,
        action: 'DISCOUNT_APPLIED',
        details: 'Promotional voucher WELCOME20 applied (-20% on monthly billing recurring total).',
        createdAt: new Date('2026-01-15T12:00:00Z'),
      },
      {
        subscriptionId: sub1.id,
        actorId: null,
        action: 'INVOICE_GENERATED',
        details: 'Automated recurring billing engine generated Invoice INV-2026-0001 for period Sep 15 - Oct 15.',
        createdAt: new Date('2026-09-15T00:01:00Z'),
      },
      {
        invoiceId: inv1.id,
        actorId: customer1.id,
        action: 'PAYMENT_RECEIVED',
        details: 'Online payment of $1,913.86 registered via Stripe (Ref: txn_3Mpq892LKhs98a). Invoice marked PAID.',
        createdAt: new Date('2026-09-28T14:22:00Z'),
      },
      {
        subscriptionId: sub4.id,
        actorId: null,
        action: 'DUNNING_TRIGGERED',
        details: 'Invoice INV-2026-0003 is 14+ days overdue. Automated dunning engine transitioned subscription status to PAUSED.',
        createdAt: new Date('2026-10-29T08:00:00Z'),
      },
      {
        invoiceId: inv3.id,
        actorId: null,
        action: 'DUNNING_TRIGGERED',
        details: 'Stage 3 Urgent Notice dispatched with payment gateway link. Service suspension warning communicated.',
        createdAt: new Date('2026-10-29T08:00:00Z'),
      },
    ],
  });

  console.log('✓ ERP Audit Log timeline created');
  console.log('\nDatabase seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

