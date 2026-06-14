import { h } from "preact";
import { useState } from "preact/hooks";
import { useAuth } from "../hooks/useAuth";
import TransactionList from "../components/TransactionList";
import ChatbotPanel from "../components/ChatbotPanel";
import type { AiExtractResponse } from "../types";

export default function TransactionPage() {
  const { user } = useAuth();
  const [showChatbot, setShowChatbot] = useState(false);

  const handleTransactionExtracted = (data: AiExtractResponse) => {
    console.log("Transaction extracted:", data);
    setShowChatbot(false);
    // The TransactionList will handle the actual creation via its hook
  };

  return (
    <div class="transaction-page">
      <div class="page-header">
        <div>
          <h1>Transações</h1>
          <p>Gerencie suas receitas e despesas</p>
        </div>
        <div class="page-actions">
          <button
            class="btn btn-secondary"
            onClick={() => setShowChatbot(true)}
          >
            💬 Por Chat
          </button>
        </div>
      </div>

      <TransactionList />

      {showChatbot && (
        <div class="modal-overlay" onClick={() => setShowChatbot(false)}>
          <div
            class="modal-content chatbot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div class="modal-header">
              <h2>💬 Adicionar por Chat</h2>
              <button
                class="btn btn-ghost"
                onClick={() => setShowChatbot(false)}
              >
                ✕
              </button>
            </div>
            <ChatbotPanel onTransactionExtracted={handleTransactionExtracted} />
          </div>
        </div>
      )}
    </div>
  );
}
