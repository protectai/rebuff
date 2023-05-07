import { FC, useState, FormEvent } from "react";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import crypto from "crypto";
import { useContext, useEffect } from "react"; // Import useEffect and useContext

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
import { AppContext } from "@/components/AppContext";

const Profile: FC = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);

  const { appState, refreshAppState } = useContext(AppContext); // Use AppContext to get appState and refreshAppState

  useEffect(() => {
    if (session) {
      refreshAppState(); // Retrieve the API key from the backend when the component is mounted
    }
  }, [session, refreshAppState]);

  const apiKey = appState.apikey; // Get the API key from the appState
  const usedCredits = appState.credits.used; // Get usedCredits from the appState
  const totalCredits = appState.credits.total; // Get totalCredits from the appState

  const refreshApiKey = () => {
    // Implement logic to refresh the API key using the backend
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
