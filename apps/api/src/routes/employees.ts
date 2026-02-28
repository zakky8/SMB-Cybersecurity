import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/db";
import { authMiddleware, getOrgIdFromRequest } from "../lib/auth";
import { sendEmail } from "../lib/email";

const createEmployeeSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
});

const inviteEmployeeSchema = z.object({
  emails: z.array(z.string().email()),
});

export default async function employeesRouter(fastify: FastifyInstance) {
  // Create employee
  fastify.post<{ Body: z.infer<typeof createEmployeeSchema> }>(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = createEmployeeSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const employee = await prisma.employee.create({
          data: {
            ...body,
            organizationId: orgId,
            status: "active",
          },
        });

        return reply.status(201).send(employee);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Get employees
  fastify.get(
    "/",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { status } = request.query as { status?: string };

        const where: any = { organizationId: orgId };
        if (status) where.status = status;

        const employees = await prisma.employee.findMany({
          where,
          include: {
            trainingProgress: true,
            simulationResults: true,
          },
        });

        return reply.send(employees);
      } catch (error) {
        throw error;
      }
    }
  );

  // Get employee by ID
  fastify.get<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const employee = await prisma.employee.findFirst({
          where: { id, organizationId: orgId },
          include: {
            trainingProgress: { include: { module: true } },
            simulationResults: { include: { simulation: true } },
            breachRecords: true,
          },
        });

        if (!employee) {
          return reply.status(404).send({ error: "Employee not found" });
        }

        return reply.send(employee);
      } catch (error) {
        throw error;
      }
    }
  );

  // Invite employees
  fastify.post<{ Body: z.infer<typeof inviteEmployeeSchema> }>(
    "/invite",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const body = inviteEmployeeSchema.parse(request.body);
        const orgId = getOrgIdFromRequest(request);

        const org = await prisma.organization.findUnique({
          where: { id: orgId },
        });

        if (!org) {
          return reply.status(404).send({ error: "Organization not found" });
        }

        const invitations = await Promise.all(
          body.emails.map(async (email) => {
            const token = uuidv4();
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            const employee = await prisma.employee.upsert({
              where: { organizationId_email: { organizationId: orgId, email } },
              update: {
                invitationToken: token,
                invitationExpiresAt: expiresAt,
                status: "invited",
              },
              create: {
                organizationId: orgId,
                email,
                firstName: email.split("@")[0],
                lastName: "",
                status: "invited",
                invitationToken: token,
                invitationExpiresAt: expiresAt,
              },
            });

            // Send invitation email
            const inviteLink = `${process.env.FRONTEND_URL}/invite/${token}`;
            await sendEmail(email, "employeeInvite", {
              firstName: employee.firstName,
              organizationName: org.name,
              inviteLink,
            }).catch((err) => console.error("Failed to send invite email:", err));

            return employee;
          })
        );

        return reply.status(201).send(invitations);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({ error: error.errors });
        }
        throw error;
      }
    }
  );

  // Offboard employee
  fastify.post<{ Params: { id: string } }>(
    "/:id/offboard",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        const employee = await prisma.employee.update({
          where: { id },
          data: {
            status: "offboarded",
          },
        });

        // Send offboarding notification
        await sendEmail(
          "admin@example.com",
          "offboarding",
          {
            employeeName: `${employee.firstName} ${employee.lastName}`,
          }
        ).catch((err) => console.error("Failed to send offboard email:", err));

        return reply.send(employee);
      } catch (error) {
        throw error;
      }
    }
  );

  // Delete employee
  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    { onRequest: authMiddleware },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const orgId = getOrgIdFromRequest(request);
        const { id } = request.params as { id: string };

        await prisma.employee.delete({
          where: { id },
        });

        return reply.status(204).send();
      } catch (error) {
        throw error;
      }
    }
  );
}
