import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { accessCode } = req.body;

	if (!accessCode) {
		return res.status(400).json({ message: "Access code is required" });
	}

	if (accessCode === process.env.PRIVATE_ACCESS_CODE) {
		// Set an HTTP-only cookie for authentication
		const cookie = serialize("private_auth", "authenticated", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 60 * 60 * 24, // 24 hours
			path: "/",
		});

		res.setHeader("Set-Cookie", cookie);
		return res.status(200).json({ success: true });
	}

	return res.status(401).json({ message: "Invalid access code" });
}