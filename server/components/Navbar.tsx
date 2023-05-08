import { FC, useContext, useState } from "react";
import { Group, Image, Text, Title } from "@mantine/core";
import { IconLogout, IconMenu2, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { AppContext } from "./AppContext";

const Navbar: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();
  const { appState, refreshApikey, setLoading } = useContext(AppContext);
  const [mobileMenuOpened, setMobileMenuOpened] = useState(false);
  const creditsAvailable = () => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(appState.credits / 1000.0);
  };

  return (
    <nav className="flex w-full flex-col md:flex-row">
      <div className="flex w-full justify-between md:justify-center md:w-fit">
        <Link className="no-underline text-black" href="/">
          <Group spacing="lg">
            <Text fz="lg">
              {" "}
              <Image
                maw={100}
                mx="auto"
                radius="md"
                src="https://camo.githubusercontent.com/9ff0256fdbfa8dbbc8e61201bf9ccc34f985c77e690967052d14b61eae6fee24/68747470733a2f2f692e696d6775722e636f6d2f62366770574f422e706e67"
                style={{ clipPath: "inset(5% 15% 5% 15%)" }} // Apply cropping here
              />
            </Text>
            <Text>
              <Title order={2} size={"xx-large"}>
                Rebuff Playground
              </Title>
              <Text fz="md">Prompt Injection Detector</Text>
            </Text>
          </Group>
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
              <Text className="font-semibold text-sm  ml-auto mr-4">
                Credits: {`${creditsAvailable()}`}
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
