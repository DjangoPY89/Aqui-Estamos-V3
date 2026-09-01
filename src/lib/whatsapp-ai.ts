/**
 * AI Assistant Engine for WhatsApp (Chief of HR & Cleaning Operations)
 * Aquí Estamos Limpieza
 */

const SYSTEM_PROMPT = `
Eres la Jefa de Recursos Humanos y Operaciones de "Aquí Estamos Limpieza", una empresa líder de servicios de limpieza profesional en Paraguay con personal 100% asegurado en IPS.

TU ROL Y OBJETIVO:
1. Atender a colaboradoras del equipo de limpieza de forma empática, clara, respetuosa y profesional.
2. Resolver dudas operativas sobre protocolos de limpieza, químicos recomendados, uso de EPP (guantes, calzado antideslizante), cuidado de superficies delicadas (pisos flotantes, mármol, porcelanato, vidrios) y remoción de suciedad difícil (sarro de baños, grasa de cocina).
3. Orientar sobre horarios de servicio, cálculo de finalización de jornada (servicios de 4h, 6h u 8h) y confirmación de turnos.
4. Atender cordialmente a clientes si consultan sobre el estado de su reserva, reprogramaciones o cancelaciones.

REGLAS DE SEGURIDAD Y PRIVACIDAD ESTRICTAS (CONFIDENCIALIDAD ABSOLUTA):
- BAJO NINGUNA CIRCUNSTANCIA compartas con la empleada el número de teléfono del cliente, su apellido completo, documento de identidad o el monto/precio pagado por el servicio.
- Si una empleada pregunta por el teléfono o cobro del cliente, responde amablemente: "Por políticas de protección de datos de la empresa, la coordinación del cobro y contacto directo se maneja centralmente desde la administración. Ante cualquier inconveniente en la vivienda, comunícate con la central."

MANUAL DE PROCEDIMIENTOS Y CONOCIMIENTO OPERATIVO:
- Baños y Sarro: Uso de desincrustante o vinagre con bicarbonato, dejar actuar 10-15 minutos antes de frotar con esponja no abrasiva. En griferías, secar con paño de microfibra para evitar manchas de agua.
- Cocina y Grasa: Desengrasante multiuso, agua tibia en campanas y filtros. Nunca usar esponjas de alambre sobre acero inoxidable para no rayar.
- Pisos de Madera / Parquet / Flotante: Paño apenas húmedo (casi seco), nunca empapar con agua. Usar limpiadores neutros sin ceras agresivas.
- Vidrios: Limpiador con alcohol isopropílico o agua con unas gotas de detergente neutro y secado con haragán de goma o microfibra.
- Jornadas:
  * 4 horas: Ej. 08:00 a 12:00 hs o 13:00 a 17:00 hs.
  * 6 horas: Ej. 08:00 a 14:00 hs.
  * 8 horas: Ej. 08:00 a 16:00 hs.

Mantén tus respuestas breves, amigables, estructuradas con viñetas cuando sea útil y con tono cálido paraguayo profesional.
`;

export interface AIResponse {
  reply: string;
  source: "gemini" | "openai" | "rule_engine";
}

/**
 * Procesa un mensaje de WhatsApp entrante y genera una respuesta contextual como Jefe de RRHH.
 */
export async function processWhatsAppAIMessage(
  senderPhone: string,
  incomingMessage: string,
  context?: {
    isEmployee?: boolean;
    employeeName?: string;
    customerName?: string;
    bookingContext?: any;
  }
): Promise<AIResponse> {
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const userContextStr = context?.isEmployee
    ? `[CONTEXTO: Hablas con la colaboradora ${context.employeeName || "de cuadrilla"}]`
    : `[CONTEXTO: Hablas con un cliente ${context?.customerName ? `llamado ${context.customerName}` : ""}]`;

  const fullPrompt = `${userContextStr}\nMensaje recibido: "${incomingMessage}"`;

  // 1. Intento con Google Gemini API (1.5 Flash)
  if (geminiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) {
          return { reply: candidate.trim(), source: "gemini" };
        }
      }
    } catch (err) {
      console.error("[GEMINI API ERROR]", err);
    }
  }

  // 2. Intento con OpenAI API (GPT-4o-mini)
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const answer = data.choices?.[0]?.message?.content;
        if (answer) {
          return { reply: answer.trim(), source: "openai" };
        }
      }
    } catch (err) {
      console.error("[OPENAI API ERROR]", err);
    }
  }

  // 3. Fallback Inteligente Basado en Reglas y Base de Conocimiento
  return {
    reply: generateRuleBasedReply(incomingMessage, context),
    source: "rule_engine",
  };
}

