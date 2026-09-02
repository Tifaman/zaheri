import { Injectable } from '@nestjs/common';
import { BodyRegionCode } from '@zaheri/types';
import { evaluateRedFlag } from './red-flag.engine';

/** Thin injectable wrapper around the pure evaluateRedFlag matcher. */
@Injectable()
export class RedFlagService {
  evaluate(complaint: string, bodyRegion: BodyRegionCode): boolean {
    return evaluateRedFlag(complaint, bodyRegion);
  }
}
