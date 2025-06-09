"use client";

import { useEffect, useState } from "react";
import { getEventById } from "@/api/events";
import Header from "@/components/(header)/Header";
import ButtonSecondary from "@/components/ButtonSecondary";
import { format } from "date-fns";

export default function ReceiptPage() {
  const [receipt, setReceipt] = useState(null);
  const [events, setEvents] = useState({}); // Her gemmer vi købte events

  useEffect(() => {
    // 1. Vi hent kvittering fra sessionStorage (som tekst)
    const rawReceipt = sessionStorage.getItem("receipt"); //rawReceipt = string (raw) format

    if (rawReceipt) {
      //Hvis der er en kvittering...
      const parsedReceipt = JSON.parse(rawReceipt); //laver vi den kvittering om til et objekt.
      setReceipt(parsedReceipt); //Vi gemmer den i state, så vi kan vise den på siden.

      // 2. Find alle unikke eventId'er som brugeren har købt billetter til.
      //Først tager vi eventId fra hvert item,
      // så bruger vi "Set" for at fjerne dubletter,
      // til sidst laver vi et almindeligt array igen.
      const eventIds = [...new Set(parsedReceipt.items.map((item) => item.eventId))];

      // 3. Hent events én for én
      //Vi henter data for hvert event som brugeren har købt billetter til.
      //Vi går igenem listen af eventID'er og henter eventerne én for én.
      //Vi gemmer resultaterne i fetchedEvents, og til sidst i state.
      const fetchAllEvents = async () => {
        const fetchedEvents = {}; //tomt objekt hvor vi gemmer events
        for (const id of eventIds) {
          //Gå igennem hver eventId
          try {
            const data = await getEventById(id); //Hent eventets data
            fetchedEvents[id] = data; //Gem data i objektet
          } catch (err) {
            console.error(`Kunne ikke hente event med id: ${id}`, err);
          }
        }
        setEvents(fetchedEvents); //Gem allt hentede events i state
      };

      //Vi kalder fetchAllEvents() så vi henter event-data.
      fetchAllEvents();
    }
  }, []);

  //Hvis receipt endnu ikke er hentet, viser vi "indlæser kvittering..."
  if (!receipt) return <p>Indlæser kvittering...</p>;

  // 4. Gruppér billetter efter eventId
  // Vi laver en liste for hvert event, så vi kan vise billetter pr. event.
  const groupedTickets = {}; //Vistarter emd et tomt objekt - her vil vi gemme billetterne opdelt pr.eventId.

  // Vi går igennem alle billetterne i receipt.items
  receipt.items.forEach((ticket) => {
    //Hvis vi endnu ikke har en liste for dette eventId, laver vi en tom liste.
    if (!groupedTickets[ticket.eventId]) {
      groupedTickets[ticket.eventId] = [];
    }
    //Vi tilføjer billetten til listen for dette eventId.
    groupedTickets[ticket.eventId].push(ticket);
  });

  // 5. Beregn samlet pris
  // Vi går igennem alle billetter og ganger pris * antal for hver.
  // Til sidst har vi den samlede pris brugeren har betalt.
  const totalPrice = receipt.items.reduce((sum, ticket) => {
    return sum + (Number(ticket.price) || 0) * (Number(ticket.quantity) || 0);
  }, 0);

  return (
    <div>
      <Header />
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Tak for din bestilling!</h1>
      </div>

      {/* Vis billetter pr. event */}
      {Object.keys(groupedTickets).map((eventId) => {
        const event = events[eventId];
        if (!event) return null;

        return (
          <div key={eventId} className="mb-10  p-6">
            <title>Tak for dit køb</title>
            <h2 className="text-2xl font-semibold">{event.title}</h2>
            <p className="text-gray-500 mb-4">Dato: {event.date}</p>

            <p className="text-sm text-gray-500">Købstidspunkt: {format(new Date(receipt.timestamp), "HH:mm, dd.MM.yyyy")}</p>

            <hr className="mb-4 border-[#C4FF00] border-t-2" />

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {groupedTickets[eventId].map((ticket, index) => (
                <div key={index} className="bg-white p-4">
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <p className="font-medium">Billet-type:</p>
                      <p>{ticket.name}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Antal:</p>
                      <p>{ticket.quantity}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="font-medium">Pris pr. billet:</p>
                      <p>{ticket.price} kr</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-4 text-right space-y-4">
        <h3 className="font-bold">Total: {totalPrice} kr</h3>
        <div className="mt-4 mb-4">
          <ButtonSecondary href="/">
            <span className="block text-base text-center">Tilbage til forsiden</span>
          </ButtonSecondary>
        </div>
      </div>
    </div>
  );
}
