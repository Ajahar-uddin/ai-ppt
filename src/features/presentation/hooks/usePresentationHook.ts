import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { presentationQueryKeys } from "./query-keys"
import { getPresentationList, getPresentationWithSlides } from "../actions/presentation-query"
import { PresentationStatus } from "#/generated/prisma/enums"
import { useEffect, useState } from "react"
import { deletePresentation, regeneratePresentation, updatePresentation } from "../actions/presentation-mutation"
import type { SlideLayout, SlideStyle, SlideTone } from "../constants/presentation-options"
import { toast } from "#/components/ui/toast"
import { useNavigate } from "@tanstack/react-router"


type SettingsForm = {
    title: string
    prompt: string
    slideCount: number
    style: SlideStyle
    tone: SlideTone
    layout: SlideLayout
}


export function usePresentationHook(
    presentationId: string,
    opts?: {
        onDelete?: () => void
    }
) {
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: presentationQueryKeys.detail(presentationId),
        queryFn: () => getPresentationWithSlides({ data: { id: presentationId } }),
        refetchInterval: (q) => q.state.data?.status === PresentationStatus.GENERATING ? 3000 : false,
    })

    const [form, setForm] = useState<SettingsForm>({
        title: '',
        prompt: '',
        slideCount: 8,
        style: 'minimal',
        tone: 'formal',
        layout: 'balanced',
    })

    useEffect(() => {
        if (!query.data) return
        setForm({
            title: query.data.title,
            prompt: query.data.prompt,
            slideCount: query.data.slideCount,
            style: query.data.style as SlideStyle,
            tone: query.data.tone as SlideTone,
            layout: query.data.layout as SlideLayout,
        })
    }, [query.data])

    const updateMut = useMutation({
        mutationFn: () =>
            updatePresentation({
                data: {
                    id: presentationId,
                    title: form.title,
                    prompt: form.prompt,
                    slideCount: form.slideCount,
                    style: form.style,
                    tone: form.tone,
                    layout: form.layout,
                },
            }),
        onSuccess: () => {
            toast.add({
                type: 'success',
                title: 'Presentation updated successfully',
            })
            queryClient.invalidateQueries({
                queryKey: presentationQueryKeys.list(),
            })
            queryClient.invalidateQueries({
                queryKey: presentationQueryKeys.detail(presentationId),
            })
        },
        onError: (error) => {
            toast.add({
                type: 'error',
                title: 'Failed to update presentation',
                description: error.message,
            })
        },
    })
    const deleteMut = useMutation({
        mutationFn: () =>
            deletePresentation({
                data: {
                    id: presentationId,
                },
            }),
        onSuccess: () => {
            toast.add({
                type: 'success',
                title: 'Presentation deleted successfully',
            })
            queryClient.invalidateQueries({ queryKey: presentationQueryKeys.list() })
            queryClient.removeQueries({
                queryKey: presentationQueryKeys.detail(presentationId),
            })
            navigate({
                to: '/',
            })
        },
        onError: (error) => {
            toast.add({
                type: 'error',
                title: 'Failed to delete presentation',
                description: error.message,
            })
        },
    })
    const regenerateMut = useMutation({
        mutationFn: () =>
            regeneratePresentation({
                data: {
                    id: presentationId,
                },
            }),
        onSuccess: () => {
            toast.add({
                type: 'success',
                title: 'Regenerating presentation…',
            })
            queryClient.invalidateQueries({
                queryKey: presentationQueryKeys.detail(presentationId),
            })
        },
        onError: (error) => {
            toast.add({
                type: 'error',
                title: 'Failed to regenerate presentation',
                description: error.message,
            })
        },
    })

    const slides = query.data?.slides ?? []
    const isGenerating = query.data?.status === PresentationStatus.GENERATING

    return {
        query,
        slides,
        isGenerating,
        form,
        setForm,
        updateMut,
        regenerateMut,
        deleteMut,
    }

}

export function usePresentationListHook() {

    const { data, isPending } = useQuery({
        queryKey: presentationQueryKeys.list(),
        queryFn: () => getPresentationList(),
    })

    return {
        data,
        isPending
    }
}