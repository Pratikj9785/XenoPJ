const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../services/prismaClient');
const auth = require('../middleware/auth');

const router = express.Router();

// Register new tenant/user
router.post('/register', async (req, res) => {
  try {
    const { email, password, shopDomain, shopName } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create tenant, user and shop in a single transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant first (required by FK)
      const tenant = await tx.tenant.create({
        data: {
          name: shopName || (email?.split('@')[1] ?? 'Tenant')
        }
      });

      // Create user linked to tenant
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          tenantId: tenant.id,
        },
      });

      // Create shop linked to same tenant
      const shop = await tx.shop.create({
        data: {
          tenantId: tenant.id,
          shopDomain,
          name: shopName,
          accessToken: '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', // Placeholder; replace with OAuth token
        },
      });

      return { tenant, user, shop };
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: result.user.id, 
        email: result.user.email, 
        storeId: result.shop.id,
        tenantId: result.user.tenantId 
      },
      process.env.JWT_SECRET || require('../config').config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: result.user.id,
        email: result.user.email,
        tenantId: result.user.tenantId,
      },
      shop: {
        id: result.shop.id,
        shopDomain: result.shop.shopDomain,
        name: result.shop.name,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login existing user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: { tenant: { include: { shops: true } } }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Get primary shop (for demo, use first shop)
    const primaryShop = user.tenant?.shops?.[0];
    if (!primaryShop) {
      return res.status(400).json({ message: 'No shop associated with this user' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        storeId: primaryShop.id,
        tenantId: user.tenantId 
      },
      process.env.JWT_SECRET || require('../config').config.jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        tenantId: user.tenantId,
      },
      shop: {
        id: primaryShop.id,
        shopDomain: primaryShop.shopDomain,
        name: primaryShop.name,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add shop to existing user
router.post('/add-shop', auth, async (req, res) => {
  try {
    const { shopDomain, shopName, accessToken } = req.body;
    const userId = req.user.userId; // From auth middleware

    // Get user's tenant ID
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new shop
    const shop = await prisma.shop.create({
      data: {
        tenantId: user.tenantId,
        shopDomain,
        name: shopName,
        accessToken,
      },
    });

    res.status(201).json({
      message: 'Shop added successfully',
      shop: {
        id: shop.id,
        shopDomain: shop.shopDomain,
        name: shop.name,
      },
    });
  } catch (error) {
    console.error('Add shop error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
