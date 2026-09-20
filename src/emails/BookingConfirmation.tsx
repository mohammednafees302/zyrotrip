import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
  Row,
  Column,
} from "@react-email/components";
import * as React from "react";

interface BookingConfirmationProps {
  customerName: string;
  packageName: string;
  destinationName: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  bookingId: string;
}

export const BookingConfirmation = ({
  customerName = "Jane Doe",
  packageName = "Starlight Expedition",
  destinationName = "Mars",
  startDate = new Date("2026-10-15"),
  endDate = new Date("2026-10-25"),
  totalPrice = 150000,
  bookingId = "BKG-9876543210",
}: BookingConfirmationProps) => {
  const formattedStartDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(startDate);

  const formattedEndDate = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(endDate);

  return (
    <Html>
      <Head />
      <Preview>Your ZyroTrip Booking Confirmation for {destinationName}</Preview>
      <Tailwind>
        <Body className="bg-[#F9F7F4] text-[#1C1B1A] font-sans m-auto">
          <Container className="border border-solid border-[#EAE5DF] border-t-4 border-t-[#D4AF37] rounded-md my-[40px] mx-auto p-[30px] max-w-[600px] bg-[#FFFFFF] shadow-sm">
            <Section className="mt-[10px] text-center">
              <Text className="text-[#C5A028] text-[24px] font-bold tracking-[4px] uppercase font-serif m-0">
                ZyroTrip
              </Text>
            </Section>
            
            <Section className="mt-[24px]">
              <Heading className="text-[#1C1B1A] text-[28px] font-normal text-center p-0 my-[30px] mx-0 font-serif">
                Booking Confirmed
              </Heading>
              
              <Text className="text-[#4A4845] text-[16px] leading-[24px]">
                Dear {customerName},
              </Text>
              
              <Text className="text-[#4A4845] text-[16px] leading-[24px]">
                Your extraordinary journey to {destinationName} has been confirmed. We are thrilled to welcome you to the ZyroTrip experience.
              </Text>
            </Section>

            <Hr className="border border-solid border-[#EAE5DF] my-[26px] mx-0 w-full" />

            <Section>
              <Text className="text-[#1C1B1A] text-[18px] font-semibold mb-[16px] font-serif">
                Itinerary Details
              </Text>
              
              <Row className="mb-[12px]">
                <Column className="w-[120px]">
                  <Text className="text-[#8E8B85] text-[14px] m-0 uppercase tracking-wider text-xs">Package</Text>
                </Column>
                <Column>
                  <Text className="text-[#1C1B1A] text-[14px] font-medium m-0">{packageName}</Text>
                </Column>
              </Row>
              
              <Row className="mb-[12px]">
                <Column className="w-[120px]">
                  <Text className="text-[#8E8B85] text-[14px] m-0 uppercase tracking-wider text-xs">Dates</Text>
                </Column>
                <Column>
                  <Text className="text-[#1C1B1A] text-[14px] font-medium m-0">
                    {formattedStartDate} - {formattedEndDate}
                  </Text>
                </Column>
              </Row>

              <Row className="mb-[12px]">
                <Column className="w-[120px]">
                  <Text className="text-[#8E8B85] text-[14px] m-0 uppercase tracking-wider text-xs">Booking Ref</Text>
                </Column>
                <Column>
                  <Text className="text-[#1C1B1A] text-[14px] font-medium m-0">{bookingId}</Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#EAE5DF] my-[26px] mx-0 w-full" />

            <Section>
              <Row>
                <Column>
                  <Text className="text-[#1C1B1A] text-[18px] font-semibold m-0 font-serif">
                    Total
                  </Text>
                </Column>
                <Column align="right">
                  <Text className="text-[#C5A028] text-[20px] font-bold m-0">
                    ${totalPrice.toLocaleString()}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Hr className="border border-solid border-[#EAE5DF] my-[26px] mx-0 w-full" />

            <Section>
              <Text className="text-[#8E8B85] text-[12px] leading-[24px] text-center">
                If you have any questions regarding your booking, please reply to this email or contact our concierge team.
              </Text>
              <Text className="text-[#8E8B85] text-[12px] leading-[24px] text-center mt-[8px]">
                &copy; {new Date().getFullYear()} ZyroTrip. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default BookingConfirmation;
