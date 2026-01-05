const ZAI_API_BASE = 'https://api.z.ai/api/paas/v4';
const GLM_MODEL = 'glm-4.7';

export async function generateSummary(
  content: string,
  language: 'en' | 'ar' = 'ar'
): Promise<ReadableStream> {
  const response = await fetch(`${ZAI_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.ZAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: GLM_MODEL,
      messages: [
        {
          role: 'system',
          content: language === 'ar'
            ? 'أنت مساعد ذكاء اصطناعي متخصص في تلخيص الأبحاث العلمية. قم بتلخيص البحث المقدم في نقاط واضحة وموجزة باللغة العربية.'
            : 'You are an AI assistant specialized in summarizing research papers. Summarize the provided paper in clear, concise bullet points.'
        },
        {
          role: 'user',
          content: `Please summarize this research paper:\n\n${content.slice(0, 15000)}`
        }
      ],
      thinking: {
        type: 'enabled'
      },
      stream: true,
      max_tokens: 4096,
      temperature: 1.0,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Z.AI API error: ${response.status} - ${errorText}`);
  }

  return response.body!;
}
