import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Get('db-status')
  getDbStatus() {
    return {
      status:
        this.connection.readyState === ConnectionStates.connected
          ? 'connected'
          : 'disconnected',
      readyState: this.connection.readyState,
    };
  }
}
