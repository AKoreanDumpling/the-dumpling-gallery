import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

// Simple in-memory rate limiting (use Redis in production for multi-instance)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: NextApiRequest): string {
	const forwarded = req.headers["x-forwarded-for"];
	if (typeof forwarded === "string") {
		return forwarded.split(",")[0].trim();
	}
	return req.socket.remoteAddress || "unknown";
}

function isRateLimited(ip: string): boolean {
	const attempt = loginAttempts.get(ip);
	if (!attempt) return false;

	const timeSinceLastAttempt = Date.now() - attempt.lastAttempt;
	if (timeSinceLastAttempt > LOCKOUT_DURATION) {
		loginAttempts.delete(ip);
		return false;
	}

	return attempt.count >= MAX_ATTEMPTS;
}

function recordAttempt(ip: string, success: boolean): void {
	if (success) {
		loginAttempts.delete(ip);
		return;
	}

	const attempt = loginAttempts.get(ip);
	if (attempt) {
		attempt.count++;
		attempt.lastAttempt = Date.now();
	} else {
		loginAttempts.set(ip, { count: 1, lastAttempt: Date.now() });
	}
}

// Simple auth check function for use in getServerSideProps
export function isAuthenticated(cookieValue: string | undefined): boolean {
	return cookieValue === "authenticated";
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const clientIp = getClientIp(req);

	if (isRateLimited(clientIp)) {
		return res.status(429).json({
			message: "Too many login attempts. Please try again later.",
		});
	}

	const { accessCode } = req.body;

	if (!accessCode || typeof accessCode !== "string") {
		return res.status(400).json({ message: "Access code is required" });
	}

	const expectedCode = process.env.PRIVATE_ACCESS_CODE || "";

	if (accessCode === expectedCode) {
		recordAttempt(clientIp, true);

		const maxAge = 60 * 60 * 24; // 24 hours

		const cookie = serialize("private_auth", "authenticated", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge,
			path: "/",
		});

		res.setHeader("Set-Cookie", cookie);
		return res.status(200).json({ success: true });
	}

	recordAttempt(clientIp, false);
	return res.status(401).json({ message: "Invalid access code" });
}