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
import Popup from "../Popup";

export default function EventInformation({ date, location, period, defaultData = {}, mode = "create", onSubmit }) {
  const [allArtworks, setAllArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(""); //Toast effekt
  const [showPopup, setShowPopup] = useState(false); //Popup (fslse) fordi den er skjult

  const router = useRouter();
  const { user } = useUser(); //giver adgang til allerede loggede ind brugere.

  const [eventName, setEventName] = useState(defaultData.title || "");
  const [eventDescription, setEventDescription] = useState(defaultData.description || "");
  const [selectedArtworks, setSelectedArtworks] = useState(defaultData.artworkIds || []);
  const tooManyArtworks = selectedArtworks.length > location?.maxArtworks;

  // selectedArtworks er kun en liste af object_number
  // Her laver vi en liste med de fulde værk-objekter fra allArtworks
  // Så vi kan vise fx billede, titel og kunstner op de valgte værker.
  const selectedArtworksFull = allArtworks.filter((art) => selectedArtworks.includes(art.object_number));

  // Hent alle værker én gang når komponenten loader og sættes i allArtworks
  useEffect(() => {
    setLoading(true); //viser "loading" mens der hentes
    getArts()
      .then((data) => setAllArtworks(data))
      .catch(() => {
        alert("Der opstod en fejl ved hentning af kunstværker. Prøv igen senere.");
      })
      .finally(() => setLoading(false));
  }, []);

  //Når burgeren vælger en periode, eller når kunstværker er hentet
  // Filtrer kunstværker, så vi kun viser dem der hører til  perioden
  useEffect(() => {
    if (!period || allArtworks.length === 0) return;   // Hvis der ikke er valgt periode eller ingen værker endnu -> gør ingenting
    const filtered = filterArtworksByPeriod(allArtworks, period);
    setFilteredArtworks(filtered); // Gem filtrerede værker til visning.
  }, [period, allArtworks]);

  // Filtrer kunstværker yderligere efter tilgængelighed ift. events på samme dato
  useEffect(() => {
    const filterArtworksByAvailability = async () => {

      //Vent til periode, dato, lokation og værker er klar -> hvis noget mangler gør ingenting
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

        // Laver en liste med de valgte værker som hele objekter (fra allArtworks)
        // Så vi kan vise billede, titel osv. for valgte værker (fx i popup eller grid)
        const selectedArtworksFull = allArtworks.filter((art) => selectedArtworks.includes(art.object_number));

        // Kombiner valgte værker + de filtrerede tilgængelige værker
        const combinedArtworks = [...selectedArtworksFull, ...availableArtworks.filter((art) => !selectedArtworks.includes(art.object_number))];

        // Sæt de filtrerede og tilgængelige værker som de værker, der vises
        setFilteredArtworks(combinedArtworks);
      } finally {
        setLoading(false);
      }
    };

    // Hver gang periode, dato, lokation eller allArtworks ændres:
    // -> filtrer værkerne igen, så vi kun viser værker som er ledige op den valgte dato og lokation.
    filterArtworksByAvailability();
  }, [period, date, location, allArtworks]);

  const [artworkToast, setArtworkToast] = useState(null); // fx string besked

  // Funktion til at vælge og fravælge kunstværker
  const toggleArtwork = (objectNumber) => {
    setSelectedArtworks((prev) => {
      let updated;

      // Tjekker om værket allerede er valgt (findes i listen prev)
      if (prev.includes(objectNumber)) {

        // Hvis ja: vis en toast-besked om at værket et fjernet
        setArtworkToast("Værk fjernet");

        // Fjern værket fra listen -> lav en ny liste uden dette værk
        updated = prev.filter((i) => i !== objectNumber);
      } else {

        //Hent maks antal værker der må vælges for denne lokation
        const maxArtwork = location?.maxArtworks;

        // Tjek om vi allerede har valgt maks antal værker
        if (prev.length >= maxArtwork) {

          //Hvis ja: vis toast om at maks antal værker et nået
          setArtworkToast(`Maks antal på ${maxArtwork} værker nået`);

          // Gør ingenting -> behold eksisterende liste uændret
          return prev;
        }

        // Hvis vi stadig kan vælge flere: vis tiast om at værket er valgt
        setArtworkToast("Værk valgt");

        // Tilføj værket til listen -> lav ny liste med det valgte værk tilføjet
        updated = [...prev, objectNumber];
      }

      // Ryd fejl, hvis der nu er mindst ét værk valgt
      if (updated.length > 0 && formErrors.artworks) {
        setFormErrors((prevErrors) => ({ ...prevErrors, artworks: false }));
      }

      return updated;
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

  useEffect(() => {
    if (location && selectedArtworks.length > location.maxArtworks) {
      setShowPopup(true); //Viser popup'en med at der er for mange valgt værker på den nye lokation.
    } else {
      setShowPopup(false); //Skjuler vores popup hvis der IKKE er for mange valgte værker på den nye lokation.
    }
  }, [location, selectedArtworks]);

  const [showValidationPopup, setShowValidationPopup] = useState(false);

  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
    artworks: false,
  });

  // Event håndtering: Opret eller opdater event
  // Samler alt data om event i eventInfo
  const handleMakeNewEvent = () => {
    const nameEmpty = eventName.trim() === "";
    const descEmpty = eventDescription.trim() === "";
    const noArtworks = selectedArtworks.length === 0;

    if (nameEmpty || descEmpty || noArtworks) {
      setFormErrors({
        name: nameEmpty,
        description: descEmpty,
        artworks: noArtworks,
      });
      setShowValidationPopup(true);
      return;
    }

    setFormErrors({
      name: false,
      description: false,
      artworks: false,
    });

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
        <EventForm eventName={eventName} setEventName={setEventName} eventDescription={eventDescription} setEventDescription={setEventDescription} formErrors={formErrors} setFormErrors={setFormErrors} selectedArtworks={selectedArtworks} location={location} filteredArtworks={filteredArtworks} toggleArtwork={toggleArtwork} />

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
        <button className="group inline-block text-[#C4FF00] cursor-pointer" onClick={handleMakeNewEvent} disabled={!eventName || !eventDescription || selectedArtworks.length === 0}>
          <span className="inline-flex flex-col">
            <span className="text-4xl font-bold px-8">{mode === "edit" ? "Gem ændringer" : "Opret event"}</span>
            <Image src={arrowLong} alt="pil" className="self-end transition-transform group-hover:translate-x-1 group-disabled:translate-x-0" />
          </span>
        </button>
      </div>

      {showPopup && (
        <Popup
          message={
            <>
              Du har valgt {selectedArtworks.length} værker, men lokationen tillader kun {location?.maxArtworks} værker.
              <br />
              Fravælg venligst <strong>{selectedArtworks.length - location?.maxArtworks}</strong> værker.
            </>
          }
          onClose={() => setShowPopup(false)}
          showConfirm={false}
          selectedArtworks={selectedArtworksFull}
          toggleArtwork={toggleArtwork}
          tooManyArtworks={tooManyArtworks}
        />
      )}

      {/* SuccessToast */}
      {showSuccess && <div className="fixed top-6 right-6 bg-[#C4FF00] text-black px-4 py-2 rounded shadow-lg z-50 transition-all">{showSuccess}</div>}
      {/* Ikke succes pop up */}
      {showValidationPopup && <Popup message="Du skal udfylde alle felter." onClose={() => setShowValidationPopup(false)} showConfirm={false} />}
    </div>
  );
}
