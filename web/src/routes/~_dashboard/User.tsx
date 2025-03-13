import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@stanfordspezi/spezi-web-design-system/components/DropdownMenu";
import { getUserName } from "@stanfordspezi/spezi-web-design-system/modules/auth";
import { UserMenuItem } from "@stanfordspezi/spezi-web-design-system/molecules/DashboardLayout";
import { LogOut } from "lucide-react";
import { auth } from "@/modules/firebase/app";
import { useAuthenticatedUser } from "@/modules/user";

export const User = () => {
  const user = useAuthenticatedUser();
  if (!user) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserMenuItem img={user.photoURL} name={getUserName(user)} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onClick={async () => {
            await auth.signOut();
          }}
        >
          <LogOut />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
