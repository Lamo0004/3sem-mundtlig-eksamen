"use client";

import ButtonSecondary from "@/components/ButtonSecondary";
import Stepper from "@/components/Stepper";
import useCartStore from "@/app/store/cartStore";
import { format } from "date-fns";
import { da } from "date-fns/locale";
import { useState } from "react";


const SingleCard = ({ eventData }) => {
  const addToCart = useCartStore((state) => state.addToCart); //tilføjer antal billetter til kurv
  const [selectedTickets, setSelectedTickets] = useState({});
  const formattedDate = format(new Date(eventData.date), "d. MMMM yyyy", { locale: da });


  const handleQuantityChange = (ticketId, quantity) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const availableTickets = [
    { id: "1", name: "Voksne", price: 170 },
    { id: "2", name: "Studerende", price: 90 },
  ];

  //Funktion der kaldes når brugeren klikker på "tilføj til kurv" Bygger en Array af billetterne - sender dem til addToCard (zustand store)
  const handleAddToCart = () => {
    const ticketsToAdd = Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticket = availableTickets.find((t) => t.id === ticketId);
        return {
          id: ticket.id,
          name: ticket.name,
          price: ticket.price,
          quantity,
          eventId: eventData.id,
          eventTitle: eventData.title,
          remainingTickets: eventData.totalTickets - eventData.bookedTickets,
        };
      });
  
    addToCart(ticketsToAdd); // Dette sender alle valgte billetter samlet (Zustand funktionen kaldes her (addToCart))
  };

  return (
    <section className="px-4">
      {/* Titel og dato */}
      <div className="mb-4">
        <h1 className="font-semibold text-2xl">{eventData.title}</h1>
        <h3 className="font-light text-lg">{formattedDate}</h3>
      </div>

      {/* Info + billetter */}
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-10 mt-10">
        {/* Om eventet */}
        <section className="flex flex-col gap-4">
          <div>
            <h4 className="font-semibold">Om Eventet</h4>
            <p className="font-light">{eventData.description}</p>
          </div>
          <div>
            <h4 className="font-semibold">Lokation</h4>
            <p>
              {eventData.location.name}, {eventData.location.address}
            </p>
          </div>
        </section>

        {/* Billetter */}
        <section className="flex flex-col gap-6">
          {availableTickets.map((ticket) => (
            <div key={ticket.id} className="flex justify-between items-center gap-4 flex-wrap">
            <div>
              <p className="font-semibold">{ticket.name}</p>
              <p className="font-light">Pris {ticket.price} DKK</p>
            </div>

            <div className="flex flex-col items-end gap-1 min-w-[100px]">
            <Stepper
  quantity={selectedTickets[ticket.id] || 0}
  onQuantityChange={(q) => handleQuantityChange(ticket.id, q)}
  maxQuantity={eventData.totalTickets - eventData.bookedTickets}
/>
              </div>
            </div>
          ))}

<div className="flex justify-end">
<ButtonSecondary onClick={handleAddToCart}>
  Tilføj til kurv
</ButtonSecondary>
          </div>
        </section>
      </div>
    </section>
  );
};

export default SingleCard;
