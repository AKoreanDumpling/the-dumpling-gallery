import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	// Clear the cookie (no server-side session to delete with signed tokens)
	const cookie = serialize("private_auth", "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
		maxAge: 0,
		path: "/",
	});

	res.setHeader("Set-Cookie", cookie);
	return res.status(200).json({ success: true });
}