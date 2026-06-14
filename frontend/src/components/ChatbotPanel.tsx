import { h } from "preact";
import { useState, useRef, useEffect } from "preact/hooks";
import { api } from "../services/api";
import type { AiExtractResponse, TransactionRequest } from "../types";

interface ChatbotPanelProps {
  onTransactionExtracted: (data: AiExtractResponse) => void;
}

export default function ChatbotPanel({
  onTransactionExtracted,
}: ChatbotPanelProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState<AiExtractResponse | null>(null);
  const [history, setHistory] = useState<
    Array<{ user: string; bot: AiExtractResponse }>
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [extracted, history]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    const currentMessage = message;
    setMessage("");
    setLoading(true);

    try {
      const response = await api
        .post("ai/extract", {
          json: { text: currentMessage },
        })
        .json<AiExtractResponse>();

      setExtracted(response);
      setHistory((prev) => [...prev, { user: currentMessage, bot: response }]);
      onTransactionExtracted(response);
    } catch (error) {
      console.error("Erro ao extrair dados:", error);
      const errorResponse: AiExtractResponse = {
        confidence: 0,
        missingFields: ["Erro ao processar a mensagem"],
      };
      setExtracted(errorResponse);
    } finally {
      setLoading(false);
    }
  };

  const useExtractedData = () => {
    if (!extracted) return;
    const now = new Date().toISOString().split("T")[0];
    const transactionData: TransactionRequest = {
      description: extracted.description || "Transação via chat",
      amount: extracted.amount || 0,
      transactionType: extracted.transactionType || "EXPENSE",
      transactionDate: extracted.transactionDate || now,
      categoryId: extracted.categoryId,
    };
    onTransactionExtracted({
      ...extracted,
      ...transactionData,
    } as AiExtractResponse);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "var(--color-success)";
    if (confidence >= 0.5) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <div class="chatbot-panel card">
      <h2 class="chatbot-title">💬 Adicionar por Chat</h2>
      <p class="chatbot-subtitle">
        Descreva sua transação em linguagem natural
      </p>

      <form onSubmit={handleSubmit} class="chatbot-form">
        <div class="input-group">
          <input
            type="text"
            value={message}
            onInput={(e) => setMessage((e.target as HTMLInputElement).value)}
            placeholder="Ex: Gastei R$ 50,00 com almoço ontem"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading || !message.trim()}>
            {loading ? "⏳" : "🚀"}
          </button>
        </div>
      </form>

      <div class="chat-history">
        {history.map((item, index) => (
          <div key={index} class="chat-message">
            <div class="user-message">{item.user}</div>
            <div class="bot-response">
              <div class="confidence-bar">
                <span>Confiança: </span>
                <div
                  class="confidence-fill"
                  style={{
                    width: `${Math.round(item.bot.confidence * 100)}%`,
                    backgroundColor: getConfidenceColor(item.bot.confidence),
                  }}
                />
                <span>{Math.round(item.bot.confidence * 100)}%</span>
              </div>
              {item.bot.missingFields.length > 0 && (
                <div class="warning">
                  ⚠️ Campos faltando: {item.bot.missingFields.join(", ")}
                </div>
              )}
              <button
                class="btn btn-primary btn-sm use-data-btn"
                onClick={useExtractedData}
                disabled={!extracted || extracted.confidence < 0.5}
              >
                ✅ Usar estes dados
              </button>
            </div>
          </div>
        ))}
        {extracted && history.length === 0 && (
          <div class="bot-response">
            <div class="confidence-bar">
              <span>Confiança: </span>
              <div
                class="confidence-fill"
                style={{
                  width: `${Math.round(extracted.confidence * 100)}%`,
                  backgroundColor: getConfidenceColor(extracted.confidence),
                }}
              />
              <span>{Math.round(extracted.confidence * 100)}%</span>
            </div>
            {extracted.missingFields.length > 0 && (
              <div class="warning">
                ⚠️ Campos faltando: {extracted.missingFields.join(", ")}
              </div>
            )}
            <button
              class="btn btn-primary btn-sm use-data-btn"
              onClick={useExtractedData}
              disabled={extracted.confidence < 0.5}
            >
              ✅ Usar estes dados
            </button>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <details class="chatbot-examples">
        <summary>💡 Exemplos do que você pode digitar</summary>
        <ul>
          <li>"Gastei 50 reais com comida ontem"</li>
          <li>"Recebi 2000 de salario hoje"</li>
          <li>"Paguei 150,00 de conta de luz em 15/01"</li>
          <li>"Comprei livro por 89,90 na amazon"</li>
          <li>"Depositei 500 na poupança anteontem"</li>
        </ul>
      </details>
    </div>
  );
}
