import { FC } from "react";
import { Alert } from "@mantine/core";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";

const ShortInstructions: FC = () => {
  const supabase = useSupabaseClient();
  const session = useSession();

  return session ? (
    <Alert
      icon={<IconInfoCircle size="1rem" />}
      title="How to play"
      color={!session ? "gray" : ""}
      withCloseButton={!session ? false : true}
    >
      Rebuff is an API to help minimize prompt injection attacks. The prompt
      below 'should' generate valid SQL, try to breach our defenses!
    </Alert>
  ) : (
    <div>
      <Alert
        icon={<IconAlertCircle size="1rem" />}
        title="Claim credits to get started"
        color="yellow"
      >
        <div>Rebuff is an API to help minimize prompt injection attacks.</div>
        <div>
          To keep API requests manageable, please login with your Google account
          to claim API credits (at no cost) to use the playground.
        </div>
      </Alert>
      <div className="w-48">
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "black",
                  brandAccent: "black",
                  defaultButtonText: "#fff",
                  defaultButtonBackground: "#000",
                  defaultButtonBackgroundHover: "#333",
                },
              },
            },
          }}
          theme="default"
          providers={["google"]}
          onlyThirdPartyProviders={true}
        />
      </div>
    </div>
  );
};

export default ShortInstructions;
