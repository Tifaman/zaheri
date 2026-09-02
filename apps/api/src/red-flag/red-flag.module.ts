import { Module } from '@nestjs/common';
import { RedFlagService } from './red-flag.service';

@Module({
  providers: [RedFlagService],
  exports: [RedFlagService],
})
export class RedFlagModule {}
