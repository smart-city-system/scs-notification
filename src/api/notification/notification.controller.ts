import { Controller, Post, Body, Query, Get, Patch } from '@nestjs/common';
import { KafkaProducer } from '@/modules/kafka/kafka.producer';
import { Public } from '@/common/decorators/public.decorator';
import { NotificationService } from './notification.service';
import { User } from '@/common/decorators/user.decorator';
import { IPaginationMeta, Pagination } from 'nestjs-typeorm-paginate';
import { Notification } from '@/entity/notification.entity';

@Controller('notifications')
export class NotificationController {
  constructor(
    private notificationService: NotificationService
  ) {}
  @Get()
  async getAll(@Query() query: { page: number; limit: number }, @User() user: any ): Promise<{ data: any[]; pagination: { total_pages: number; page: number; limit: number } }> {
    const page = query.page || 0;
    const limit = query.limit || 10;
    return this.notificationService.getAll({ page, limit }, user);
  }
  @Patch('/read')
  async markAsRead(@Body() body: { id: string }, @User() user: any) {
    return this.notificationService.markAsRead(body.id, user);
  }
}
