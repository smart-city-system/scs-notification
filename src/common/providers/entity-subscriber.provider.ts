// audit.subscriber.ts
// biome-ignore lint/style/useImportType: <explanation>
import {
  EventSubscriber,
  EntitySubscriberInterface,
  UpdateEvent,
  DataSource,
} from "typeorm";
import { AsyncLocalStorage } from "async_hooks";
import { Base } from "@/entity/base.entity";
interface Context {
  userId: string;
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RequestContext {
  private static readonly storage = new AsyncLocalStorage<Context>();

  static run(context: Context, callback: () => void) {
    this.storage.run(context, callback);
  }

  static getUserId(): string | undefined {
    const store = this.storage.getStore();
    return store?.userId;
  }
}

@EventSubscriber()
export class AuditSubscriber implements EntitySubscriberInterface {
  constructor(dataSource: DataSource) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Base;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  beforeUpdate(event: UpdateEvent<any>) {
    const entity = event.entity;
    const dbEntity = event.databaseEntity;

    if (entity instanceof Base && dbEntity instanceof Base) {
      const userId = RequestContext.getUserId();
      const isSoftDelete = !!entity.deleted_at && !dbEntity.deleted_at;

      if (isSoftDelete && userId) {
        entity.deleted_by = userId;
      } else if (userId) {
        entity.updated_by = userId;
      }
    }
  }
}
