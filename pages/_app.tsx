import type { AppProps } from "next/app";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "../styles/index.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <SpeedInsights />
    </>
  );
}
