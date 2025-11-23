import { NextResponse } from 'next/server';
import { apiDocumentation } from '@/lib/api-docs';

/**
 * Serve OpenAPI documentation
 * Endpoint: GET /api/docs
 *
 * Can be used with:
 * - Swagger UI: https://swagger.io/tools/swagger-ui/
 * - ReDoc: https://redoc.ly/
 * - Postman: https://www.postman.com/
 */
export async function GET() {
  return NextResponse.json(apiDocumentation);
}
