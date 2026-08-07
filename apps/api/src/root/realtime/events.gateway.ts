import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: '*', // In production, restrict to FRONTEND_URL
  },
})
export class EventsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(EventsGateway.name);

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token?.split(' ')[1] || client.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        client.disconnect();
        return;
      }
      
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      
      // Join a room specifically for this user's notifications
      client.join(`user_${payload.sub}`);
      
      this.logger.debug(`Client connected: ${client.id} (User: ${payload.sub})`);
    } catch (error) {
      this.logger.error('WebSocket Authentication failed', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  // Listen to internal events emitted by NotificationsService
  @OnEvent('notification.created')
  handleNotificationCreated(payload: { userId: string, organizationId: string, notification: any }) {
    this.logger.debug(`Broadcasting notification to user_${payload.userId}`);
    this.server.to(`user_${payload.userId}`).emit('notification.new', payload.notification);
  }
}
