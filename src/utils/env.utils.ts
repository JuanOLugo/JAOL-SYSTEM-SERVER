import { config } from "dotenv";

config();

class EnvUtils {
  public  getEnv(key: string): string {
    const ambient = process.env.NODE_ENV ?? 'dev';
    const envKey = `${key}_${ambient.toUpperCase()}`;

    if (!key) {
      throw new Error('La clave del entorno es obligatoria.');
    }

    if (!ambient) {
      throw new Error('El entorno es obligatorio.');
    }

    if (!process.env[envKey]) {
      throw new Error(
        `No se encontró la variable de entorno ${envKey}`,
      );
    }
    return process.env[envKey]!;
  }
}

export default new EnvUtils();
