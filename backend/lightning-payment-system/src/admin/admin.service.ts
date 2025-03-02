import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from 'src/activity-log/activity-log.schema';
import { User } from 'src/user/user.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) { }

  async getActivityLogs(
    filters: { email?: string; startDate?: string; endDate?: string },
    sort: { field?: string; order?: string },
    pagination: { page: number; limit: number },
  ) {
    const query: any = {};
    let userMap = new Map<string, any>();

    if (filters.email) {
      const user = await this.userModel.findOne({ email: filters.email }).lean();

      if (user) {
        query.userId = user._id;
      }
    }

    if (filters.startDate || filters.endDate) {
      query.createdAt = {};

      if (filters.startDate) {
        query.createdAt.$gte = new Date(filters.startDate)
      };

      if (filters.endDate) {
        query.createdAt.$lte = new Date(filters.endDate);
      }
    }

    const sortQuery: any = {};
    if (sort.field) {
      sortQuery[sort.field] = sort.order === 'asc' ? 1 : -1;
    }

    const page = pagination.page > 0 ? pagination.page : 1;
    const limit = pagination.limit > 0 ? pagination.limit : 10;
    const skip = (page - 1) * limit;

    const logs = await this.activityLogModel
      .find(query, { createdAt: 1, userId: 1, action: 1, method: 1, path: 1, status: 1 })
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = [...new Set(logs.map((log) => log.userId))].filter((id) => id !== 'anonymous');

    if (userIds.length > 0) {
      const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
      userMap = new Map(users.map((user) => [user._id.toString(), user]));
    }

    return {
      logs: logs.map((log) => ({
        id: log._id,
        action: log.action,
        method: log.method,
        path: log.path,
        status: log.status,
        createdAt: log.createdAt,
        user: userMap.has(log.userId.toString())
          ? {
            email: userMap.get(log.userId.toString()).email,
            firstName: userMap.get(log.userId.toString()).firstName,
            lastName: userMap.get(log.userId.toString()).lastName,
            role: userMap.get(log.userId.toString()).role,
          }
          : null,
      })),
      meta: {
        total: await this.activityLogModel.countDocuments(query),
        page,
        limit,
        totalPages: Math.ceil((await this.activityLogModel.countDocuments(query)) / limit),
      },
    };
  }
}
