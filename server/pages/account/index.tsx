import { FC, useState, FormEvent } from "react";
import { useForm } from "@mantine/form";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Auth, ThemeSupa } from "@supabase/auth-ui-react";
import Link from "next/link";

import {
  Button,
  Checkbox,
  Container,
  Grid,
  Space,
  Textarea,
  Title,
} from "@mantine/core";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import { ProfileSettings } from "@/components/ProfileSettings";
const Profile: FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(generateApiKey(12));
  const [usedCredits] = useState(50);
  const [totalCredits] = useState(100);

  const refreshApiKey = () => {
    setApiKey(generateApiKey(12));
  };
  return (
    <Container size="lg">
      <Head>
        <title>Rebuff Playground</title>
        <meta property="og:title" content="Rebuff Playground" key="title" />
      </Head>
      <Navbar />
      <Space h="lg" />
      <Title order={4}>Profile</Title>
      <ProfileSettings
        apiKey={apiKey}
        usedCredits={usedCredits}
        totalCredits={totalCredits}
        onRefreshApiKey={refreshApiKey}
      />
    </Container>
  );
};
export default Profile;

function generateApiKey(length: number = 64): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
