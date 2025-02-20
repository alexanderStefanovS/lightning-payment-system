import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { ActivityLogService } from './activity-log.service';

@Injectable()
export class ActivityLogInterceptor implements NestInterceptor {
    constructor(private readonly activityLogService: ActivityLogService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id || 'anonymous';
        const { method, path, body } = request;

        return next.handle().pipe(
            tap(() => this.activityLogService.logActivity(userId, 'API Request', method, path, body)),
            catchError((error) => {
                this.activityLogService.logActivity(userId, 'API Request Failed', method, path, body, 'error', error.message);
                throw error;
            })
        );
    }
}
