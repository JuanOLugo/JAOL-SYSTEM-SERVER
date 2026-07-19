import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtLibService } from 'src/library/jwt-lib/jwt-lib.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtLibService: JwtLibService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'No se recibió el encabezado Authorization.',
      );
    }

    const parts = authorization.trim().split(' ');

    if (parts.length !== 2) {
      throw new UnauthorizedException(
        'El encabezado Authorization es inválido.',
      );
    }

    const [scheme, token] = parts;

    if (scheme !== 'Bearer') {
      throw new UnauthorizedException(
        'Esquema de autorización invalido.',
      );
    }

    if (!token.trim()) {
      throw new UnauthorizedException('No se recibió el token.');
    }

    if (token.length < 50) {
      throw new UnauthorizedException('El token es inválido.');
    }

    const payload = await this.jwtLibService.verify(token);

    if (!payload) {
      throw new UnauthorizedException('No fue posible validar el token.');
    }

    request.user = Object.freeze(payload);

    return true;
  }
}
