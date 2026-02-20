import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import Bridge from "./Icons/Bridge";
import { fadeInUp, staggerContainer } from "../utils/galleryPageAnimations";

type GalleryHeroProps = {
    title: ReactNode;
    dateText: string;
    onOpenChangelog?: () => void;
    showChangelog?: boolean;
    showGithub?: boolean;
    showPrivateAccess?: boolean;
    privateAccessHref?: string;
    onLogout?: () => void;
};

export default function GalleryHero({
    title,
    dateText,
    onOpenChangelog,
    showChangelog = false,
    showGithub = false,
    showPrivateAccess = false,
    privateAccessHref = "/private",
    onLogout,
}: GalleryHeroProps) {
    return (
        <motion.div
            className="after:content relative mb-5 flex max-w-full h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
        >
            <motion.div
                className="absolute inset-0 flex items-center justify-center opacity-20"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
            >
                <span className="flex max-h-full max-w-full items-center justify-center">
                    <Bridge />
                </span>
                <span className="absolute left-0 right-0 bottom-0 h-[300px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </motion.div>

            <motion.h1
                className="mt-8 mb-2 text-base font-bold uppercase tracking-widest"
                variants={fadeInUp}
            >
                {title}
            </motion.h1>

            <motion.p
                className="max-w-[40ch] text-white/75 sm:max-w-[32ch]"
                variants={fadeInUp}
            >
                {dateText}
            </motion.p>

            <motion.a
                className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition-colors md:mt-4 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                href="#credits"
                rel="noreferrer"
                variants={fadeInUp}
                whileHover={{ boxShadow: "0 0 25px rgba(255,255,255,0.4)" }}
            >
                Photo Credits
            </motion.a>

            {showGithub && (
                <motion.a
                    className="pointer z-10 mt-0 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    href="https://github.com/akoreandumpling/the-dumpling-gallery"
                    target="_blank"
                    rel="noreferrer"
                    variants={fadeInUp}
                    whileHover={{ boxShadow: "0 0 25px rgba(255,255,255,0.4)" }}
                >
                    Code on GitHub
                </motion.a>
            )}

            {showPrivateAccess && (
                <motion.div variants={fadeInUp}>
                    <Link
                        href={privateAccessHref}
                        className="pointer z-10 mt-0 inline-block rounded-lg border border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
                    >
                        <motion.span className="inline-block">
                            🔒 Private Access
                        </motion.span>
                    </Link>
                </motion.div>
            )}

            {onLogout && (
                <motion.button
                    onClick={onLogout}
                    className="cursor-pointer z-10 mt-0 rounded-lg border border-red-400 bg-red-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                    variants={fadeInUp}
                >
                    Log Out
                </motion.button>
            )}

            {showChangelog && onOpenChangelog && (
                <motion.button
                    onClick={onOpenChangelog}
                    className="pointer z-10 mt-0 rounded-lg border border-white bg-black px-3 py-2 text-sm font-semibold text-white transition-colors cursor-pointer hover:bg-white hover:text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    variants={fadeInUp}
                >
                    What's New
                </motion.button>
            )}
        </motion.div>
    );
}
