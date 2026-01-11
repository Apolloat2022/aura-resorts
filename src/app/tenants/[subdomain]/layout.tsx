import { Metadata } from 'next';
import { db } from '@/db';
import { partners } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const generateMetadata = async ({ params }: { params: Promise<{ subdomain: string }> }): Promise<Metadata> => {
    const { subdomain } = await params;
    // Fetch partner record to get logo and name
    const [partner] = await db
        .select({ name: partners.subdomain, logo: partners.logoUrl })
        .from(partners)
        .where(eq(partners.subdomain, subdomain))
        .limit(1);

    const title = `${partner?.name ?? 'Partner'} – Curated Travel`;
    const description = `Explore a bespoke travel experience curated by ${partner?.name ?? 'our partner'} on AIRE.`;
    const ogImage = partner?.logo ?? '/default-og.png';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [{ url: ogImage, width: 1200, height: 630, alt: `${partner?.name ?? 'Partner'} logo` }],
        },
        icons: {
            icon: partner?.logo ?? '/favicon.ico',
        },
    };
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
};
