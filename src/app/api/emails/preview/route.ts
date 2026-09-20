import { render } from "@react-email/render";
import BookingConfirmation from "@/emails/BookingConfirmation";

export async function GET() {
  const html = await render(
    BookingConfirmation({
      customerName: "Jane Doe",
      packageName: "Starlight Expedition",
      destinationName: "Mars",
      startDate: new Date("2026-10-15"),
      endDate: new Date("2026-10-25"),
      totalPrice: 150000,
      bookingId: "BKG-9876543210",
    })
  );

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
