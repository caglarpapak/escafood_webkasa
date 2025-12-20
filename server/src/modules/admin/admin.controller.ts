import { Request, Response } from 'express';
import { AdminService } from './admin.service';

const service = new AdminService();

export class AdminController {
  async clearAllData(_req: Request, res: Response) {
    try {
      const result = await service.clearAllData();
      res.json(result);
    } catch (error: any) {
      console.error('Admin clearAllData error:', error);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}

