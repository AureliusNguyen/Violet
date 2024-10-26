import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckIcon, MessageCircleIcon, XIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";



export function PendingFriendsList() {
  const friends = useQuery(api.function.friend.listPending);
  const updateStatus = useMutation(api.function.friend.updateStatus);
  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-xs font-medium text-muted-foreground p-4 p-2.5">
        Pending Friends
      </h2>
      {friends?.length === 0 ? (
        <FriendListEmpty>You have no pending friend requests.</FriendListEmpty>
      ) : (
        friends?.map((friend, index) => (
          <FriendItem key={index} username={friend.user.username} image={friend.user.image}>
            <IconButton
              title="Accept"
              icon={<CheckIcon />}
              className="bg-green-100"
              onClick={() => updateStatus({ id: friend._id, status: "accepted" })}
            />
            <IconButton
              title="Reject"
              icon={<XIcon />}
              className="bg-red-100"
              onClick={() => updateStatus({ id: friend._id, status: "rejected" })}
            />
          </FriendItem>
        ))
      )}
    </div>
  );
}

export function AcceptedFriendsList() {
  const friends = useQuery(api.function.friend.listAccepted);
  const updateStatus = useMutation(api.function.friend.updateStatus);
  return (
    <div className="flex flex-col divide-y">
      <h2 className="text-xs font-medium text-muted-foreground p-4 p-2.5">
        Accepted Friends
      </h2>
      {friends?.length === 0 ? (
        <FriendListEmpty>You have no friends yet.</FriendListEmpty>
      ) : (
        friends?.map((friend, index) => (
          <FriendItem key={index} username={friend.user.username} image={friend.user.image}>
            <IconButton
              title="Start DM"
              icon={<MessageCircleIcon />}
              className="bg-blue-100"
              onClick={() => {}}
            />
            <IconButton
              title="Remove Friend"
              icon={<XIcon />}
              className="bg-red-100"
              onClick={() => updateStatus({ id: friend._id, status: "rejected" })}
            />
          </FriendItem>
        ))
      )}
    </div>
  );
}

function FriendListEmpty({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 text-center text-sm text-muted-foreground p-4">
      {children}
    </div>
  );
}

function IconButton({
  title,
  className,
  icon,
  onClick,
}: {
  title: string;
  className?: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button className={className} size="icon" variant="outline" onClick={onClick}>
          {icon}
          <span className="sr-only">{title}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

function FriendItem({
  username,
  image,
  children,
}: {
  username: string;
  image: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between p-2.5 gap-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar className="size-9 border">
          <AvatarImage src={image} />
          <AvatarFallback />
        </Avatar>
        <p className="text-sm font-medium">{username}</p>
      </div>
      <div className="flex items-center gap-1">{children}</div>
    </div>
  );
}
