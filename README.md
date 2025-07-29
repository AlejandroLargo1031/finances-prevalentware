# finances-prevalentware
Sistema de Gestión de Ingresos y Egresos - Fullstack Esta es una aplicación web fullstack desarrollada como parte de una prueba técnica para el cargo de Desarrollador Fullstack en PrevalentWare. El sistema permite gestionar ingresos y egresos financieros, administrar usuarios, y generar reportes visuales y descargables.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


# 💰 Gestión de Ingresos y Egresos - PrevalentWare

Aplicación fullstack para la gestión de ingresos y egresos personales o empresariales, desarrollada como prueba técnica para **PrevalentWare**.

## 🧩 Funcionalidades

- 🔐 Autenticación segura con [BetterAuth](https://betterstack.dev/auth/)
- 📊 Creación y listado de ingresos y egresos
- 🧑‍💼 Soporte para múltiples roles (`ADMIN` y `USER`)
- 📈 Gráficos de movimientos
- 🧾 Exportación de reportes en CSV
- 📄 Documentación de API con Swagger
- ☁️ Despliegue en Vercel

---

## 🛠️ Tecnologías Utilizadas

### 🔹 Frontend

- **Next.js (App Router)**
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **shadcn/ui** (UI Components)
- **react-hook-form** (Manejo de formularios)
- **zod** (Validación de formularios)
- **recharts** (Visualización de datos)
- **js-file-download** (Exportación CSV)

### 🔹 Backend

- **Next.js API Routes (App Router)**
- **Prisma ORM**
- **PostgreSQL** (via Supabase)
- **BetterAuth** (para autenticación)
- **Swagger (OpenAPI)** para documentar endpoints
- **bcrypt** (hashing de contraseñas)

---

## 🧠 Arquitectura

📁 app/
│ ├── api/
│ │ └── movements/ → Endpoints para ingresos/egresos
│ └── dashboard/ → Vista principal autenticada
│
📁 components/ → Componentes de interfaz
📁 lib/ → Helpers (Prisma, auth, utils)
📁 schemas/ → Zod schemas para validación
📁 types/ → Tipos compartidos

---

## ⚙️ Instalación y ejecución local

```
# Clonar el repositorio
git clone https://github.com/tu-usuario/prevalentware-finanzas.git
cd prevalentware-finanzas

# Instalar dependencias
npm i --legacy-peer-deps

# Configurar variables de entorno
cp .env.example .env
Edita .env y agrega tus credenciales de Supabase y BetterAuth:

env

Editar
DATABASE_URL=postgresql://...
NEXT_PUBLIC_BETTERAUTH_URL=https://betterauth.dev/...
BETTERAUTH_SECRET=...



# Ejecutar en desarrollo
npm run dev
📄 Documentación de la API
La documentación de la API está disponible en:




/swagger
Generada automáticamente con Swagger y OpenAPI.

🧪 Testeo
Actualmente, el proyecto no incluye tests automatizados. Sin embargo, se pueden agregar usando:

jest o vitest para lógica backend y frontend

supertest para endpoints API

🛡️ Seguridad
Contraseñas encriptadas con bcrypt

Validación de roles (ADMIN vs USER)

Protección de rutas con BetterAuth

Validación de inputs con zod

🧾 Exportación CSV
Desde el panel de usuario puedes exportar todos los movimientos financieros a un archivo .csv para facilitar su análisis o almacenamiento.

📦 Despliegue
El proyecto está preparado para ser desplegado fácilmente en Vercel:




# Instalar la CLI de vercel
npm install -g vercel

# Desplegar
vercel
📍 Estado del proyecto
✅ MVP funcional completo:

Autenticación

CRUD de movimientos

Panel de usuario

Reportes

🛠️ Posibles mejoras futuras:

Filtros y búsquedas avanzadas

Categorías personalizadas

Dashboard por mes/año

Subida a S3 de archivos adjuntos

👤 Autor
Desarrollado por Alejandro Largo
Fullstack Developer - React | Node | Django | Next.js

