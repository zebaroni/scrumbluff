import Head from "next/head";
import {AppShell, Burger, Group} from "@mantine/core";
import {useContext} from "react";
import {useDisclosure} from "@mantine/hooks";
import MainView from "@/components/MainView";
import Sidebar from "@/components/Sidebar";
import {DataContext} from "@/DataProvider";
import UsernamePage from "@/components/UsernamePage";
import Link from "next/link";
import Image from "next/image";
import logo from "../../public/logo.png";

export default function Home() {
    const [opened, {toggle}] = useDisclosure();
    const {username} = useContext(DataContext);

    if (!username) {
        return <UsernamePage/>
    }

    return (
        <>
            <Head>
                <title>Scrum Bluff - Planning Poker Tool</title>
                <meta name="description"
                      content="Elevate your team's productivity with our free online planning poker tool. Create your virtual room, add topics, and engage in insightful discussions."/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <meta name="keywords" content="planning poker, scrum, virtual room, free, online, tool"/>
                <meta name="language" content="English"/>
                <meta name="robots" content="index, follow"/>
                <link rel="icon" href="/favicon.ico"/>

                <meta property="og:title" content="Scrum Bluff - Planning Poker Tool"/>
                <meta property="og:description"
                      content="Elevate your team's productivity with our free online planning poker tool. Instantly create your virtual room, add topics, and engage in insightful discussions."/>
                <meta property="og:image" content="https://www.scrumbluff.com/social-card.png"/>
                <meta property="og:url" content="https://www.scrumbluff.com/"/>

                <meta name="twitter:card" content="summary_large_image"/>
                <meta property="twitter:url" content="https://www.scrumbluff.com/"/>
                <meta property="twitter:domain" content="scrumbluff.com"/>
                <meta name="twitter:title" content="Scrum Bluff - Planning Poker Tool"/>
                <meta name="twitter:description"
                      content="Elevate your team's productivity with our free online planning poker tool. Instantly create your virtual room, add topics, and engage in insightful discussions."/>
                <meta name="twitter:image" content="https://www.scrumbluff.com/social-card.png"/>
            </Head>
            <main>
                <AppShell
                    header={{height: {base: 60, md: 70, lg: 80}}}
                    navbar={{
                        width: {base: 300, md: 400, lg: 400},
                        breakpoint: 'sm',
                        collapsed: {mobile: !opened},
                    }}
                    padding="md"
                >
                    <AppShell.Header>
                        <Group h="100%" px="md">
                            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm"/>
                            <Link href={"/"} style={{textDecoration: 'none', color: 'black'}}>
                                <Image style={{marginLeft: 110}} width={150} src={logo}
                                       alt="free online planning poker tool scrumbluff logo"/>
                            </Link>
                        </Group>
                    </AppShell.Header>
                    <AppShell.Navbar p="md" style={{overflowY: 'auto'}}>
                        <Sidebar/>
                    </AppShell.Navbar>
                    <AppShell.Main style={{backgroundColor: 'rgba(0,0,0,0.01)'}}>
                        <MainView/>
                    </AppShell.Main>
                </AppShell>
            </main>
        </>
    );
}
