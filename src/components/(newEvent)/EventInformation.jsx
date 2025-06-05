"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { getArts } from "@/api/smk";
import { getEvents } from "@/api/events";
import { filterArtworksByPeriod } from "@/api/periods";
import { handleEventAction } from "@/lib/eventHelpers"; // Håndterer oprettelse og opdatering af events

import ArtworkGrid from "./ArtworkGrid";
import arrowLong from "@/images/arrowLong.svg";
import { SearchBar } from "./SearchBar";
import EventForm from "./EventForm";

export default function EventInformation({ date, location, period, defaultData = {}, mode = "create", onSubmit }) {
  const [allArtworks, setAllArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(""); //Toast effekt

  const router = useRouter();
  const { user } = useUser(); //giver adgang til allerede loggede ind brugere.

  const [eventName, setEventName] = useState(defaultData.title || "");
  const [eventDescription, setEventDescription] = useState(defaultData.description || "");
  const [selectedArtworks, setSelectedArtworks] = useState(defaultData.artworkIds || []);

  // Hent alle værker én gang og sættes i allArtworks
  useEffect(() => {
    setLoading(true);
    getArts()
      .then((data) => setAllArtworks(data))
      .catch(() => {
        alert("Der opstod en fejl ved hentning af kunstværker. Prøv igen senere.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtrer værker, når perioden ændrer sig
  useEffect(() => {
    if (!period || allArtworks.length === 0) return;
    const filtered = filterArtworksByPeriod(allArtworks, period);
    setFilteredArtworks(filtered);
  }, [period, allArtworks]);

  // Filtrer kunstværker yderligere efter tilgængelighed ift. events på samme dato
  useEffect(() => {
    const filterArtworksByAvailability = async () => {
      if (!period || !date || !location || allArtworks.length === 0) return;
      setLoading(true);
      try {
        // Filtrer først alle værker, så kun de fra den valgte periode er med
        const periodFiltered = filterArtworksByPeriod(allArtworks, period);
        // Hent alle events
        const allEvents = await getEvents();
        // Find events på samme dato som den valgte dato
        const sameDateEvents = allEvents.filter((event) => event.date === date);
        // Find alle kunstværker, der er booket på andre lokationer end den valgte, samme dato
        const conflictingArtworks = sameDateEvents.filter((event) => event.locationId !== location.id).flatMap((event) => event.artworkIds);
        // Fjern de konflikterende kunstværker fra de værker, som er fra perioden
        const availableArtworks = periodFiltered.filter((art) => !conflictingArtworks.includes(art.object_number));

        // Sæt de filtrerede og tilgængelige værker som de værker, der vises
        setFilteredArtworks(availableArtworks);
      } finally {
        setLoading(false);
      }
    };
    filterArtworksByAvailability();
  }, [period, date, location, allArtworks]);

  const [artworkToast, setArtworkToast] = useState(null); // fx string besked

  // Funktion til at vælge og fravælge kunstværker
  const toggleArtwork = (objectNumber) => {
    setSelectedArtworks((prev) => {
      if (prev.includes(objectNumber)) {
        setArtworkToast("Værk fjernet");
        return prev.filter((i) => i !== objectNumber);
      } else {
        const maxArtwork = location?.maxArtworks;
        if (prev.length >= maxArtwork) {
          setArtworkToast(`Maks antal på ${maxArtwork} værker nået`);
          return prev;
        }
        setArtworkToast("Værk valgt");
        return [...prev, objectNumber];
      }
    });
  };

  const [searchTerm, setSearchTerm] = useState("");

  // Filtrer og sorterer værker baseret på søgetekst (kunstner)
  const displayedArtworks = searchTerm
    ? filteredArtworks.filter((art) => {
        // Sikre at art.artist er et array
        const artistNames = Array.isArray(art.artist) ? art.artist : [];
        // Gemmer searchterm i lowercase
        const search = searchTerm.toLowerCase();

        // Tjekker om nogen af kunstnernavnene matcher søgetermen
        return artistNames.some((name) => {
          // Hvis navnet ikke er en streng (fx null, tal, etc.), ignorer det
          if (typeof name !== "string") return false;
          // Lowercaser navnet og tjekker om søgetermen indgår
          return name.toLowerCase().includes(search);
        });
      })
    : filteredArtworks;

  // Fjern artwork toasten automatisk efter 1.5 sekunder
  useEffect(() => {
    if (artworkToast) {
      const timer = setTimeout(() => setArtworkToast(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [artworkToast]);

  // Event håndtering: Opret eller opdater event
  // Samler alt data om event i eventInfo
  const handleMakeNewEvent = () => {
    const eventInfo = {
      title: eventName,
      description: eventDescription,
      date,
      locationId: location.id,
      artworkIds: selectedArtworks,
      period: period?.id,
      totalTickets: location.maxTickets,
    };

    // Kalder funktion som opretter eller opdaterer baseret på mode ("create" eller "edit"). Her håndteres også success-feedback (toast)
    handleEventAction({
      mode,
      onSubmit,
      user,
      router,
      eventInfo,
      setShowSuccess,
    });
  };

  return (
    <div className="space-y-8 mt-8">
      <h3 className="text-center">STEP 2: Information om dit event</h3>

      <div className="md:grid md:grid-cols-[1fr_2fr] gap-space-l">
        <EventForm eventName={eventName} setEventName={setEventName} eventDescription={eventDescription} setEventDescription={setEventDescription} selectedArtworks={selectedArtworks} location={location} filteredArtworks={filteredArtworks} toggleArtwork={toggleArtwork} />

        <div>
          {loading ? (
            <p className="text-center text-gray-400">Henter værker...</p>
          ) : (
            <>
              <div className="relative w-[400px] my-4 md:place-self-end">
                <SearchBar onSearch={setSearchTerm} />
              </div>

              {selectedArtworks.length === location?.maxArtworks && <p className="text-sm text-red-500">Du har valgt maks antal værker.</p>}

              <ArtworkGrid artworks={displayedArtworks} selectedArtworks={selectedArtworks} toggleArtwork={toggleArtwork} location={location} />
            </>
          )}
        </div>
        {artworkToast && <div className="fixed bottom-6 right-6 bg-[#6b5f6e] text-white px-4 py-2 rounded shadow-lg z-50 transition-all">{artworkToast}</div>}
      </div>
      <div className="flex justify-end">
        <button className="group inline-block text-[#C4FF00] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50" onClick={handleMakeNewEvent} disabled={!eventName || !eventDescription || selectedArtworks.length === 0}>
          <span className="inline-flex flex-col">
            <span className="text-4xl font-bold px-8">{mode === "edit" ? "Gem ændringer" : "Opret event"}</span>
            <Image src={arrowLong} alt="pil" className="self-end transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" loading="lazy" />
          </span>
        </button>
      </div>

      {/* SuccessToast */}
      {showSuccess && <div className="fixed top-6 right-6 bg-[#C4FF00] text-black px-4 py-2 rounded shadow-lg z-50 transition-all">{showSuccess}</div>}
    </div>
  );
}
