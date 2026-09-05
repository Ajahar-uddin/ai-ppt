import { prisma } from "#/lib/db"

export class SlideController {
    private prisma = prisma

    async createBulkSlidesByPresentationId(data: any) {
        try {
            const response = await this.prisma.slide.createMany({
                data
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async deleteSlidesByPresentationId(presentationId: string) {
        try {
            const response = await this.prisma.slide.deleteMany({
                where: { presentationId }
            })
            return response;
        } catch (error) {
            throw error
        }
    }
}