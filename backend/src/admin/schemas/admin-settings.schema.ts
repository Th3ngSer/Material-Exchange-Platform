import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminSettingsDocument = AdminSettings & Document;

@Schema({ timestamps: true })
export class AdminSettings {
  @Prop({ default: 'Material Xchange' })
  siteName!: string;

  @Prop({ default: false })
  maintenanceMode!: boolean;

  @Prop({ default: true })
  allowNewRegistrations!: boolean;

  @Prop({ default: 50 })
  maxListingsPerUser!: number;

  @Prop({ default: 'USD' })
  defaultCurrency!: string;
}

export const AdminSettingsSchema = SchemaFactory.createForClass(AdminSettings);
