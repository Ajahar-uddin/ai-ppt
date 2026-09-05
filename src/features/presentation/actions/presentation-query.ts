import { authFnMiddleware } from "#/middleware/auth";
import { createServerFn } from "@tanstack/react-start";
import { PresentationController } from "../controller/presentation-controller";
import { presentationIdInputSchema } from "../types/schema";

const presentationControllerHandler = new PresentationController()

export const getPresentationWithSlides = createServerFn({ method: "GET" })
    .validator((data: unknown) => presentationIdInputSchema.parse(data))
    .middleware([authFnMiddleware])
    .handler(async ({ data, context }) => {
        const { user } = context?.session
        const userId = user.id

        const existing = await presentationControllerHandler.getPresentationWithSlides(data.id, userId)

        if (!existing) throw new Error("Presentation not found")

        return existing
    })