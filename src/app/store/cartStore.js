"use client";
//Fortæller Next.js at dette er en Client Component / Client-side module, fordi Zustand bruges på klienten

//create bruges til at oprette en Zustand store.
import { create } from "zustand";
//"persist" er middleware, som gemmer state i "localStorage", så data ikke forsvinder ved refresh.
import { persist } from "zustand/middleware";

//DENNE: cartStore-fil, som bruger Zustand med "persist middleware" til at gemme data i browserens "localStorage"


//Oprettelse af Zustand store med persist
  //Starter oprettelsen af din store. cartStore bliver det objekt du eksporterer og bruger.
const cartStore = create(
  //Persist søger for at kurven gemmes i browserens localstorage.
  persist(
    //"set" bruges til at ændre state, "get" bruges til at læse nuværende state
    (set, get) => ({
      //items er arrayet med alle valgte billetter i kurven
      items: [], 
      
//Funktion til at tilføje én billet.
//Henter nuværende items fra state
      addItem: (item) => {
        const { items } = get();

        // Udregner samlet antal billetter for dette event. Bruges til at kontrollere om man overskrider "remainingTickets"
        const totalQuantityForEvent = items.filter((i) => i.eventId === item.eventId).reduce((sum, i) => sum + i.quantity, 0);

        //Hvis man prøver at tilføje flere billetter end der er tilbage, vis alert og stop.
        if (totalQuantityForEvent >= item.remainingTickets) {
          alert("Der er ikke flere billetter tilgængelige for dette event.");
          return;
        }

        // Tjekker om billetten allerede findes i kurven (samme id og eventId)
        const existingItem = items.find((i) => i.id === item.id && i.eventId === item.eventId);

        //Hvis billetten findes: øg quantity med 1.
        if (existingItem) {
          set({
            items: items.map((i) => (i.id === item.id && i.eventId === item.eventId ? { ...i, quantity: i.quantity + 1 } : i)),
          });

          //Hvis ikke: tilføj den som ny med quantity: 1
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      //Funktion til at tilføje flere billetter i ét hug
      //Denne bliver kaldt når bruger klikker på "Tilføj til kurv"
      addToCart: (itemsToAdd) => {
        const { items } = get();
        const newItems = [...items];
      
        //Loop igennem hvert nyt item som skal tilføjes
        for (const newItem of itemsToAdd) {

          //Samme kontrol: tjek om tilføjelsen vil overstige antallet af tilgængelige billetter
          const totalQuantityForEvent = newItems
            .filter((i) => i.eventId === newItem.eventId)
            .reduce((sum, i) => sum + i.quantity, 0);

            //Hvis man prøvet at overstige kommer alert.
          if (totalQuantityForEvent + newItem.quantity > newItem.remainingTickets) {
            alert("Der er ikke flere billetter tilgængelige for dette event.");
            continue; // spring over
          }

          const existingIndex = newItems.findIndex(
            (i) => i.id === newItem.id && i.eventId === newItem.eventId
            );
            
            //Hvis billetten allerede findes: læg quantity til.
            //Ellers: tilføj som ny.
          if (existingIndex !== -1) {
            newItems[existingIndex].quantity += newItem.quantity;
          } else {
            newItems.push({ ...newItem });
          }
        }
      
        //Opdater items med de nye værdier.
        set({ items: newItems });
      },

      //Opdaterer antallet af en bestemt billet i kurven
      updateItemQuantity: (id, eventId, newQuantity) => {
        const { items } = get();

        // Find billetten i kurven. Hvis ikke fundet: afbryd
        const itemToUpdate = items.find((item) => item.id === id && item.eventId === eventId);
        if (!itemToUpdate) return;

        // Tæl alle billetter for eventet uden den vi forsøger at opdatere.
        //Dette sikrer at vi ikke overskrider totalen, selv hvis den ene billet reduceres/øges.
        const totalQuantityExcludingCurrent = items
        .filter((i) => i.eventId === eventId && !(i.id === id))
        .reduce((sum, i) => sum + i.quantity, 0);

        // Hvis den nye ønskede quantity overstiger remainingTickets, bloker
        if (totalQuantityExcludingCurrent + newQuantity > itemToUpdate.remainingTickets) {
          alert("Der er ikke flere billetter tilgængelige for dette event.");
          return;
        }

        //Hvis newQuantity === 0, fjern billetten.
        //Ellers: opdater med ny quantity.
        if (newQuantity === 0) {
          set({
            items: items.filter((item) => !(item.id === id && item.eventId === eventId)),
          });
        } else {
          set({
            items: items.map((item) => (item.id === id && item.eventId === eventId ? { ...item, quantity: newQuantity } : item)),
          });
        }
      },
      //Fjerner én bestemt billet-type (baseret på både id og eventId).
      removeItem: (id, eventId) => {
        const { items } = get();
        set({
          items: items.filter((item) => !(item.id === id && item.eventId === eventId)),
        });
      },

      // Nulstiller hele kurven (bruges efter køb).
      clearCart: () => set({ items: [] }),
    }),
    //Gemmer data i localStorage under key "storage".
    { name: "storage" }
  )
);

//Eksporterer din Zustand store så du kan bruge den i komponenter via useCartStore().
export default cartStore;
