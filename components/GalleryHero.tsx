import Link from "next/link";
import type { ReactNode } from "react";
import Bridge from "./Icons/Bridge";
import Admonition from "@yozora/react-admonition"

type GalleryHeroProps = {
    className?: string;
    title: ReactNode;
    dateText: string;
    showGithub?: boolean;
    showPrivateAccess?: boolean;
    privateAccessHref?: string;
    onLogout?: () => void;
};

export default function GalleryHero({
    className,
    title,
    dateText,
    showGithub = false,
    showPrivateAccess = false,
    privateAccessHref = "/private",
    onLogout,
}: GalleryHeroProps) {
    return (
        <div className={className}>
            <div
                className="after:content relative flex max-w-full h-[97vh] flex-col items-center justify-end gap-4 overflow-hidden rounded-lg bg-white/10 px-6 pb-16 pt-64 text-center text-white shadow-highlight after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:shadow-highlight lg:pt-0"
            >
                <div className="absolute inset-0 flex items-center justify-center p-6 opacity-20 pointer-events-none">
                    <span className="flex h-full w-full items-center justify-center">
                        <Bridge className="h-full w-auto max-h-full max-w-full" />
                    </span>
                    <span className="absolute left-0 right-0 bottom-0 h-[60vh] bg-gradient-to-b from-black/0 via-black to-black"></span>
                </div>

                <h1 className="mt-8 pb-0 mb-0 text-base font-black uppercase tracking-widest">
                    {title}
                </h1>

                <p className="pt-0 mt-0 max-w-[40ch] text-white/75 sm:max-w-[32ch]">
                    {dateText}
                </p>

                <Admonition
                    keyword="info"
                    className="mb-0 pb-0 max-w-[40ch] text-left text-sm text-white/75">
                    Photos will typically stay up for 1 week before being removed to manage storage.
                </Admonition>

                <a
                    className="pointer z-10 mt-6 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black md:mt-4"
                    href="#credits"
                    rel="noreferrer"
                >
                    Photo Credits
                </a>

                <a
                    className="pointer z-10 mt-0 rounded-lg border border-white bg-white px-3 py-2 text-sm font-semibold text-black"
                    href="https://github.com/akoreandumpling/the-dumpling-gallery"
                    target="_blank"
                    rel="noreferrer"
                >
                    Code on GitHub
                </a>

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

            </div>
        </div>
    );

}
