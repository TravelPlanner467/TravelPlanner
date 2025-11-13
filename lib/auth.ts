import { betterAuth } from "better-auth"
import {prismaAdapter} from 'better-auth/adapters/prisma'
import { PrismaClient } from "@/generated/prisma";
import {nextCookies} from "better-auth/next-js";
import {admin, username} from "better-auth/plugins";

// Prisma - prevent multiple prisma instances from loading (in production environment)
const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Dynamic baseURL for different environments
const getBaseURL = () => {
    // Production
    if (process.env.VERCEL_ENV === "production") {
        return process.env.BETTER_AUTH_URL!;
    }
    // Vercel Preview Deployments
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    // Local development
    return "http://localhost:3000";
};

// Trusted origins for CORS
const getTrustedOrigins = () => {
    const origins = [getBaseURL()];

    // Vercel preview URLs
    if (process.env.VERCEL_URL) {
        origins.push(`https://${process.env.VERCEL_URL}`);
    }

    //  Production URL
    if (process.env.BETTER_AUTH_URL) {
        origins.push(process.env.BETTER_AUTH_URL);
    }

    return origins;
};

export const auth = betterAuth({
    database: prismaAdapter(prisma, {provider: "postgresql"}),
    baseURL: getBaseURL(),
    secret: process.env.BETTER_AUTH_SECRET || (process.env.NODE_ENV === "production"
        ? (() => { throw new Error("BETTER_AUTH_SECRET is required in production") })()
        : "dev-secret-key"),
    trustedOrigins: getTrustedOrigins(),
    emailAndPassword: {
        enabled: true
    },
    pages: {
        signIn: '/account/login',
        afterSignIn: '/account/profile',
        signUp: '/account/signup',
        afterSignUp: '/account/profile'
    },
    plugins: [
        nextCookies(),
        admin({
            defaultRole: "user",
            adminRoles: ["components"]
        }),
        username(),
    ],
    session: {
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60 // 5 minutes
        },
        expiresIn: 60 * 60 * 24 * 7, // 7 days session lifetime
        updateAge: 60 * 60 * 24      // Refresh token daily
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
})