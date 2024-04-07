import '@mantine/core/styles.css';
import React from "react";
import {createTheme, MantineProvider} from '@mantine/core';
import DataProvider from "@/DataProvider";
import {Inter} from "next/font/google";

const font = Inter({weight: ["300", "500", "700", "900"], subsets: ["latin"]})

export default function App({Component, pageProps}) {
    const theme = createTheme({
        fontFamily: font.style.fontFamily
    });

    return (
        <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={theme}
        >
            <DataProvider>
                <Component {...pageProps} />
            </DataProvider>
        </MantineProvider>
    )
}
