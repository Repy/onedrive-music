import React, { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';

const REDIRECTURI = process.env.REACT_APP_REDIRECTURI;
const msalInstance = new PublicClientApplication({
    auth: {
        clientId: "8db8331d-03ea-4341-84e6-8d607e1e33df",
        authority: "https://login.microsoftonline.com/consumers",
        redirectUri: REDIRECTURI,
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: false,
    },
});

async function login(): Promise<string> {
    await msalInstance.initialize();
    const lastauth = await msalInstance.handleRedirectPromise(location.hash);
    console.log(lastauth);
    if (msalInstance.getAllAccounts().length > 0) {
        msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
        const result = await msalInstance.acquireTokenSilent({
            scopes: [
                "https://graph.microsoft.com/Files.ReadWrite",
            ],
        });
        return result.accessToken;
    } else {
        await msalInstance.acquireTokenRedirect({
            scopes: [
                "https://graph.microsoft.com/Files.ReadWrite",
            ],
        });
        return "";
    }
}

const ENDPOINT = "https://graph.microsoft.com/v1.0"

const TokenContext = createContext<string>("")

interface Token {
    token: string;
    fetch(path: string, signal?: AbortSignal): Promise<Response>;
    fetchAPI<T>(path: string, signal?: AbortSignal, options?: { method?: string, body?: string }): Promise<T>;
}

export function useToken(): Token {
    const token = useContext(TokenContext);

    return {
        token: token,
        fetch: async function (url: string, signal?: AbortSignal) {
            return await fetch(url, {
                headers: { "Authorization": "Bearer " + token },
                signal: signal
            });
        },
        fetchAPI: async function <T>(path: string, signal?: AbortSignal, options?: { method?: string, body?: string }) {
            const res = await fetch(
                ENDPOINT + path,
                {
                    method: options?.method,
                    body: options?.body,
                    headers: { "Authorization": "Bearer " + token },
                    signal: signal
                }
            );
            const data = await res.json();
            return data as T;
        },
    };
}

export function Login(props: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>();

    useEffect(() => {
        (async () => {
            const token = await login();
            setToken(token);
        })();
    }, []);

    if (!token) {
        return null
    }

    return (
        <TokenContext.Provider value={token}>
            {props.children}
        </TokenContext.Provider>
    );
}
