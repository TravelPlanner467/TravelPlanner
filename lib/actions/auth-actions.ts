'use server';

import { auth } from '@/lib/auth';
import {headers} from "next/headers";

export const signUp = async (email: string, password: string, name: string) => {
    const result = await auth.api.signUpEmail({
        body: {
            email,
            password,
            name,
            callbackURL: "/"
        }
    })

    return result;
};

export const signIn = async (email: string, password: string) => {
    const result = await auth.api.signInEmail({
        body: {
            email,
            password,
            callbackURL: "/"
        }
    })

    return result;
};

export const signOut = async () => {
    const result = await auth.api.signOut({headers: await headers()})

    return result;
};