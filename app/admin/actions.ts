"use server";

import { cookies } from "next/headers";

export async function loginAction(password: string) {
    if (password === process.env.ADMIN_PASSWORD) {
        (await cookies()).set("admin_session", "active", { 
            httpOnly: true, 
            secure: process.env.NODE_ENV === "production",
            path: "/" 
        });
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}

export async function logoutAction() {
    (await cookies()).delete("admin_session");
}
