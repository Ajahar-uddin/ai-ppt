import { google } from "@ai-sdk/google";
import { Output, generateText } from 'ai';
import { z } from "zod";

import { PresentationController } from "#/features/presentation/controller/presentation-controller";
import { SlideController } from "#/features/presentation/controller/slide-controller";
import { PresentationStatus } from "#/generated/prisma/enums";
import { inngest } from "../client";


function buildImageKitUrl(prompt: string, filename: string): string {
    const baseUrl = process.env.IMAGEKIT_BASE_URL!
    const sanitizedPrompt = prompt
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 100)

    return `${baseUrl}/ik-genimg-prompt-${encodeURIComponent(sanitizedPrompt)}/${filename}.jpg?tr=w-1280,h-720`
}


const slideSchema = z.object({
    title: z.string().describe('Slide title'),
    content: z.string().describe('Main content / bullet points for the slide'),
    notes: z.string().optional().describe('Speaker notes'),
    imagePrompt: z
        .string()
        .describe(
            'A concise prompt to generate an illustration for this slide (professional, clean style, no text in image)',
        ),
})

const slidesResponseSchema = z.object({
    slides: z.array(slideSchema),
})


export const generatePresentation = inngest.createFunction(
    {
        id: "generate-presentation",
        retries: 2,
        triggers: [{
            event: "presentation/generate",
        }],
    },
    async ({ event, step }) => {
        const { presentationId } = event.data as { presentationId: string }

        if (!presentationId) throw new Error("Presentation ID is required")

        const presentationControllerHandler = new PresentationController()
        const slideControllerHandler = new SlideController()

        // Step 1: Fetch presentation
        const presentation = await step.run("fetch-presentation", async () => {
            const response = await presentationControllerHandler.getPresentationById(presentationId)
            if (!response) throw new Error("Presentation not found")
            return response;
        })
        // Step 2: Update presentation status to generating
        await step.run("mark-generating", async () => {
            await presentationControllerHandler.updatePresentationById(
                presentation.id,
                {
                    status: PresentationStatus.GENERATING
                }
            )
        })
        // Step 3: Generate slides using AI model
        const { slides } = await step.run("generate-slides-content", async () => {
            const systemPrompt = `You are an expert presentation designer. Given a user's content/prompt, create a compelling presentation.

Style: ${presentation.style}
Tone: ${presentation.tone}
Layout preference: ${presentation.layout}
Number of slides requested: ${presentation.slideCount}

Guidelines:
- Create exactly ${presentation.slideCount} slides
- First slide should be a title slide
- Last slide should be a summary or call-to-action
- Keep content concise and impactful
- For imagePrompt, describe a professional illustration that complements the slide (no text in images)
`
            const result = await generateText({
                model: google('gemini-2.5-flash'),
                system: systemPrompt,
                prompt: presentation.prompt,
                output: Output.object({ schema: slidesResponseSchema }),
            })
            return result.output;
        })
        // Step 4: Delete Old Slides if any
        await step.run("delete-old-slides", async () => {
            await slideControllerHandler.deleteSlidesByPresentationId(presentation.id)
        })
        // step 5: Create New Slides image using ImageKit
        await step.run("create-new-slides", async () => {
            const data = slides.map((s, i) => ({
                presentationId,
                order: i,
                title: s.title,
                content: s.content,
                notes: s.notes ?? null,
                imagePrompt: s.imagePrompt,
                imageUrl: buildImageKitUrl(s.imagePrompt, `slide-${presentationId}-${i}`),
            }))
            // TODO : Fix the error
            await slideControllerHandler.createBulkSlidesByPresentationId(data)

        })
        // Step 6: Update presentation status to completed
        await step.run("mark-completed", async () => {
            await presentationControllerHandler.updatePresentationById(
                presentation.id,
                {
                    status: PresentationStatus.COMPLETED
                }
            )
        })

        return { success: true, slideCount: slides.length }
    },
)