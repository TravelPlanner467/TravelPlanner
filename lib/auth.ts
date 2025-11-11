import { betterAuth } from "better-auth"
import {prismaAdapter} from 'better-auth/adapters/prisma'
import { PrismaClient } from "@/generated/prisma";
import {nextCookies} from "better-auth/next-js";
import {admin, username} from "better-auth/plugins";

const prisma = new PrismaClient()

export const auth = betterAuth({
    database: prismaAdapter(prisma, {provider: "postgresql"}),
    emailAndPassword: {
        enabled: true
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: "user"
            },
            username: {
                type: "string",
                required: false
            },
            displayUsername: {
                type: "string",
                required: false
            },
            banned: {
                type: "boolean",
                required: false,
                defaultValue: false
            },
            banReason: {
                type: "string",
                required: false
            },
            banExpires: {
                type: "date",
                required: false
            }
        }
    },
    plugins: [
        nextCookies(),
        admin({
            defaultRole: "user",
            adminRoles: ["components"]
        }),
        username(),
    ],
    pages: {
        signIn: '/account/login',
        afterSignIn: '/account/profile',
        signUp: '/account/signup',
        afterSignUp: '/account/profile'
    },
})