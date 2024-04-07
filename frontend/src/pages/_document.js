import {Head, Html, Main, NextScript} from "next/document";
import {NextSeo} from "next-seo";
import React from "react";

export default function Document() {
    return (
        <Html lang="en">
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
            <Head/>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    );
}
