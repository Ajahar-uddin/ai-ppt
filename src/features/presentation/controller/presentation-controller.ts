
import { PresentationStatus } from "#/generated/prisma/enums";
import { prisma } from "#/lib/db"
import { generateSlug } from "random-word-slugs";

export class PresentationController {
    private prisma = prisma

    async createPresentationByUserId(data: any, userId: string) {
        try {
            const response = await this.prisma.presentation.create({
                data: {
                    userId,
                    title: generateSlug(4, { format: "title" }),
                    status: PresentationStatus.GENERATING,
                    ...data
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async updatePresentationById(id: string, data: any) {
        try {
            const response = await this.prisma.presentation.update({
                where: {
                    id,
                },
                data: {
                    ...data
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async getPresentationById(id: string) {
        try {
            const response = await this.prisma.presentation.findUnique({
                where: {
                    id,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async deletePresentationById(id: string) {
        try {
            const response = await this.prisma.presentation.delete({
                where: {
                    id,
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async regeneratePresentationById(id: string) {
        try {
            const response = await this.prisma.presentation.update({
                where: {
                    id
                },
                data: {
                    status: PresentationStatus.GENERATING
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async getPresentationWithSlides(id: string, userId: string) {
        try {
            const response = await this.prisma.presentation.findUnique({
                where: {
                    id,
                    userId
                }, include: {
                    slides: {
                        orderBy: {
                            order: "asc"
                        }
                    }
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }

    async getPresentationsList(userId: string) {
        try {
            const response = await this.prisma.presentation.findMany({
                where: {
                    userId
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })
            return response;
        } catch (error) {
            throw error
        }
    }
}