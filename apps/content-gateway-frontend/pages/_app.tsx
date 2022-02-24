import 'bootstrap/dist/css/bootstrap.css';
import { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode } from "react";
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