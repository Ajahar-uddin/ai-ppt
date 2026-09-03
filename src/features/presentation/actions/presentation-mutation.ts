import { createServerFn } from "@tanstack/react-start";
import { createPresentationInputSchema, presentationIdInputSchema, updatePresentationInputSchema } from "../types/schema";
import { authFnMiddleware } from "#/middleware/auth";
import { PresentationController } from "../controller/presentation-controller";

const presentationControllerHandler = new PresentationController()

export const createPresentaion = createServerFn({ method: "POST" })
    .validator((data: unknown) => createPresentationInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context.session
        const userId = user.id

        const result = await presentationControllerHandler.createPresentationByUserId(data, userId)
        // TODO : ingest background job trigger 
        return result
    })

export const updatePresentaion = createServerFn({ method: "POST" })
    .validator((data: unknown) => updatePresentationInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context.session
        const userId = user.id
        const { id, ...patch } = data

        const existing = await presentationControllerHandler.getPresentationById(id)

        if (!existing) throw new Error("Presentation not found")

        const payload = {
            id: id,
            userId: userId,
            data: patch,
        }
        const result = await presentationControllerHandler.updatePresentationByUserId(payload)

        return result
    })


export const deletePresentation = createServerFn({ method: "POST" })
    .validator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context.session
        const userId = user.id


        const existing = await presentationControllerHandler.getPresentationById(data.id)

        if (!existing) throw new Error("Presentation not found")


        await presentationControllerHandler.deletePresentationById(data.id, userId)

        return {
            ok: true
        } as const
    })


export const regeneratePresentation = createServerFn({ method: "POST" })
    .validator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context.session
        const userId = user.id


        await presentationControllerHandler.regeneratePresentationById(data.id, userId)
        // TODO : ingest background job trigger 
        return {
            ok: true
        } as const
    })





