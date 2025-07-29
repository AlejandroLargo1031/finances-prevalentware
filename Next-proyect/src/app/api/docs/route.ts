import { NextResponse } from 'next/server';

export async function GET() {
  const swaggerDocument = {
    openapi: "3.0.0",
    info: {
      title: "Finances API",
      description: "API para gestión de ingresos y egresos",
      version: "1.0.0",
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        description: "Servidor de desarrollo",
      },
    ],

    security: [{ bearerAuth: [] }],
    paths: {
      // LOGIN
      "/api/auth/login": {
        post: {
          summary: "Iniciar sesión",
          tags: ["Autenticación"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                  required: ["email", "password"],
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login exitoso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: { type: "string" },
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          email: { type: "string" },
                          name: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Credenciales inválidas" },
          },
        },
      },

      // REGISTRO
      "/api/auth/register": {
        post: {
          summary: "Registrar nuevo usuario",
          tags: ["Autenticación"],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                  required: ["name", "email", "password"],
                },
              },
            },
          },
          responses: {
            201: { description: "Usuario registrado" },
            409: { description: "Correo ya registrado" },
          },
        },
      },

      // VALIDAR SESIÓN
      "/api/auth/session": {
        get: {
          summary: "Validar sesión actual",
          tags: ["Autenticación"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Sesión activa",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      user: {
                        type: "object",
                        properties: {
                          id: { type: "string" },
                          name: { type: "string" },
                          email: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Token inválido o expirado" },
          },
        },
      },

      // MOVIMIENTOS
      "/api/movements": {
        get: {
          summary: "Obtener movimientos",
          tags: ["Movimientos"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de movimientos",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        amount: { type: "number" },
                        concept: { type: "string" },
                        date: { type: "string", format: "date-time" },
                        type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                        user: {
                          type: "object",
                          properties: {
                            name: { type: "string" },
                            email: { type: "string" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Token inválido o expirado" },
          },
        },
        post: {
          summary: "Crear movimiento",
          tags: ["Movimientos"],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    amount: { type: "number" },
                    concept: { type: "string" },
                    date: { type: "string", format: "date" },
                    type: { type: "string", enum: ["INCOME", "EXPENSE"] },
                  },
                  required: ["amount", "concept", "date", "type"],
                },
              },
            },
          },
          responses: {
            201: { description: "Movimiento creado" },
            401: { description: "Token inválido o expirado" },
            403: { description: "Acceso denegado - Solo ADMIN" },
          },
        },
      },

      // USUARIOS
      "/api/users": {
        get: {
          summary: "Obtener usuarios",
          tags: ["Usuarios"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Lista de usuarios",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string" },
                        role: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Token inválido o expirado" },
            403: { description: "Acceso denegado - Solo ADMIN" },
          },
        },
      },

      "/api/users/{id}": {
        put: {
          summary: "Actualizar usuario",
          tags: ["Usuarios"],
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    email: { type: "string" },
                    role: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Usuario actualizado" },
            401: { description: "Token inválido o expirado" },
            403: { description: "Acceso denegado - Solo ADMIN" },
          },
        },
      },

      // REPORTES
      "/api/reports": {
        get: {
          summary: "Obtener reportes financieros",
          description:
            "Retorna el balance actual, resumen mensual y todos los movimientos con detalles del usuario.",
          tags: ["Reportes"],
          responses: {
            200: {
              description: "Reporte financiero generado exitosamente",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      balance: {
                        type: "number",
                        description: "Balance total (ingresos - egresos)",
                        example: 1000.0,
                      },
                      income: {
                        type: "number",
                        description: "Total de ingresos",
                        example: 3000.0,
                      },
                      expense: {
                        type: "number",
                        description: "Total de egresos",
                        example: 2000.0,
                      },
                      totalMovements: {
                        type: "number",
                        description: "Cantidad total de movimientos",
                        example: 15,
                      },
                      chartData: {
                        type: "array",
                        description: "Resumen mensual para gráficos",
                        items: {
                          type: "object",
                          properties: {
                            month: {
                              type: "string",
                              description: "Nombre del mes",
                              example: "Julio",
                            },
                            income: {
                              type: "number",
                              description: "Total de ingresos en el mes",
                              example: 1000.0,
                            },
                            expense: {
                              type: "number",
                              description: "Total de egresos en el mes",
                              example: 800.0,
                            },
                          },
                        },
                      },
                      movements: {
                        type: "array",
                        description: "Lista de movimientos registrados",
                        items: {
                          type: "object",
                          properties: {
                            id: {
                              type: "string",
                              example: "clx1nq91x0002ud11j9z4c8qs",
                            },
                            date: {
                              type: "string",
                              format: "date-time",
                              example: "2025-07-27T15:30:00Z",
                            },
                            concept: {
                              type: "string",
                              example: "Pago de nómina",
                            },
                            amount: { type: "number", example: 500.0 },
                            type: {
                              type: "string",
                              enum: ["income", "expense"],
                              example: "income",
                            },
                            userId: {
                              type: "string",
                              example: "clx1nq91x0002ud11j9z4c8qs",
                            },
                            userName: {
                              type: "string",
                              example: "Alejandro Largo",
                            },
                            userEmail: {
                              type: "string",
                              format: "email",
                              example: "alejandro@example.com",
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: "No autorizado. Token inválido o no proporcionado.",
            },
            500: {
              description: "Error interno del servidor",
            },
          },
        },
      },

      "/api/export": {
        get: {
          summary: "Descargar reporte financiero en CSV",
          description:
            "Genera un archivo CSV que incluye información del usuario, resumen financiero (ingresos, egresos, balance) y detalle de movimientos (fecha, concepto, monto, tipo).",
          tags: ["Reportes"],
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Archivo CSV generado con éxito",
              content: {
                "text/csv": {
                  schema: {
                    type: "string",
                    format: "binary",
                    example: [
                      "REPORTE FINANCIERO",
                      `Generado el: 28/07/2025`,
                      "",
                      "INFORMACIÓN DEL USUARIO",
                      "Nombre,Email,Rol",
                      "Juan Pérez,juan@example.com,ADMIN",
                      "",
                      "RESUMEN FINANCIERO",
                      "Concepto,Monto",
                      "Ingresos totales,$5000.00",
                      "Egresos totales,$2000.00",
                      "Balance,$3000.00",
                      "",
                      "DETALLE DE MOVIMIENTOS",
                      "Fecha,Concepto,Monto,Tipo",
                      "27/07/2025,Salario,3000.00,INCOME",
                      "27/07/2025,Comida,50.00,EXPENSE",
                    ].join("\n"),
                  },
                },
              },
            },
            403: {
              description: "Acceso denegado - Solo ADMIN",
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  };

  return NextResponse.json(swaggerDocument);
}
