"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global Error:", error);
    }, [error]);

    return (
        <html>
            <body className="bg-slate-50 dark:bg-slate-950">
                <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
                    <div className="mb-4 rounded-full bg-red-100 p-4 dark:bg-red-900/20">
                        <svg
                            className="h-10 w-10 text-red-600 dark:text-red-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                        Bir şeyler ters gitti
                    </h2>
                    <p className="mb-6 max-w-md text-slate-600 dark:text-slate-400">
                        Uygulama yüklenirken beklenmedik bir hata oluştu. Lütfen tekrar deneyin.
                    </p>
                    {error.message && (
                        <pre className="mb-6 max-w-md overflow-auto rounded bg-slate-100 p-4 text-left text-xs text-slate-800 dark:bg-slate-900 dark:text-slate-200">
                            {error.message}
                        </pre>
                    )}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                try {
                                    localStorage.clear();
                                    window.location.reload();
                                } catch (e) {
                                    console.error("LocalStorage temizlenemedi", e);
                                }
                            }}
                            className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            Verileri Sıfırla
                        </button>
                        <button
                            onClick={() => reset()}
                            className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
