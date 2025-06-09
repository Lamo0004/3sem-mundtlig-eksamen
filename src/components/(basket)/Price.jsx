"use client";
//Fortæller Next.js at denne komponent er en Client Component (kører i browseren)

//Importerer din zustand store, som indeholder kurv-data og funktioner (f.eks. tilføj, fjern, opdater)
import useCartStore from "@/app/store/cartStore";
//Importerer Stepper komponent der lader brugeren ændre antal billetter (+/- knapper)
import Stepper from "@/components/Stepper";
import Link from "next/link";
import { RxCross2 } from "react-icons/rx";

//PRICE Komponenten bruges til at vise og redigere kurvens indhold. 

//Starter komponenten "Price"
const Price = () => {
  //Henter items (billetter i kurven) fra cartStore
  const { items } = useCartStore((state) => state);

  //Funktion der udregner totalpris: reduce() løber igennem alle items og lægger pris * antal sammen.
  const getTotalPrice = () => {
    return items.reduce((totalPrice, item) => totalPrice + item.price * item.quantity, 0);
  };

  //Henter funktionen removeItem fra zustand-store (bruges til at fjerne billetter).
  const { removeItem } = useCartStore((state) => state);

//GRUPPERER ITEMS EFTER EVENT:

//Samler billetter der tilhører samme event
    //key = eventId.
    //Hvis ikke der findes en gruppe for det event endnu → opret én.
    //Læg hver billet i den rigtige gruppe (tickets array).
  const groupedItems = items.reduce((output, item) => {
    const key = item.eventId;
    if (!output[key]) {
      output[key] = { eventTitle: item.eventTitle, tickets: [] };
    }
    output[key].tickets.push(item);
    return output;
  }, {});


//Returnerer markup. Artikler bruges ofte til sektioner med selvstændigt indhold.
  return (
    <article>
      <section className="gap-4 space-y-6">
      {/* LØB "map" IGENNEM GRUPPEREDE EVENTS */}
            {/* //Object.entries() konverterer groupedItems til et array af [eventId, group].
          //Laver map() over disse for at gengive hver event-gruppe. */}
        {Object.entries(groupedItems).map(([eventId, group]) => (
          // Wrapper til hver gruppe
          <div key={eventId} className="border-b pb-4">

            <h4 className="font-semibold mt-5">{group.eventTitle}</h4>
            
            {/* For hver billet: "map" lav en 2-kolonne grid til info og handlinger. */}
            {group.tickets.map((item) => (
              <div key={item.id} className="grid grid-cols-2 items-center">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="font-light">Pris {item.price} DKK</p>
                </div>


                {/* Wrapper til Stepper + kryds */}
                <div className="justify-self-start sm:justify-self-end flex items-center-safe">
                  {/* Stepper-komponenten:
                          Lader brugeren ændre antal billetter.
                          Kalder "updateItemQuantity" direkte på store’s state med det nye antal. */}
                <Stepper
                  itemId={item.id}
                  quantity={item.quantity}
                  onQuantityChange={(newQty) => {
                    useCartStore.getState().updateItemQuantity(item.id, item.eventId, newQty);
                  }}
                  item={{
                    id: item.id,
                    name: item.name,
                    price: item.price,
                    eventId: item.eventId,
                    eventTitle: item.eventTitle,
                    remainingTickets: item.remainingTickets,
                    bookedTickets: item.bookedTickets,
                  }}
                  remainingTickets={item.remainingTickets}
                  />
                  {/* //kryds der kalder på removeItem fra cardStore og fjerner billetterne. */}
                    <RxCross2 size={30} width={20} 
                    onClick={() => removeItem(item.id, item.eventId)} 
                    className="hover:text-red-600 transition cursor-pointer ml-2" />
                </div>
              </div>
            ))}
            {/* Knap der viser direkte tilbage til billettens eventside */}
            <Link href={`/event/${eventId}`}>
              <button className="mt-2 text-sm text-[#C4FF00] underline hover:opacity-80 hover:cursor-pointer">Gå til event</button>
            </Link>
          </div>
        ))}
        <div className="flex items-center gap-4 mt-5">
          {/* Viser den totale pris for alle billetterne */}
          <h4 className="font-semibold ml-auto">Total: {getTotalPrice()} DKK</h4>
        </div>
      </section>
    </article>
  );
};

export default Price;
