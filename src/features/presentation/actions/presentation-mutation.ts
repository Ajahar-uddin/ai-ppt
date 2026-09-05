import { createServerFn } from "@tanstack/react-start";
import { createPresentationInputSchema, presentationIdInputSchema, updatePresentationInputSchema } from "../types/schema";
import { authFnMiddleware } from "#/middleware/auth";
import { PresentationController } from "../controller/presentation-controller";
import { inngest } from "#/integrations/inngest/client";

const presentationControllerHandler = new PresentationController()

export const createPresentaion = createServerFn({ method: "POST" })
    .validator((data: unknown) => createPresentationInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context.session
        const userId = user.id

        const presentation = await presentationControllerHandler.createPresentationByUserId(data, userId)
        // TODO : ingest background job trigger 

        await inngest.send({
            name: "presentation/generate",
            data: { presentationId: presentation.id }
        })
        return presentation
    })

export const updatePresentation = createServerFn({ method: "POST" })
    .validator((data: unknown) => updatePresentationInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data }) => {
        const { id, ...patch } = data

        const existing = await presentationControllerHandler.getPresentationById(id)

        const updateData = patch
        if (!existing) throw new Error("Presentation not found")
        const result = await presentationControllerHandler.updatePresentationById(id, updateData)

        return result
    })


export const deletePresentation = createServerFn({ method: "POST" })
    .validator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data }) => {


        const existing = await presentationControllerHandler.getPresentationById(data.id)

        if (!existing) throw new Error("Presentation not found")


        await presentationControllerHandler.deletePresentationById(data.id)

        return {
            ok: true
        } as const
    })


export const regeneratePresentation = createServerFn({ method: "POST" })
    .validator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data }) => {
        const existing = await presentationControllerHandler.getPresentationById(data.id)

        if (!existing) throw new Error("Presentation not found")

        await presentationControllerHandler.regeneratePresentationById(data.id)
        // TODO : ingest background job trigger 
        return {
            ok: true
        } as const
    })





