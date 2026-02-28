import { FastifyRequest, FastifyReply } from "fastify";
import { verifyToken } from "@clerk/backend";

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    orgId?: string;
  };
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({
        error: "Unauthorized",
        code: "NO_AUTH_HEADER",
      });
    }

    const token = authHeader.replace("Bearer ", "");

    // Verify JWT token from Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY || "",
    });

    if (!payload) {
      return reply.status(401).send({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      });
    }

    // Clerk payload custom claims are typed as unknown — cast safely
    (request as AuthenticatedRequest).user = {
      id: payload.sub || "",
      email: String(payload["email"] ?? ""),
      firstName: payload["first_name"] ? String(payload["first_name"]) : undefined,
      lastName: payload["last_name"] ? String(payload["last_name"]) : undefined,
      orgId: payload["org_id"] ? String(payload["org_id"]) : undefined,
    };
  } catch (error) {
    console.error("Auth error:", error);
    return reply.status(401).send({
      error: "Unauthorized",
      code: "AUTH_ERROR",
    });
  }
}

export function getOrgIdFromRequest(request: FastifyRequest): string {
  const auth = request as AuthenticatedRequest;
  const query = request.query as Record<string, string | undefined>;
  const orgId = auth.user?.orgId || query?.["orgId"] || "";

  if (!orgId) {
    throw new Error("Organization ID not found");
  }

  return orgId;
}

export function getAuthUser(request: FastifyRequest) {
  const auth = request as AuthenticatedRequest;
  if (!auth.user) {
    throw new Error("User not authenticated");
  }
  return auth.user;
}

export default { authMiddleware, getOrgIdFromRequest, getAuthUser };
