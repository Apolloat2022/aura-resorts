import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Tailwind,
    Button,
} from "@react-email/components";

interface BookingEmailProps {
    customerName: string;
    resortName: string;
    resortImage: string;
    itinerary: Array<{ day: number; title: string; activities: string[]; dining: { breakfast: string; lunch: string; dinner: string } }>;
    partnerName: string;
    bookingId: string;
    subdomain: string;
}

export const BookingConfirmationEmail = ({
    customerName,
    resortName,
    resortImage,
    itinerary,
    partnerName,
    bookingId,
    subdomain,
}: BookingEmailProps) => {
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, "");
    const itineraryUrl = `${baseUrl}/tenants/${subdomain}/itinerary/${bookingId}`;

    return (
        <Html>
            <Head />
            <Preview>Your AI-Generated Itinerary for {resortName} is ready!</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="mx-auto py-5 px-4 max-w-[600px]">
                        <Text className="text-xs font-bold tracking-widest uppercase text-gray-400">
                            Curated by {partnerName}
                        </Text>
                        <Heading className="text-2xl font-serif text-black mt-2">
                            Pack your bags, {customerName}!
                        </Heading>

                        {/* Cloudinary Hero Image */}
                        <Img
                            src={resortImage}
                            alt={resortName}
                            className="w-full rounded-lg mt-4 object-cover h-[250px]"
                        />

                        <Section className="mt-8">
                            <Text className="text-lg font-bold border-b border-gray-200 pb-2">
                                Your 5-Day Experience at {resortName}
                            </Text>
                            {itinerary.map((day) => (
                                <div key={day.day} className="py-4 border-b border-gray-50">
                                    <Text className="font-bold text-blue-600 uppercase text-xs mb-2">
                                        Day {day.day}: {day.title}
                                    </Text>
                                    {day.activities.map((activity, idx) => (
                                        <Text key={idx} className="m-0 text-sm ml-4">
                                            • {activity}
                                        </Text>
                                    ))}
                                    <Text className="m-0 text-sm text-gray-500 italic mt-2 ml-4">
                                        🍽️ Dining: {day.dining.breakfast} • {day.dining.lunch} • {day.dining.dinner}
                                    </Text>
                                </div>
                            ))}
                        </Section>

                        <Section className="text-center mt-10">
                            <Button
                                className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm no-underline"
                                href={itineraryUrl}
                            >
                                View Full Shareable Itinerary
                            </Button>
                        </Section>

                        <Hr className="border-gray-200 my-8" />
                        <Text className="text-center text-xs text-gray-400">
                            Powered by AIRE • The future of all-inclusive travel.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default BookingConfirmationEmail;
