import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActivityLog, ActivityLogDocument } from './activity-log.schema';

@Injectable()
export class ActivityLogService {
    private readonly logger = new Logger(ActivityLogService.name);

    constructor(@InjectModel(ActivityLog.name) private activityLogModel: Model<ActivityLogDocument>) {}

    async logActivity(userId: string, action: string, method: string, path: string, body?: any, status = 'success', errorMessage?: string) {
        try {
            const log = new this.activityLogModel({ userId, action, method, path, body, status, errorMessage });
            await log.save();
        } catch (error) {
            this.logger.error('Failed to save activity log', error);
        }
    }
}
