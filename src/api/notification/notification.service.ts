import { Repository } from "typeorm";
import { CreateNotificationRequestDto } from "./dto/create-notification-request.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Notification } from "@/entity/notification.entity";
import { User } from "@/entity/user.entity";
import { IPaginationMeta, Pagination } from "nestjs-typeorm-paginate";

export class NotificationService {
  constructor(
    @InjectRepository(Notification) private notificationRepository: Repository<Notification>,
    @InjectRepository(User) private userRepository: Repository<User>
  ) {}
  async create(createNotification: CreateNotificationRequestDto) {
    // get all users
    const users = await this.userRepository.find({ where: { role: 'operator', is_active: true } });
    const userIds = users.map(user => user.id);
    const notifications = userIds.map(userId => {
      const notification = this.notificationRepository.create();
      notification.message = createNotification.message;
      notification.user_id = userId;
      notification.type = createNotification.type;
      notification.metadata = createNotification.metadata;
      notification.is_read = false;
      notification.created_at = new Date();
      return notification;
    })
    return users;
  }
  async getAll(query: { page: number; limit: number }, user: any): Promise<{ data: any[]; pagination: { total_pages: number; page: number; limit: number } }>  {
    // Set default values and sanitize input
    const page = Number(query.page) > 0 ? Number(query.page) : 1;
    const limit = Number(query.limit) > 0 ? Number(query.limit) : 10;

    // Get notifications for user
    const [items, count] = await this.notificationRepository.findAndCount({
      where: { user_id: user.user_id },
      skip: (page - 1) * limit,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return {
      data: items,
      pagination: {
        total_pages: Math.ceil(count / limit),
        page,
        limit,
      }
    };
  }

  async markAsRead(id: string, user: any) {
    await this.notificationRepository.update(id, { is_read: true, user_id: user.user_id });
    return { id: id };
  }
}