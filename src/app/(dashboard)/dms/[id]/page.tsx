"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "convex/react";
import { FunctionReturnType } from "convex/server";
import { MoreVerticalIcon, SendIcon, TrashIcon } from "lucide-react";
import { use, useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function MessagePage({
  params,
}: {
  params: Promise<{ id: Id<"directMessages"> }>;
}) {
  const { id } = use(params);
  const directMessage = useQuery(api.function.dm.get, {
    id,
  });
  const messages = useQuery(api.function.message.list, {
    directMessage: id,
  });
  if (!directMessage) {
    return null;
  }

  return (
    <div className="flex flex-col flex-1 divide-y max-h-screen">
      <header className="flex items-center gap-2 p-4">
        <Avatar className="size-8 border">
          <AvatarImage src={directMessage.user.image} />
          <AvatarFallback></AvatarFallback>
        </Avatar>
        <h1 className="font-semibold">{directMessage.user.username}</h1>
      </header>
      <ScrollArea className="h-full py-4">
        {messages?.map((message) => (
          <MessageItem key={message._id} message={message} />
        ))}
      </ScrollArea>
      <TypingIndicator directMessage={id} />
      <MessageInput directMessage={id} />
    </div>
  );
}

function TypingIndicator({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const usernames = useQuery(api.function.typing.list, {
    directMessage,
  });
  if (!usernames || usernames.length === 0) {
    return null;
  }
  return (
    <div className="text-sm text-muted-foreground px-4 py-2">
      {usernames.join(", ")} is typing...
    </div>
  );
}

type Message = FunctionReturnType<typeof api.function.message.list>[number];

function MessageItem({ message }: { message: Message }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Avatar className="size-8 border">
        {message.sender && <AvatarImage src={message.sender?.image} />}
        <AvatarFallback></AvatarFallback>
      </Avatar>
      <div className="flex flex-col mr-auto">
        <p className="text-xs text-muted-foreground">
          {message.sender?.username ?? "Deleted User"}
        </p>
        <p className="text-sm ">{message.content}</p>
      </div>
      <MessageActions message={message} />
    </div>
  );
}

function MessageActions({ message }: { message: Message }) {
  const user = useQuery(api.function.user.get);
  const deleteMessage = useMutation(api.function.message.deleteMessage);
  if (!user || message.sender?._id !== user._id) {
    return null;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVerticalIcon className="size-4 text-muted-foreground" />
        <span className="sr-only">Message Actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          className="text-destructive"
          onClick={() => deleteMessage({ id: message._id })}
        >
          <TrashIcon />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageInput({
  directMessage,
}: {
  directMessage: Id<"directMessages">;
}) {
  const [content, setContent] = useState("");
  const sendMessage = useMutation(api.function.message.create);
  const sendTypingIndicator = useMutation(api.function.typing.upsert);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendMessage({ directMessage, content });
      setContent("");
    } catch (error) {
      toast.error("Failed to send message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  return (
    <form className="flex items-center p-4 gap-2" onSubmit={handleSubmit}>
      <Input
        placeholder="Message"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          if (content.length > 0) {
            sendTypingIndicator({ directMessage });
          }
        }}
      />
      <Button size="icon">
        <SendIcon />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
