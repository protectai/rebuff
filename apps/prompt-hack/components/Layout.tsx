import Head from "next/head";
import React, { ReactNode } from "react";
import SocialIcons from "./SocialIcons";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Prompt Hack</title>
        <meta property="og:title" content="Prompt Hack" key="title" />
        <meta name="msapplication-TileColor" content="#FFF" />
        <meta name="theme-color" content="#FFF" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          href="favicons/favicon-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href="favicons/android-chrome-192x192.png"
          sizes="192x192"
        />
        <link
          rel="icon"
          type="image/png"
          href="favicons/android-chrome-512x512.png"
          sizes="192x192"
        />
        <link
          rel="icon"
          type="image/png"
          href="favicons/favicon-16x16.png"
          sizes="16x16"
        />
      </Head>
      <div className="min-h-screen p-4 flex flex-col justify-center items-center max-w-screen-xl mx-auto">
        <main className="flex-grow w-full">{children}</main>
        <footer className="w-full text-gray-500">
          <div className="flex justify-between items-center">
            <div className="text-left">© {new Date().getFullYear()}</div>
            <div>
              Made by{" "}
              <a href="https://twitter.com/willpienaar" target="_blank">
                @willpienaar
              </a>{" "}
              and{" "}
              <a href="https://twitter.com/shrumm" target="_blank">
                @shrumm
              </a>
            </div>
            <div className="flex flex-row justify-right items-center">
              <div className="text-sm">Questions? Get in touch.</div>
              <SocialIcons />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};
export default Layout;
