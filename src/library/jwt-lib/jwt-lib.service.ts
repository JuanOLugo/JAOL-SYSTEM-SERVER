import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import {
  JsonWebTokenError,
  NotBeforeError,
  TokenExpiredError,
} from 'jsonwebtoken';

@Injectable()
export class JwtLibService {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Firma un payload.
   */
  async sign<T extends object>(
    payload: T,
    options?: JwtSignOptions,
  ): Promise<string> {
    if (!payload) {
      throw new BadRequestException('El payload del JWT es obligatorio.');
    }

    if (typeof payload !== 'object') {
      throw new BadRequestException('El payload del JWT debe ser un objeto.');
    }

    return this.jwtService.signAsync(payload, options);
  }

  /**
   * Verifica un JWT.
   */
  async verify<T>(token: string, options?: JwtVerifyOptions): Promise<T> {
    if (!token) {
      throw new UnauthorizedException(
        'No se recibió ningún token de autenticación.',
      );
    }

    try {
      return (await this.jwtService.verifyAsync(token, options)) as T;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException(
          'La sesión ha expirado. Inicie sesión nuevamente.',
        );
      }

      if (error instanceof NotBeforeError) {
        throw new UnauthorizedException('El token aún no es válido.');
      }

      if (error instanceof JsonWebTokenError) {
        switch (error.message) {
          case 'jwt malformed':
            throw new UnauthorizedException(
              'El formato del token es inválido.',
            );

          case 'invalid signature':
            throw new UnauthorizedException('La firma del token es inválida.');

          case 'jwt signature is required':
            throw new UnauthorizedException(
              'El token no contiene una firma válida.',
            );

          case 'invalid token':
            throw new UnauthorizedException('El token es inválido.');

          default:
            throw new UnauthorizedException('No fue posible validar el token.');
        }
      }

      throw new UnauthorizedException('Error inesperado al validar el token.');
    }
  }

  /**
   * Decodifica un JWT sin verificar su firma.
   * Solo usar para lectura rápida, nunca para autenticación.
   */
  decode<T>(token: string): T {
    if (!token) {
      throw new BadRequestException('No se recibió ningún token.');
    }

    const payload = this.jwtService.decode(token);

    if (!payload) {
      throw new BadRequestException('No fue posible decodificar el token.');
    }

    return payload as T;
  }

  /**
   * Extrae el token de un header Authorization.
   */
  extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException(
        'No se recibió el encabezado Authorization.',
      );
    }

    const [type, token] = authorization.split(' ');

    if (type !== 'Bearer') {
      throw new UnauthorizedException(
        'El esquema de autenticación debe ser Bearer.',
      );
    }

    if (!token) {
      throw new UnauthorizedException('No se encontró el token Bearer.');
    }

    return token;
  }

  /**
   * Revoca un JWT.
   *
   * Un JWT no puede destruirse. Este método queda preparado
   * para implementar blacklist o revocación de refresh tokens.
   */
  async revoke(token: string): Promise<void> {
    if (!token) {
      throw new BadRequestException('Debe indicar el token a revocar.');
    }

    // TODO:
    // - Guardar en blacklist (Redis)
    // - Eliminar refresh token de BD
    // - Invalidar sesión
  }
}
