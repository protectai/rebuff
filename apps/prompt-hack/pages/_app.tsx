import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import "@/styles/app.css";
import { Session } from "@supabase/auth-helpers-react";
import Layout from "@/components/Layout";
import { AppProvider } from "@/components/AppContext";

export default function App(props: AppProps<{ initialSession: Session }>) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        {/*<SessionContextProvider*/}
        {/*  supabaseClient={supabaseClient}*/}
        {/*  initialSession={pageProps.initialSession}*/}
        {/*>*/}
        <AppProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AppProvider>
        {/*</SessionContextProvider>*/}
      </MantineProvider>
    </>
  );
}
