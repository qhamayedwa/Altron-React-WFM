import { Router, Request, Response } from 'express';

const router = Router();

router.get('/organizations', async (req: Request, res: Response) => {
  try {
    const tenants = [
      {
        id: 1,
        name: 'Demo Corporation',
        subdomain: 'demo',
        domain: 'democorp.com',
        admin_email: 'admin@democorp.com',
        user_count: 45,
        max_users: 50,
        subscription_plan: 'enterprise',
        is_active: true,
        created_at: '2025-01-15',
        is_over_limit: false
      },
      {
        id: 2,
        name: 'Tech Solutions Inc',
        subdomain: 'techsolutions',
        domain: null,
        admin_email: 'admin@techsolutions.com',
        user_count: 30,
        max_users: 50,
        subscription_plan: 'premium',
        is_active: true,
        created_at: '2025-02-20',
        is_over_limit: false
      }
    ];
    
    res.json({
      tenants,
      total: tenants.length,
      active: tenants.filter(t => t.is_active).length,
      totalUsers: tenants.reduce((sum, t) => sum + t.user_count, 0)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

router.get('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenant = {
      id: parseInt(id),
      name: 'Demo Corporation',
      subdomain: 'demo',
      domain: 'democorp.com',
      admin_email: 'admin@democorp.com',
      phone: '+27 11 123 4567',
      address: '123 Business St, Johannesburg, South Africa',
      user_count: 45,
      max_users: 50,
      subscription_plan: 'enterprise',
      is_active: true,
      timezone: 'Africa/Johannesburg',
      currency: 'ZAR',
      created_at: '2025-01-15'
    };
    
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch organization' });
  }
});

router.post('/organizations', async (req: Request, res: Response) => {
  try {
    const {
      name,
      subdomain,
      admin_email,
      phone,
      domain,
      address,
      subscription_plan,
      max_users,
      is_active,
      timezone,
      currency
    } = req.body;
    
    const newTenant = {
      id: Date.now(),
      name,
      subdomain,
      admin_email,
      phone,
      domain,
      address,
      subscription_plan,
      max_users: parseInt(max_users),
      is_active,
      timezone,
      currency,
      user_count: 0,
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newTenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create organization' });
  }
});

router.put('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const updatedTenant = {
      id: parseInt(id),
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    res.json(updatedTenant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update organization' });
  }
});

router.delete('/organizations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Organization deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete organization' });
  }
});

router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const dashboardData = {
      tenant: {
        id: 1,
        name: 'Demo Corporation',
        max_users: 50,
        timezone: 'Africa/Johannesburg',
        currency: 'ZAR',
        subscription_plan: 'enterprise'
      },
      totalUsers: 45,
      activeUsers: 38
    };
    
    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenant dashboard data' });
  }
});

router.post('/organizations/:id/create-admin', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, first_name, last_name } = req.body;
    
    const newAdmin = {
      id: Date.now(),
      tenant_id: parseInt(id),
      email,
      first_name,
      last_name,
      role: 'tenant_admin',
      created_at: new Date().toISOString()
    };
    
    res.status(201).json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant admin' });
  }
});

export default router;
