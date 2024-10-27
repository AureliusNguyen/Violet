"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { AddFriend } from "./_components/add_friend";
import {
  AcceptedFriendsList,
  PendingFriendsList,
} from "./_components/friends_list";

export default function FriendsPage() {
  return (
    <div className="flex-1 flex-col flex divide-y">
      <header className="flex justify-between items-center p-4">
        <h1 className="font-semibold">Friends</h1>
        <AddFriend />
      </header>
      <div className="grid p-4 gap-4">
        <TooltipProvider delayDuration={0}>
          <PendingFriendsList />
          <AcceptedFriendsList />
        </TooltipProvider>
      </div>
    </div>
  );
}
