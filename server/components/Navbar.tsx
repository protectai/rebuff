import { FC, useContext, useState } from "react";
import { Loader, Text, Title } from "@mantine/core";
import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AppContext } from "./AppContext";

const Navbar: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const {
    appState,
    accountLoading,
    setPromptLoading: setLoading,
  } = useContext(AppContext);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const creditsAvailable = () => {
    if (typeof appState.credits !== "number") return "";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(appState.credits / 1000.0);
  };

  return (
    <nav className="flex w-full flex-col md:flex-row">
      <div className="flex w-full justify-between md:justify-center md:w-fit">
        <Link className="no-underline text-black" href="/">
          <div className="flex gap-4 pb-2 justify-center items-center">
            <img className="w-20 rounded-md" src="/logo.png" />
            <div>
              <div className="flex flex-row items-start">
                <Title order={4}>Rebuff Playground</Title>
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium ml-2 px-2.5 py-0.5 rounded border border-yellow-300">
                  Alpha
                </span>
              </div>
              <Text fz="sm">Prompt Injection Detector</Text>
            </div>
          </div>
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
        <div className="flex items-center justify-end md:justify-end gap-2 mr-2 flex-grow">
          <a href="#add-to-app" className="no-underline">
            <div className="p-2 border border-black border-solid cursor-pointer hover:bg-black hover:text-white rounded font-semibold text-black text-sm">
              <Text>Add to my app</Text>
            </div>
          </a>
          {session && (
            <>
              <Text className="font-semibold text-sm">
                {accountLoading ? (
                  <Loader color="gray" variant="dots" />
                ) : (
                  `Credits: ${creditsAvailable()}`
                )}
              </Text>
            </>
          )}
        </div>
        <div className="flex gap-2 items-end  md:justify-end ">
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
