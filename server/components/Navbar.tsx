import { FC } from "react";
import { Title, Grid, Button, Text } from "@mantine/core";
import {
  IconBrandDiscord,
  IconBrandGithub,
  IconBrandTwitter,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

const Navbar: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  return (
    <nav className="flex flex-row w-full">
      <div>
        <Link className="no-underline text-black" href="/">
          <Title order={1}>Rebuff.ai</Title>
        </Link>
        <Title order={4}>Prompt Injection Detector</Title>
      </div>
      <div className="flex-grow"></div>
      <div className="flex flex-row">
        {session ? (
          <div className="flex flex-row">
            <Link className="text-black no-underline" href="/account">
              <div className="flex flex-row items-center p-2">
                <IconUser />
                <Text className="font-semibold text-sm">Account</Text>
              </div>
            </Link>
            <Button
              variant="subtle"
              color="dark"
              leftIcon={<IconLogout />}
              onClick={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) console.log("Error logging out:", error.message);
              }}
            >
              Logout
            </Button>
          </div>
        ) : (
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "black",
                    brandAccent: "black",
                    defaultButtonText: "#333",
                  },
                },
              },
            }}
            theme="default"
            providers={["google"]}
            onlyThirdPartyProviders={true}
          />
        )}
        <div className={`flex flex-row p-1 ${session ? "" : "items-center"}`}>
          <a href="https://github.com/woop" target="_blank">
            <IconBrandGithub color={"black"} />
          </a>
          <a href="https://twitter.com" target="_blank">
            <IconBrandTwitter color={"black"} />
          </a>
          <a href="https://discord.com" target="_blank">
            <IconBrandDiscord color={"black"} />
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
