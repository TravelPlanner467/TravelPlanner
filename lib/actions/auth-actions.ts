'use server';

import { auth } from '@/lib/auth';
import {headers} from "next/headers";
import {redirect} from "next/navigation";

export const signUp = async (email: string, password: string, name: string) => {
    const result = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            callbackURL: "/account/profile"
        }
    })
    if (!result?.user) {
        return { ok: false, message: 'Account Not Created' };
    }
    redirect('/account/profile');
};

export const signIn = async (email: string, password: string) => {
    const result = await auth.api.signInEmail({
        body: {
            email,
            password,
            callbackURL: "/account/profile"
        }
    })
    if (!result?.user) {
        return { ok: false, message: 'Invalid email or password' };
    }
    redirect('/account/profile');
};

export const signOut = async () => {
    const result = await auth.api.signOut({
        headers: await headers(),
    })

    return result;
};