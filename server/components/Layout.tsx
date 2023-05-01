import Head from "next/head";
import Navbar from "./Navbar";
import React, { ReactNode } from "react";
import SocialIcons from "./SocialIcons";

interface Props {
  children: ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <div className="min-h-screen p-4 flex flex-col justify-center items-center max-w-screen-lg mx-auto">
      <Head>
        <title>Rebuff Playground</title>
        <meta property="og:title" content="Rebuff Playground" key="title" />
      </Head>
      <Navbar />
      <main className="flex-grow w-full">{children}</main>
      <footer className="w-full  text-gray-500">
        <div className="flex justify-between items-center">
          <div className="text-left">© {new Date().getFullYear()}</div>
          <div className="flex flex-row justify-right items-center">
            <div className="text-sm">Questions? Get in touch.</div>
            <SocialIcons />
          </div>
        </div>
      </footer>
    </div>
  );
};
export default Layout;
