This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
     <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="relative mx-auto aspect-square w-4/5 overflow-hidden rounded-full border border-white/15 bg-gradient-to-b from-white/10 to-transparent p-1 shadow-2xl"
              >
                <div className="relative h-full w-full overflow-hidden rounded-full">
                  {/* moving conic gradient */}
                  <div className="absolute inset-0 animate-[spin_12s_linear_infinite] rounded-full bg-[conic-gradient(at_50%_50%,rgba(16,185,129,0.5)_0deg,transparent_150deg,rgba(6,182,212,0.5)_300deg,transparent_330deg)]" />
                  {/* inner shield */}
                  <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/10 bg-white/5 backdrop-blur">
                    <div className="flex h-full items-center justify-center gap-2 text-emerald-300">
                      <ShieldCheck className="h-8 w-8" />
                      <span className="text-sm font-bold tracking-wide">Escrow Safe</span>
                    </div>
                  </div>
                  <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10" />
                </div>
              </motion.div>