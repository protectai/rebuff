import Head from "next/head";
import Navbar from "./Navbar";
import React, { ReactNode } from "react";
import SocialIcons from "./SocialIcons";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Head>
        <title>Rebuff Playground</title>
        <meta property="og:title" content="Rebuff Playground" key="title" />
      </Head>
      <div className="min-h-screen p-4 flex flex-col justify-center items-center max-w-screen-xl mx-auto">
        <Navbar />
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
