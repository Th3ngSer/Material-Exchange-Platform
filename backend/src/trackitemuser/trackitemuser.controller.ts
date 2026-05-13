import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { TrackitemuserService } from './trackitemuser.service';
import { CreateTrackItemUserDto } from './dto/create-trackitemuser.dto';
import { UpdateTrackStatusUserDto } from './dto/update-trackstatususer.dto';

@Controller('trackitemuser')
export class TrackitemuserController {
  constructor(private readonly service: TrackitemuserService) {}

  @Post()
  create(@Body() dto: CreateTrackItemUserDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOneByCustomId(Number(id));
  }

  @Patch(':id')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTrackStatusUserDto) {
    return this.service.updateByCustomId(Number(id), dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.removeByCustomId(Number(id));
  }
}
