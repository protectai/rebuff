import { FC, useContext, useState } from "react";
import { Title, Text } from "@mantine/core";
import { IconHelp, IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AppContext } from "./AppContext";
import ApikeyDisplay from "./ApikeyDisplay";

const Navbar: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { appState, refreshApikey, setLoading } = useContext(AppContext);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const creditsAvailable = () => {
    if (appState?.credits?.total ?? 0 <= 0) {
      return 0;
    }
    return appState.credits.total - appState.credits.used;
  };
  return (
    <nav className="flex w-full flex-col md:flex-row">
      <div className="flex w-full justify-between md:justify-center md:w-fit">
        <Link className="no-underline text-black" href="/">
          <Title order={4}>Rebuff</Title>
          <Text fz="sm" c="dimmed">
            Prompt injection detection API for LLM apps
          </Text>
        </Link>
        <button
          onClick={() => setMobileMenuOpened(!mobileMenuOpened)}
          className="inline-flex md:hidden text-black text-sm text-center items-center bg-transparent border-none cursor-pointer"
        >
          {mobileMenuOpened ? <IconX /> : <IconMenu2 />}
        </button>
      </div>
      <div
        className={`${
          mobileMenuOpened ? "flex" : "hidden"
        } bg-gray-100 p-2 shadow-md justify-between items-center flex-grow flex-row gap-4 md:flex md:shadow-none md:p-0 md:bg-transparent md:gap-0`}
      >
        <div className="flex items-center justify-start md:justify-center gap-2 flex-grow">
          {session && (
            <>
              <ApikeyDisplay
                apiKey={appState?.apikey ?? ""}
                onRefresh={refreshApikey}
              />
              <Text className="font-semibold text-sm">
                Credits: ${`${creditsAvailable()}`}
              </Text>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Link className="text-black no-underline" href="/account">
            <div className="flex flex-row items-center">
              <IconHelp />
              <Text className="font-semibold text-sm">Docs</Text>
            </div>
          </Link>
          {session && (
            <Text
              className="text-black no-underline"
              onClick={async () => {
                setLoading(false);
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) console.log("Error logging out:", error.message);
                } catch (err) {
                  console.log("Error logging out:", err);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <div className="flex flex-row items-center cursor-pointer">
                <IconLogout />
                <Text className="font-semibold text-sm">Logout</Text>
              </div>
            </Text>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
