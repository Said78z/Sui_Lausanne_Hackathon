import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const yousignWebhookSchema = z.object({
    event_name: z.string(),
    data: z.object({
        signature_request: z.object({
            id: z.string(),
            status: z.string(),
            name: z.string(),
            signers: z.array(
                z.object({
                    id: z.string(),
                    answers: z.array(
                        z.object({
                            id: z.string().optional(),
                            question: z.object({
                                title: z.string(),
                            }).optional(),
                            answer: z.string().optional(),
                        })
                    ).optional(),
                })
            ),
        }),
    }),
});

// Type inféré
export type YousignWebhookSchema = z.infer<typeof yousignWebhookSchema>;

export const YousignWebhookDto = yousignWebhookSchema;
export type YousignWebhookDto = Serialize<YousignWebhookSchema>;
