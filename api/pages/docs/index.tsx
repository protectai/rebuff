import { FC } from "react";

import { Container } from "@mantine/core";
import Navbar from "@/components/Navbar";
import Head from "next/head";
import CodeSamples from "@/components/CodeSamples";
const Docs: FC = () => {
  return (
    <Container size="lg">
      <Head>
        <title>Rebuff Playground | Docs</title>
        <meta property="og:title" content="Rebuff Playground" key="title" />
      </Head>
      <Navbar />
      <CodeSamples />
    </Container>
  );
};
export default Docs;
