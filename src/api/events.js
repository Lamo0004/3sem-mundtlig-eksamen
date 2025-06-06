// // *********** LOCALHOST ***********

// // //Denne henter dummy events fra Dannie
// export async function getEvents() {
//   const events = await fetch("http://localhost:8080/events", {}).then((res) => res.json());
//   return events;
// }

// // //Denne henter dummy locations fra Dannie
// export async function getLocations() {
//   const locations = await fetch("http://localhost:8080/locations", {
//     next: {
//       revalidate: 3600,
//     },
//   }).then((res) => res.json());
//   return locations;
// }

// // //Denne henter dummy dates fra Dannie
// export async function getDates() {
//   const dates = await fetch("http://localhost:8080/dates", {
//     next: {
//       revalidate: 3600,
//     },
//   }).then((res) => res.json());
//   return dates;
// }

// export async function makeNewEvent({ title, description, date, locationId, artworkIds, userId, period }) {
//   const response = await fetch("http://localhost:8080/events", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ title, description, date, locationId, artworkIds, userId, period }),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Fejlstatus:", response.status, errorText);
//     throw new Error(errorText); // sender den rigtige besked videre
//   }

//   return response.json();
// }

// // //Funktionen sender en PUT-request til det rigtige endpoint med antallet billetter i body.
// export async function updateTickets({ id, tickets }) {
//   const response = await fetch(`http://localhost:8080/events/${id}/book`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ tickets }),
//   });

//   return response.json();
// }

// export async function updateEvent({ id, ...updatedFields }) {
//   const response = await fetch(`http://localhost:8080/events/${id}`, {
//     method: "PATCH",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(updatedFields),
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Fejl ved opdatering:", errorText);
//     throw new Error("Event kunne ikke opdateres");
//   }

//   return response.json();
// }

// export async function deleteEvent(id) {
//   const response = await fetch(`http://localhost:8080/events/${id}`, {
//     method: "DELETE",
//   });

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Fejl ved sletning:", errorText);
//     throw new Error("Event kunne ikke slettes");
//   }

//   return response.json();
// }

// // Henter én specifik event baseret på ID
// export async function getEventById(id) {
//   const response = await fetch(`http://localhost:8080/events/${id}`);

//   if (!response.ok) {
//     const errorText = await response.text();
//     console.error("Fejl ved hentning af event:", errorText);
//     throw new Error("Event kunne ikke hentes");
//   }

//   return await response.json();
// }

// ********* RENDER ***********

// //Denne henter events fra vores fjernserver på Render
export async function getEvents() {
  const events = await fetch("https://smk-4l23.onrender.com/events", {}).then((res) => res.json());
  return events;
}

// Denne henter locations fra vores fjernserver på Render
export async function getLocations() {
  const locations = await fetch("https://smk-4l23.onrender.com/locations", {
    next: {
      revalidate: 3600,
    },
  }).then((res) => res.json());
  return locations;
}

//Denne henter dummy dates fra Dannie
export async function getDates() {
  const dates = await fetch("https://smk-4l23.onrender.com/dates", {
    next: {
      revalidate: 3600,
    },
  }).then((res) => res.json());
  return dates;
}

export async function makeNewEvent({ title, description, date, locationId, artworkIds, userId, period }) {
  const response = await fetch("https://smk-4l23.onrender.com/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, date, locationId, artworkIds, userId, period }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fejlstatus:", response.status, errorText);
    throw new Error(errorText); // sender den rigtige besked videre
  }

  return response.json();
}

//Funktionen sender en PUT-request til det rigtige endpoint med antallet billetter i body.
export async function updateTickets({ id, tickets }) {
  const response = await fetch(`https://smk-4l23.onrender.com/events/${id}/book`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tickets }),
  });

  return response.json();
}

export async function updateEvent({ id, ...updatedFields }) {
  const response = await fetch(`https://smk-4l23.onrender.com/events/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedFields),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fejl ved opdatering:", errorText);
    throw new Error("Event kunne ikke opdateres");
  }

  return response.json();
}

export async function deleteEvent(id) {
  const response = await fetch(`https://smk-4l23.onrender.com/events/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fejl ved sletning:", errorText);
    throw new Error("Event kunne ikke slettes");
  }

  return response.json();
}

// Henter én specifik event baseret på ID
export async function getEventById(id) {
  const response = await fetch(`https://smk-4l23.onrender.com/events/${id}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Fejl ved hentning af event:", errorText);
    throw new Error("Event kunne ikke hentes");
  }

  return await response.json();
}
