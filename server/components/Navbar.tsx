import { FC, useContext } from "react";
import { Title, Button, Text } from "@mantine/core";
import { IconHelp, IconLogout, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import SocialIcons from "./SocialIcons";
import { AppContext } from "./AppContext";

const Navbar: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { appState } = useContext(AppContext);
  const creditsAvailable = () => {
    if (appState?.credits?.total ?? 0 <= 0) {
      return 0;
    }
    return appState.credits.total - appState.credits.used;
  };
  return (
    <nav className="flex flex-row w-full">
      <div className="flex items-center">
        <Link className="no-underline text-black" href="/">
          <Title order={4}>Rebuff</Title>
        </Link>
      </div>
      <div className="flex-grow"></div>
      <div className="flex flex-row gap-4">
        <div className="">Credits: ${`${creditsAvailable()}`}</div>
        <Link className="text-black no-underline" href="/account">
          <div className="flex flex-row items-center">
            <IconHelp />
            <Text className="font-semibold text-sm">Docs</Text>
          </div>
        </Link>
        <Text
          className="text-black no-underline"
          onClick={async () => {
            const { error } = await supabase.auth.signOut();
            if (error) console.log("Error logging out:", error.message);
          }}
        >
          <div className="flex flex-row items-center">
            <IconLogout />
            <Text className="font-semibold text-sm">Logout</Text>
          </div>
        </Text>
      </div>
    </nav>
  );
};

export default Navbar;
