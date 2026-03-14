import Link from "next/link";
import type { ReactNode } from "react";
import Bridge from "./Icons/Bridge";

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
        <div
            className="after:content relative mb-5 flex max-w-full h-[629px] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0"
        >
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <span className="flex max-h-full max-w-full items-center justify-center">
                    <Bridge />
                </span>
                <span className="absolute left-0 right-0 bottom-0 h-[300px] bg-gradient-to-b from-black/0 via-black to-black"></span>
            </div>

            <h1 className="mt-8 mb-2 text-base font-bold uppercase tracking-widest">
                {title}
            </h1>

            <p className="max-w-[40ch] text-white/75 sm:max-w-[32ch]">
                {dateText}
            </p>

            <a
                className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black md:mt-4"
                href="#credits"
                rel="noreferrer"
            >
                Photo Credits
            </a>

            {showGithub && (
                <a
                    className="pointer z-10 mt-0 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black"
                    href="https://github.com/akoreandumpling/the-dumpling-gallery"
                    target="_blank"
                    rel="noreferrer"
                >
                    Code on GitHub
                </a>
            )}

            {showPrivateAccess && (
                <div>
                    <Link
                        href={privateAccessHref}
                        className="pointer z-10 mt-0 inline-block rounded-lg border border-purple-400 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                        <span className="inline-block">
                            🔒 Private Access
                        </span>
                    </Link>
                </div>
            )}

            {onLogout && (
                <button
                    onClick={onLogout}
                    className="cursor-pointer z-10 mt-0 rounded-lg border border-red-400 bg-red-500 px-3 py-2 text-sm font-semibold text-white"
                >
                    Log Out
                </button>
            )}

            {showChangelog && onOpenChangelog && (
                <button
                    onClick={onOpenChangelog}
                    className="pointer z-10 mt-0 rounded-lg border border-white bg-black px-3 py-2 text-sm font-semibold text-white cursor-pointer"
                >
                    What's New
                </button>
            )}
        </div>
    );
}
