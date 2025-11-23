/**
 * OpenAPI/Swagger schema definitions for API documentation
 * Can be served at /api/docs endpoint with swagger-ui or similar
 */

export const apiDocumentation = {
  openapi: '3.0.0',
  info: {
    title: 'Church Volunteer Connect API',
    description:
      'API for managing volunteer opportunities and applications in church ministries',
    version: '1.0.0',
    contact: {
      name: 'Church Volunteer Connect',
    },
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'User signup',
        description: 'Register a new user account',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  name: { type: 'string' },
                  role: {
                    type: 'string',
                    enum: ['VOLUNTEER', 'MINISTRY_LEADER'],
                    default: 'VOLUNTEER',
                  },
                },
                required: ['email', 'password', 'name'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string' },
                      },
                    },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
          400: {
            description: 'Validation error or user already exists',
          },
          429: {
            description: 'Too many signup attempts',
          },
        },
      },
    },
    '/api/opportunities': {
      get: {
        summary: 'Get all active opportunities',
        description: 'Retrieve a list of all active volunteer opportunities',
        tags: ['Opportunities'],
        responses: {
          200: {
            description: 'List of opportunities',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          id: { type: 'string' },
                          title: { type: 'string' },
                          description: { type: 'string' },
                          ministry: { type: 'string' },
                          location: { type: 'string' },
                          timeCommitment: { type: 'string' },
                          status: {
                            type: 'string',
                            enum: ['ACTIVE', 'INACTIVE'],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new opportunity',
        description:
          'Create a new volunteer opportunity (ministry leaders only)',
        tags: ['Opportunities'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  ministry: { type: 'string' },
                  location: { type: 'string' },
                  requirements: { type: 'array', items: { type: 'string' } },
                  timeCommitment: { type: 'string' },
                  startDate: { type: 'string', format: 'date-time' },
                  endDate: { type: 'string', format: 'date-time' },
                },
                required: [
                  'title',
                  'description',
                  'ministry',
                  'location',
                  'timeCommitment',
                ],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Opportunity created successfully',
          },
          400: {
            description: 'Validation error',
          },
          401: {
            description: 'Unauthorized',
          },
          429: {
            description: 'Too many opportunities created',
          },
        },
      },
    },
    '/api/applications': {
      get: {
        summary: 'Get applications',
        description: 'Get applications (as volunteer or ministry leader)',
        tags: ['Applications'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of applications',
          },
          401: {
            description: 'Unauthorized',
          },
        },
      },
      post: {
        summary: 'Apply for an opportunity',
        description: 'Submit an application for a volunteer opportunity',
        tags: ['Applications'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  opportunityId: { type: 'string' },
                  message: { type: 'string', maxLength: 1000 },
                },
                required: ['opportunityId'],
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Application submitted successfully',
          },
          400: {
            description: 'Validation error or duplicate application',
          },
          401: {
            description: 'Unauthorized',
          },
          429: {
            description: 'Too many applications submitted',
          },
        },
      },
    },
    '/api/health': {
      get: {
        summary: 'Health check',
        description: 'Check if the application and database are healthy',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Application is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', enum: ['ok', 'error'] },
                    timestamp: { type: 'string', format: 'date-time' },
                    database: { type: 'string' },
                    version: { type: 'string' },
                  },
                },
              },
            },
          },
          503: {
            description: 'Application is unhealthy',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token for authentication',
      },
    },
  },
};
