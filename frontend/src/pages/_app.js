import '@mantine/core/styles.css';
import React from "react";
import {createTheme, MantineProvider} from '@mantine/core';
import DataProvider from "@/DataProvider";
import {Inter} from "next/font/google";
import {NextSeo} from "next-seo";

const font = Inter({weight: ["300", "500", "700", "900"], subsets: ["latin"]})

export default function App({Component, pageProps}) {
    const theme = createTheme({
        fontFamily: font.style.fontFamily
    });

    return (
        <React.Fragment>
            <NextSeo
                title="ScrumBluff - Free Planning Poker Tool"
                description="Boost your team's productivity with Scrum Bluff, the top free online planning poker tool. Create virtual rooms, discuss topics, and enhance collaboration with ease."
                openGraph={{
                    url: "https://scrumbluff.com",
                    title: "ScrumBluff - Free Planning Poker Tool",
                    description: "Boost your team's productivity with Scrum Bluff, the top free online planning poker tool. Create virtual rooms, discuss topics, and enhance collaboration with ease.",
                    siteName: "ScrumBluff",
                    images: [
                        {url: 'https://scrumbluff.com/social-card.png'}
                    ],
                }}
                twitter={{
                    cardType: "summary_large_image",
                    site: "https://scrumbluff.com"
                }}
            />
            <MantineProvider
                withGlobalStyles
                withNormalizeCSS
                theme={theme}
            >
                <DataProvider>
                    <Component {...pageProps} />
                </DataProvider>
            </MantineProvider>
        </React.Fragment>
    )
}
