import { Injectable, Logger } from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AppService {
  root(req: Request) {
    const startTime = Date.now();

    const clientInfo = {
      ip: this.getClientIp(req),
      userAgent: req.headers['user-agent'] || 'Desconocido',
      method: req.method,
      url: req.originalUrl,
    };

    const responseTime = Date.now() - startTime;

    const result = {
      client: clientInfo,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
      year: new Date().getFullYear(),
    };

    Logger.log(
      `📍 Cliente IP: ${clientInfo.ip} | ⏱️ ${responseTime}ms | UA: ${clientInfo.userAgent}`,
      'ROOT',
    );

    return result;
  }

  private getClientIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (req.headers['x-real-ip'] as string) ||
      req.ip ||
      req.socket.remoteAddress ||
      'IP desconocida'
    );
  }
}
