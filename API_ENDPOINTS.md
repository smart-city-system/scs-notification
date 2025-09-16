# WebSocket Notification System - API Endpoints

## WebSocket Connection
- **Primary URL**: `ws://localhost:4000/notifications`
- **Alternative URL**: `ws://localhost:4000/` (root path)
- **Protocol**: Native WebSocket (not Socket.IO)
- **Authentication**: Optional JWT token via query parameter `?token=your_jwt_token`

## REST API Endpoints

### WebSocket Management
- `GET /websocket/stats` - Get connection statistics
- `POST /websocket/test/broadcast` - Send test broadcast
- `POST /websocket/test/user/:userId` - Send test to specific user
- `POST /websocket/notify/user/:userId` - Send notification to user
- `POST /websocket/notify/room/:room` - Send notification to room
- `POST /websocket/notify/broadcast` - Broadcast notification

### Kafka → WebSocket Notifications
- `POST /notifications/send` - Send notification via Kafka (forwarded to WebSocket)
- `POST /notifications/broadcast` - Broadcast via Kafka
- `POST /notifications/user/:userId` - User notification via Kafka
- `POST /notifications/room/:room` - Room notification via Kafka

## Example Usage

### Connect to WebSocket (JavaScript)
```javascript
const socket = io('http://localhost:4000/notifications', {
  query: { token: 'your_jwt_token' } // optional
});

socket.on('notification', (data) => {
  console.log('Received notification:', data);
});
```

### Send Broadcast Notification
```bash
curl -X POST http://localhost:4000/notifications/broadcast \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Alert",
    "message": "Server maintenance in 10 minutes",
    "priority": "high",
    "category": "system"
  }'
```

### Send User Notification
```bash
curl -X POST http://localhost:4000/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "user_notification",
    "userId": "user123",
    "title": "New Message",
    "message": "You have a new message",
    "priority": "medium"
  }'
```

## WebSocket Events

### Client → Server
- `join_room` - Join a room
- `leave_room` - Leave a room

### Server → Client
- `connected` - Connection confirmation
- `notification` - Incoming notification
- `room_joined` - Room join confirmation
- `room_left` - Room leave confirmation
- `auth_error` - Authentication error
- `error` - General error

## Notification Structure
```json
{
  "type": "notification_type",
  "title": "Notification Title",
  "message": "Notification message",
  "priority": "low|medium|high|urgent",
  "category": "general|system|user|order|message",
  "data": { "additional": "data" },
  "timestamp": "2025-09-07T08:50:00.000Z"
}
```

## Test Client
Visit `http://localhost:4000/websocket-test.html` for an interactive test interface.
