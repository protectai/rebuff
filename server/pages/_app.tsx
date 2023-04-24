import { AppProps } from 'next/app';
import Head from 'next/head';
import { MantineProvider } from '@mantine/core';
import { supabase } from '@/lib/supabase';
// import '@/styles/app.css';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { useState } from 'react';

export default function App(props: AppProps<{ initialSession: Session }>) {
    const { Component, pageProps } = props;
    const [supabaseClient] = useState(() => createBrowserSupabaseClient());

    return (
        <>
            <Head>
                <title>Page title</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>

            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={{
                    /** Put your mantine theme override here */
                    colorScheme: 'light',
                }}
            >
                <SessionContextProvider supabaseClient={supabaseClient} initialSession={pageProps.initialSession}>
                    <Component {...pageProps} />
                </SessionContextProvider>
            </MantineProvider>
        </>
    );
}
