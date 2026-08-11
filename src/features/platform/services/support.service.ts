import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import { recordAudit } from "@/server/audit/audit-log";
import { AppError } from "@/server/errors/app-error";
import type { CreateSupportTicketInput } from "@/features/platform/validators/support.schema";

function nextTicketNumber() { return `TKT-${new Date().getUTCFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`; }

export async function listSupportTickets() {
  return prisma.supportTicket.findMany({ orderBy: [{ status: "asc" }, { updatedAt: "desc" }], include: { tenant: { select: { id: true, name: true, slug: true } }, requester: { select: { id: true, name: true, email: true } }, assignee: { select: { id: true, name: true, email: true } }, messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, email: true } } } } } });
}

async function getTicket(id: string) {
  const ticket = await prisma.supportTicket.findUnique({ where: { id }, include: { tenant: { select: { id: true, name: true, slug: true } }, requester: { select: { id: true, name: true, email: true } }, assignee: { select: { id: true, name: true, email: true } }, messages: { orderBy: { createdAt: "asc" }, include: { author: { select: { id: true, name: true, email: true } } } } } });
  if (!ticket) throw new AppError("Destek talebi bulunamadı", 404, "SUPPORT_TICKET_NOT_FOUND");
  return ticket;
}

export async function createSupportTicket(input: CreateSupportTicketInput, actorId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: input.tenantId }, select: { id: true } });
  if (!tenant) throw new AppError("Tenant bulunamadı", 404, "TENANT_NOT_FOUND");
  const ticket = await prisma.supportTicket.create({ data: { ...input, ticketNumber: nextTicketNumber(), requesterId: actorId, messages: { create: { authorId: actorId, body: input.description } } } });
  await recordAudit({ tenantId: input.tenantId, actorId, action: "SUPPORT_TICKET_CREATE", entityType: "SupportTicket", entityId: ticket.id, metadata: { ticketNumber: ticket.ticketNumber, category: input.category, priority: input.priority } });
  return getTicket(ticket.id);
}

export async function updateSupportTicket(id: string, input: { status?: string; priority?: string; assigneeId?: string | null }, actorId: string) {
  await getTicket(id);
  const ticket = await prisma.supportTicket.update({ where: { id }, data: { ...input, closedAt: input.status === "CLOSED" ? new Date() : input.status ? null : undefined } });
  await recordAudit({ tenantId: ticket.tenantId, actorId, action: "SUPPORT_TICKET_UPDATE", entityType: "SupportTicket", entityId: id, metadata: input });
  return getTicket(id);
}

export async function addSupportMessage(id: string, body: string, isInternal: boolean, actorId: string) {
  const ticket = await getTicket(id);
  await prisma.supportMessage.create({ data: { ticketId: id, authorId: actorId, body, isInternal } });
  await prisma.supportTicket.update({ where: { id }, data: { lastReplyAt: new Date(), status: isInternal ? undefined : "WAITING_CUSTOMER" } });
  await recordAudit({ tenantId: ticket.tenantId, actorId, action: "SUPPORT_MESSAGE_CREATE", entityType: "SupportTicket", entityId: id, metadata: { isInternal } });
  return getTicket(id);
}
