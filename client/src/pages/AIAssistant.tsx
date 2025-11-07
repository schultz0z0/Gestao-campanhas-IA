import { useState } from "react";
import { AIMessageBubble } from "@/components/AIMessageBubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Sparkles, Target, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou seu assistente de IA para marketing. Como posso ajudar você hoje? Posso gerar análises SWOT, criar personas, sugerir ações de marketing e muito mais!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Entendido! Vou analisar sua solicitação e gerar uma resposta personalizada com base no contexto da sua campanha...",
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const quickActions = [
    { label: "Gerar Análise SWOT", icon: Target },
    { label: "Criar Personas", icon: Users },
    { label: "Sugerir Ações", icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold">Assistente IA</h1>
          <p className="text-muted-foreground mt-1">
            Converse com a IA para otimizar suas campanhas
          </p>
        </div>

        <Card className="flex-1 flex flex-col">
          <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((message) => (
              <AIMessageBubble
                key={message.id}
                role={message.role}
                content={message.content}
              />
            ))}
            {isLoading && <AIMessageBubble role="assistant" content="" isLoading />}
          </CardContent>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                placeholder="Digite sua mensagem..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none min-h-12"
                data-testid="input-ai-message"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-12 w-12"
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                className="w-full justify-start"
                onClick={() => setInput(action.label)}
                data-testid={`button-quick-action-${i}`}
              >
                <action.icon className="h-4 w-4 mr-2" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campanha Ativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">Campanha de Verão 2025</p>
              <Badge className="mt-2" variant="outline">
                Ativa
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Leads</span>
                <span className="font-medium">452</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ações</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">67%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dicas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Use comandos específicos para melhores resultados</li>
              <li>• Mencione detalhes da sua campanha</li>
              <li>• Peça para salvar as respostas na campanha</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
