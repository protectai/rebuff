import { supabase } from '@/lib/supabase'
import '@/styles/app.css'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react'
import type { AppProps } from 'next/app'
import {useState} from "react";

export default function App({ Component, pageProps }: AppProps<{
    initialSession: Session
}>) {
    const [supabaseClient] = useState(() => createBrowserSupabaseClient())
    return (
        <SessionContextProvider supabaseClient={supabaseClient}
                                initialSession={pageProps.initialSession}>
          <Component {...pageProps} />
        </SessionContextProvider>
    )
}
