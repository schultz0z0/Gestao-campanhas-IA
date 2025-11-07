import { cn } from "@/lib/utils";
import { Sparkles, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface AIMessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

export function AIMessageBubble({
  role,
  content,
  isLoading,
  actionButton,
}: AIMessageBubbleProps) {
  const isUser = role === "user";

  if (isLoading) {
    return (
      <div className="flex gap-3">
        <div className="rounded-full bg-primary p-2">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <Card className="p-4 max-w-2xl">
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.2s]" />
            <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.4s]" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn("flex gap-3", isUser && "flex-row-reverse")}
      data-testid={`message-${role}`}
    >
      <div className={cn("rounded-full p-2", isUser ? "bg-muted" : "bg-primary")}>
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl p-4 max-w-2xl",
          isUser ? "bg-muted" : "bg-card border"
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {actionButton && !isUser && (
          <Button
            size="sm"
            className="mt-4"
            onClick={actionButton.onClick}
            data-testid="button-message-action"
          >
            {actionButton.label}
          </Button>
        )}
      </div>
    </div>
  );
}