/**
 * Generador de respuestas basado en reglas y palabras clave para contingencia sin APIs de IA.
 */
function generateRuleBasedReply(
  msg: string,
  context?: { isEmployee?: boolean; employeeName?: string; customerName?: string }
): string {
  const m = msg.toLowerCase();

  if (m.includes("sarro") || m.includes("inodoro") || m.includes("griferia")) {
    return "💡 *Protocolo para Sarro y Grifería:*\n" +
      "1. Aplica desincrustante o vinagre blanco tibio con bicarbonato.\n" +
      "2. Deja actuar de 10 a 15 minutos.\n" +
      "3. Frota suavemente con esponja no abrasiva.\n" +
      "4. Enjuaga y seca bien con microfibra para un acabado brillante y sin marcas de cal.";
  }

  if (m.includes("grasa") || m.includes("horno") || m.includes("campana") || m.includes("cocina")) {
    return "🍳 *Protocolo para Grasa en Cocina:*\n" +
      "1. Remoja los filtros de la campana en agua caliente con desengrasante.\n" +
      "2. Aplica desengrasante en superficies y deja reposar 5 minutos.\n" +
      "3. Limpia con paño húmedo y seca con microfibra.\n" +
      "⚠️ *Importante:* No uses esponjas metálicas sobre acero inoxidable para no rayarlo.";
  }

  if (m.includes("parquet") || m.includes("madera") || m.includes("piso flotante")) {
    return "🪵 *Cuidado de Pisos de Madera y Flotantes:*\n" +
      "1. Pasa primero la mopa seca para retirar polvo o pelos.\n" +
      "2. Usa mopa ligeramente humedecida (muy bien escurrida, casi seca).\n" +
      "3. Utiliza limpiador de pH neutro especial para madera.\n" +
      "⚠️ *Precaución:* Nunca derrames agua directamente en pisos de madera.";
  }

  if (m.includes("horario") || m.includes("hora termina") || m.includes("jornada")) {
    return "⏰ *Guía de Horarios de Servicio:*\n" +
      "• 4 Horas: Si inicias a las 08:00 AM, finalizas a las 12:00 hs (o de 13:00 a 17:00 hs).\n" +
      "• 6 Horas: Si inicias a las 08:00 AM, finalizas a las 14:00 hs.\n" +
      "• 8 Horas: Si inicias a las 08:00 AM, finalizas a las 16:00 hs (incluye 30 min de descanso).\n\n" +
      "Cualquier consulta sobre traslados o demoras, avísanos con anticipación.";
  }

  if (m.includes("cancelar") || m.includes("anular")) {
    return "Entendido. Si deseas cancelar una cita, nuestro sistema procesará la solicitud. Para cancelaciones de clientes, puedes responder con 'Confirmar Cancelación' o gestionarlo desde tu portal en https://aqui-estamos-v3.vercel.app/portal";
  }

  if (context?.isEmployee) {
    return `¡Hola ${context.employeeName || "compañera"}! 👋 Recibí tu mensaje. Desde Recursos Humanos y Operaciones estamos a tu disposición para cualquier duda sobre tus servicios, insumos o protocolos de limpieza. ¡Buen día y excelente labor! ✨`;
  }

  return "¡Hola! Gracias por comunicarte con *Aquí Estamos Limpieza*. 🧹✨ Estamos a tu disposición para ayudarte con tus reservas, consultas sobre nuestros servicios o dudas operativas. ¿En qué podemos ayudarte hoy?";
}
