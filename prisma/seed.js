const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@brightloop.com',
      password: await bcrypt.hash('Admin@123', 10),
      name: 'Admin User',
      role: 'admin',
    },
  });

  const staff = await prisma.user.create({
    data: {
      email: 'staff@brightloop.com',
      password: await bcrypt.hash('Staff@123', 10),
      name: 'Staff User',
      role: 'staff',
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: 'customer@example.com',
      password: await bcrypt.hash('Customer@123', 10),
      name: 'John Customer',
      role: 'customer',
    },
  });

  // Create customers
  const customers = [];
  const customerNames = [
    { name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corp', phone: '+91-9876543210' },
    { name: 'TechStart Inc', email: 'info@techstart.com', company: 'TechStart Inc', phone: '+91-9876543211' },
    { name: 'Global Solutions', email: 'hello@globalsol.com', company: 'Global Solutions', phone: '+91-9876543212' },
    { name: 'Digital Dynamics', email: 'contact@digitaldyn.com', company: 'Digital Dynamics', phone: '+91-9876543213' },
    { name: 'Cloud Nine Ltd', email: 'info@cloudnine.com', company: 'Cloud Nine Ltd', phone: '+91-9876543214' },
    { name: 'InnovateCo', email: 'hello@innovateco.com', company: 'InnovateCo', phone: '+91-9876543215' },
    { name: 'FutureTech', email: 'contact@futuretech.com', company: 'FutureTech', phone: '+91-9876543216' },
    { name: 'SmartSystems', email: 'info@smartsystems.com', company: 'SmartSystems', phone: '+91-9876543217' },
    { name: 'WebWorks', email: 'hello@webworks.com', company: 'WebWorks', phone: '+91-9876543218' },
  ];

  const mainCustomer = await prisma.customer.create({
    data: {
      userId: customerUser.id,
      name: 'John Customer',
      email: 'customer@example.com',
      phone: '+91-9999999999',
      company: 'Customer Corp',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      customerType: 'business',
      status: 'active',
    },
  });
  customers.push(mainCustomer);

  for (const data of customerNames) {
    const customer = await prisma.customer.create({
      data: {
        ...data,
        address: '123 Business Street',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        customerType: 'business',
        status: 'active',
      },
    });
    customers.push(customer);
  }

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Odoo Community',
        type: 'Software',
        salesPrice: 1000,
        costPrice: 500,
        notes: 'Odoo Community Edition',
        status: 'active',
        variants: {
          create: [
            { name: 'Odoo Enterprise Addon', additionalPrice: 560, status: 'active' },
            { name: 'Premium Support', additionalPrice: 300, status: 'active' },
          ],
        },
      },
    }),
    prisma.product.create({
      data: {
        name: 'CRM Pro',
        type: 'Software',
        salesPrice: 2500,
        costPrice: 1200,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Project Management Suite',
        type: 'Software',
        salesPrice: 3000,
        costPrice: 1500,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Accounting Software',
        type: 'Software',
        salesPrice: 1800,
        costPrice: 900,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'HR Management System',
        type: 'Software',
        salesPrice: 2200,
        costPrice: 1100,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Inventory Management',
        type: 'Software',
        salesPrice: 1500,
        costPrice: 750,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'E-commerce Platform',
        type: 'Software',
        salesPrice: 4000,
        costPrice: 2000,
        status: 'active',
      },
    }),
    prisma.product.create({
      data: {
        name: 'Analytics Dashboard',
        type: 'Software',
        salesPrice: 2800,
        costPrice: 1400,
        status: 'active',
      },
    }),
  ]);

  // Create taxes
  const gst = await prisma.tax.create({
    data: {
      name: 'GST 18%',
      type: 'percentage',
      value: 18,
      description: 'Goods and Services Tax',
      isDefault: true,
      status: 'active',
    },
  });

  // Create subscription plans
  const plans = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: 'Basic Monthly',
        description: 'Basic plan with monthly billing',
        price: 1000,
        billingFrequency: 'monthly',
        minimumQuantity: 1,
        autoClose: false,
        allowEarlyClosure: true,
        allowPause: true,
        allowRenewal: true,
        status: 'active',
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Professional Monthly',
        description: 'Professional plan with advanced features',
        price: 2500,
        billingFrequency: 'monthly',
        minimumQuantity: 1,
        autoClose: false,
        allowEarlyClosure: true,
        allowPause: true,
        allowRenewal: true,
        status: 'active',
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Enterprise Yearly',
        description: 'Enterprise plan with yearly commitment',
        price: 30000,
        billingFrequency: 'yearly',
        minimumQuantity: 5,
        autoClose: false,
        allowEarlyClosure: false,
        allowPause: false,
        allowRenewal: true,
        status: 'active',
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Starter Weekly',
        description: 'Starter plan for trial',
        price: 250,
        billingFrequency: 'weekly',
        minimumQuantity: 1,
        autoClose: true,
        allowEarlyClosure: true,
        allowPause: true,
        allowRenewal: true,
        status: 'active',
      },
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: 'Premium Quarterly',
        description: 'Premium plan billed quarterly',
        price: 7000,
        billingFrequency: 'monthly',
        minimumQuantity: 1,
        autoClose: false,
        allowEarlyClosure: true,
        allowPause: true,
        allowRenewal: true,
        status: 'active',
      },
    }),
  ]);

  // Create discounts
  await Promise.all([
    prisma.discount.create({
      data: {
        name: 'Early Bird 10%',
        code: 'EARLY10',
        type: 'percentage',
        value: 10,
        minimumPurchase: 5000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUses: 100,
        currentUses: 15,
        status: 'active',
      },
    }),
    prisma.discount.create({
      data: {
        name: 'Flat ₹500 Off',
        code: 'SAVE500',
        type: 'fixed',
        value: 500,
        minimumPurchase: 10000,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUses: 50,
        currentUses: 8,
        status: 'active',
      },
    }),
    prisma.discount.create({
      data: {
        name: 'New Customer 15%',
        code: 'NEW15',
        type: 'percentage',
        value: 15,
        minimumPurchase: 0,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        maxUses: 200,
        currentUses: 45,
        status: 'active',
      },
    }),
  ]);

  // Create subscriptions
  const subscriptions = [];
  for (let i = 0; i < 15; i++) {
    const customer = customers[i % customers.length];
    const plan = plans[i % plans.length];
    const product = products[i % products.length];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - Math.floor(Math.random() * 6));

    const quantity = Math.floor(Math.random() * 5) + 1;
    const unitPrice = product.salesPrice;
    const taxRate = 18;
    const subtotal = quantity * unitPrice;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + taxAmount;

    const statuses = ['active', 'active', 'active', 'paused', 'closed'];
    const status = statuses[i % statuses.length];

    const subscription = await prisma.subscription.create({
      data: {
        number: `SUB-${String(i + 1).padStart(4, '0')}`,
        customerId: customer.id,
        planId: plan.id,
        startDate,
        expiryDate: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        billingFrequency: plan.billingFrequency,
        paymentTerms: 'Net 30',
        subtotal,
        taxAmount,
        total,
        nextBillingDate: status === 'active' ? new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000) : null,
        status,
        lines: {
          create: [
            {
              productId: product.id,
              quantity,
              unitPrice,
              taxRate,
              discount: 0,
              total: quantity * unitPrice,
            },
          ],
        },
      },
    });
    subscriptions.push(subscription);
  }

  // Create invoices
  const invoices = [];
  for (let i = 0; i < 10; i++) {
    const subscription = subscriptions[i];
    const customer = customers.find((c) => c.id === subscription.customerId);
    const invoiceDate = new Date(subscription.startDate);
    invoiceDate.setDate(invoiceDate.getDate() + 5);
    const dueDate = new Date(invoiceDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const statuses = ['paid', 'paid', 'confirmed', 'partially_paid', 'overdue'];
    const status = statuses[i % statuses.length];
    const amountPaid = status === 'paid' ? subscription.total : status === 'partially_paid' ? subscription.total * 0.5 : 0;

    const invoice = await prisma.invoice.create({
      data: {
        number: `INV-${String(i + 1).padStart(4, '0')}`,
        customerId: customer.id,
        subscriptionId: subscription.id,
        invoiceDate,
        dueDate,
        billingPeriodStart: subscription.startDate,
        billingPeriodEnd: new Date(subscription.startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        subtotal: subscription.subtotal,
        taxAmount: subscription.taxAmount,
        discount: 0,
        total: subscription.total,
        amountPaid,
        outstanding: subscription.total - amountPaid,
        status,
        lines: {
          create: [
            {
              description: `Subscription ${subscription.number}`,
              quantity: 1,
              unitPrice: subscription.total,
              taxRate: 18,
              discount: 0,
              total: subscription.total,
            },
          ],
        },
      },
    });
    invoices.push(invoice);
  }

  // Create payments
  const paymentMethods = ['bank_transfer', 'upi', 'card', 'cash'];
  for (let i = 0; i < 8; i++) {
    const invoice = invoices[i];
    const customer = customers.find((c) => c.id === invoice.customerId);

    if (invoice.amountPaid > 0) {
      await prisma.payment.create({
        data: {
          reference: `PAY-${String(i + 1).padStart(4, '0')}`,
          customerId: customer.id,
          invoiceId: invoice.id,
          amount: invoice.amountPaid,
          paymentMethod: paymentMethods[i % paymentMethods.length],
          paymentDate: new Date(invoice.invoiceDate.getTime() + Math.floor(Math.random() * 15) * 24 * 60 * 60 * 1000),
          transactionRef: `TXN${Date.now()}${i}`,
          notes: 'Payment received',
        },
      });
    }
  }

  // Create company settings
  await prisma.companySetting.create({
    data: {
      companyName: 'Brightloop Software',
      email: 'info@brightloop.com',
      phone: '+91-1234567890',
      address: '123 Tech Park, Bangalore',
      currency: 'INR',
      invoicePrefix: 'INV',
      subPrefix: 'SUB',
      defaultTaxId: gst.id,
    },
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
