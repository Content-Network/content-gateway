import 'bootstrap/dist/css/bootstrap.css';
import { AppProps } from "next/app";
import Head from "next/head";
import "./styles.css";
import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Layout from '../components/layout/layout';

function CustomApp({ Component, pageProps }: AppProps) {
    return (
        <>
            <Head>
                <title>Welcome to Test!</title>
            </Head>
            <main className="app">
                <ChakraProvider>
                    <StrictMode>
                        <Layout>
                            <Component {...pageProps} />
                        </Layout>
                    </StrictMode>
                </ChakraProvider>
            </main>
        </>
    );
}

export default CustomApp