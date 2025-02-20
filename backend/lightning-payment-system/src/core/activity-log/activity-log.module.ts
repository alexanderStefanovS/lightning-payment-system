import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ActivityLogInterceptor } from './activity-log.interceptor';
import { ActivityLogService } from './activity-log.service';
import { ActivityLog, ActivityLogSchema } from './activity-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: ActivityLog.name, schema: ActivityLogSchema }])
    ],
    providers: [
        ActivityLogService,
        {
            provide: APP_INTERCEPTOR,
            useClass: ActivityLogInterceptor,
        },
    ],
    exports: [ActivityLogService],
})
export class ActivityLogModule {}
