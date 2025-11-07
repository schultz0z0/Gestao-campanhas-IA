import { AIMessageBubble } from "../AIMessageBubble";

export default function AIMessageBubbleExample() {
  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl">
      <AIMessageBubble
        role="user"
        content="Gere uma análise SWOT para minha campanha de lançamento do curso de Marketing Digital."
      />
      <AIMessageBubble
        role="assistant"
        content="Claro! Vou gerar uma análise SWOT completa considerando o contexto da sua campanha. Analisando os dados do curso e do mercado..."
        actionButton={{
          label: "Salvar na Campanha",
          onClick: () => console.log("Save to campaign"),
        }}
      />
      <AIMessageBubble role="assistant" content="" isLoading />
    </div>
  );
}
