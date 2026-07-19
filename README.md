# JAOL-SYSTEM-SERVER

API REST desarrollada con NestJS para la gestión de usuarios, roles, empresas y módulos web.

## Tecnologías Utilizadas

- **NestJS** - Framework Node.js
- **TypeScript** - Superset de JavaScript
- **TypeORM** - ORM para Node.js
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación basada en tokens
- **Redis** - Almacenamiento en caché
- **bcrypt** - Encriptación de contraseñas

## Módulos Principales

1. **User** - Gestión de usuarios
2. **Role** - Gestión de roles y permisos
3. **Company** - Gestión de empresas
4. **Webmodules** - Gestión de módulos web

## Instalación

```bash
npm install
```

## Configuración

1. Crear un archivo `.env` basado en las variables de entorno necesarias
2. Configurar la conexión a PostgreSQL
3. Configurar Redis para caché
4. Configurar JWT_SECRET_KEY para autenticación

## Ejecución

```bash
# Desarrollo con watch
npm run start:dev

# Producción
npm run start:prod
```

## Puertos

- Backend: 3569
- Frontend: 3570

## Estructura del Proyecto

```
src/
├── guard/          # Guards de autenticación
├── library/        # Librerías compartidas (DB, JWT, Redis)
├── rest/           # Módulos REST (user, role, company, webmodules)
├── seed/           # Datos iniciales
├── utils/          # Utilidades y helpers
└── main.ts         # Punto de entrada
```
