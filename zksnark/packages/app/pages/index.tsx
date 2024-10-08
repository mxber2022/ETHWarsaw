import { Inter } from "@next/font/google";
import { Col, Row } from "antd";
import Head from "next/head";
import Script from "next/script";
import PlayPannel from "../src/components/PlayPannel";
import VerifyPannel from "../src/components/VerifyPannel";
import { APP_DESCRIPTION, APP_NAME } from "../src/Constants";
import AppLayout from "../src/layout/AppLayout";
import { AccountProvider } from "../src/contexts/AccountContext";
import { METAMASK } from "./meta";
import { MetaMaskProvider } from "@metamask/sdk-react";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>{APP_NAME}</title>
        <meta name="description" content={APP_DESCRIPTION} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Script src="/snarkjs.min.js" />
      <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "Example React Dapp",
        },
        infuraAPIKey: "1cd853bc10304f8ba6faa52343f86aac",
        // Other options.
      }}
    >
      <AccountProvider>
        <AppLayout>
          <Row style={{ padding: 50 }} gutter={50} justify="center">
            <Col span={10}>
              <PlayPannel />
            </Col>
            {/* <Col span={10}>
              <VerifyPannel />
            </Col> */}
          </Row>
        </AppLayout>
      </AccountProvider>
      </MetaMaskProvider>
    </>
  );
}
