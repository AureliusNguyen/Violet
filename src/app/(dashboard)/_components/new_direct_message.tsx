import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SidebarGroupAction } from "@/components/ui/sidebar";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function NewDirectMessage() {
  const [open, setOpen] = useState(false);
  const createDirectMessage = useMutation(api.function.dm.create);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const username = e.currentTarget.username.value;
      if (!username) {
        throw new Error("Username is required");
      }
      const id = await createDirectMessage({ username });
      router.push(`/dms/${id}`);
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create direct message", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <SidebarGroupAction>
          <PlusIcon />
          <span className="sr-only">New Direct Message</span>
        </SidebarGroupAction>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Direct Message</DialogTitle>
          <DialogDescription>
            Enter a username to start a new direct message.
          </DialogDescription>
        </DialogHeader>
        <form className="contents" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1">
            <Label htmlFor="username">Username</Label>
            <Input id="username" type="text" />
          </div>
          <DialogFooter>
            <Button>Start Direct Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
