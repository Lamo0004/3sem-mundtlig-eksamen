"use client";
import EventInformation from "@/components/(newEvent)/EventInformation";
import Header from "@/components/(header)/Header";
import EventFilters from "@/components/(newEvent)/EventFilters";

import { use, useEffect, useState } from "react";

import { getEvents, updateEvent } from "@/api/events";
import { getPeriodById } from "@/api/periods";

const EditEventPage = ({ params }) => {
  const { id } = use(params); //Vi henter eventets ID ud fra URL'en

  //Vi laver state til at gemme info om eventet:periode, dato og lokation.
  const [event, setEvent] = useState(null); //Her gemmes eventet
  const [period, setPeriod] = useState(null); //Her gemmes kunstperioden
  const [date, setDate] = useState(null); //Her gemmes datoen
  const [location, setLocation] = useState(null); //Her gemmes lokationen

  //Vi gemer eventets info, dato, loaktion og kunstperiode i state, så vi kan se og redigere det.
  useEffect(() => {
    const fetchData = async () => {
      const events = await getEvents(); //Henter alle events
      const found = events.find((e) => e.id === id); //Find det event vi vil redigere
      if (!found) return; //Hvis vi ikke fandt det, gør vi ikke mere.

      // Find lokationen som objekt.
      // Hvis eventet allerede har en lokation brug den, hvis ikke skrive "ukendt lokation"
      const locationObj = found.location || {
        id: found.locationId,
        name: "Ukendt lokation",
        maxArtworks: 6, //Det mindste antal værker der kan være på en lokation.
      };

      setEvent({
        ...found, //...found betyder --> Tag alt fra det fundne event.
        location: locationObj, //Vi overskriver location og søger for at location er sat til vores locationObj
      });

      //Vi gememr eventets dato og loaktion i state
      //Så vi kan vise dem i felterne på siden og gøre dem redigerbare - de kan skiftes ud.
      setDate(found.date);
      setLocation(locationObj);

      const matchedPeriod = getPeriodById(found.period); //Vi finder hvilken kunstperiode eventet har (ud fra periode-id)
      setPeriod(matchedPeriod ?? null); //Hvis der ikke findes en matchende periode, sætter vi "null"
    };

    fetchData(); //Vi kalder fetchData() for at hente eventets data.
  }, [id]); //Denne useEffect kører hver gang id'et ændre sig (fx når vi åbner eb ny rediger-side).

  const handleUpdate = async (updatedFields) => {
    //asynkorn funktion "handleUpdate" får "updatedFields" som input/prop
    try {
      //Vi kalder funktionen updateEvent, der sender data til serveren
      await updateEvent({ id, ...updatedFields });
      // (id=eventets id så serveren ved hvilket evenet der skal opdateres.
      // updatedFields = er alle de ændringer brugeren har lavet.)
    } catch (err) {
      alert("Noget gik galt under opdatering af event");
    }
  };

  //Hvis eventet ikke er hentet (event er null), viser vi "indlæser event...".
  if (!event) return <p className="text-center mt-12">Indlæser event...</p>;

  return (
    <div className="max-w-6xl mx-auto">
      <title>Rediger event</title>
      <Header />
      <h1 className="text-3xl font-bold text-center my-8">Rediger event</h1>
      <EventFilters date={date} setDate={setDate} location={location} setLocation={setLocation} period={period} setPeriod={setPeriod} />

      <EventInformation mode="edit" defaultData={event} date={date} location={location} period={period} setPeriod={setPeriod} onSubmit={handleUpdate} />
    </div>
  );
};

export default EditEventPage;
