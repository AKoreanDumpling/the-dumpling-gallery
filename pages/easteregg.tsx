import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const FOOTER_ACCESS_KEY = "footerAccess";

const EasterEgg: NextPage = () => {
    const router = useRouter();
    const [isAllowed, setIsAllowed] = useState<null | boolean>(null);

    useEffect(() => {
        if (!router.isReady) {
            return;
        }

        const fromFooterQuery = router.query.from;
        const isFromFooter =
            typeof fromFooterQuery === "string" && fromFooterQuery.toLowerCase() === "footer";

        if (isFromFooter) {
            try {
                sessionStorage.setItem(FOOTER_ACCESS_KEY, "true");
            } catch {
                // Ignore storage failures; the session check below will handle redirects.
            }
            setIsAllowed(true);
            router.replace("/easteregg", undefined, { shallow: true });
            return;
        }

        let hasAccess = false;
        try {
            hasAccess = sessionStorage.getItem(FOOTER_ACCESS_KEY) === "true";
        } catch {
            hasAccess = false;
        }

        if (!hasAccess) {
            setIsAllowed(false);
            router.replace("/");
            return;
        }

        setIsAllowed(true);
    }, [router, router.isReady, router.query.from]);

    if (isAllowed !== true) {
        return null;
    }

    return (
        <>
            <Head>
                <title>Easter Egg</title>
            </Head>
            <main className="mx-auto max-w-[900px] p-6 text-white">
                <h1 className="text-2xl font-bold">Easter Egg! 🥚</h1>
                <p className="mt-4 text-white/80">
                    Hey! You got here! That's pretty cool! 
                </p>
            </main>
        </>
    );
};

export default EasterEgg;
