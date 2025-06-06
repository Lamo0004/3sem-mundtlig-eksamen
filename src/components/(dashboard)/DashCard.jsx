import Image from "next/image";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { da } from "date-fns/locale";
import { useState } from "react";
import { FaPen } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { deleteEvent } from "@/api/events";
import Popup from "@/components/Popup";
import artPlaceholder from "@/images/artPlaceholder.png";

const DashCard = ({ event }) => {
  const [showPopup, setShowPopup] = useState(false); // styrer om popup vises

  const handleDeleteConfirmed = async () => {
    try {
      await deleteEvent(event.id);
      window.location.reload();
    } catch (error) {
      alert("Noget gik galt under sletning.");
    }
  };

  const imageUrl = event.thumbnailImage || artPlaceholder.src || artPlaceholder;

  return (
    <div className="relative aspect-[3/2] group w-full">
      <Link href={`/event/${event.id}`}>
        <Image src={imageUrl} alt={`Eventbillede: ${event.title}`} width={300} height={200} className="w-full h-full object-cover transition duration-300 hover:opacity-40" unoptimized={typeof imageUrl === "string" && imageUrl.startsWith("http")} />
      </Link>

      <div className="mt-4 px-2 space-y-1">
        <div className="flex justify-between items-center">
          <Link href={`/event/${event.id}`}>
            <h4 className="text-black font-semibold break-words hyphens-auto">{event.title}</h4>
          </Link>
          <div className="flex gap-4">
            {/* Når popup'en klikkes vises popup'en */}
            <button onClick={() => setShowPopup(true)} className="cursor-pointer text-red-600 hover:text-red-800" aria-label="Slet event">
              <FaTrashCan size={20} />
            </button>

            <Link href={`/editEvent/${event.id}`} className="text-black hover:text-[#C4FF00]" aria-label="Rediger event">
              <FaPen size={20} />
            </Link>
          </div>
        </div>
        <p className="text-black font-medium">{format(parseISO(event.date), "d. MMMM yyyy", { locale: da })}</p>
      </div>

      {/* Her viser vi din popup hvis showPopup er true */}
      {showPopup && (
        <Popup
          message="Er du sikker på, at du vil slette dette event?"
          onClose={() => setShowPopup(false)} // Luk popup
          onConfirm={() => {
            handleDeleteConfirmed(); // Slet event
            setShowPopup(false); // Luk popup bagefter
          }}
          showConfirm={true} // Vi vil gerne vise "Ja, slet"
          confirmText="Ja, slet"
          cancelText="Annuller"
        />
      )}
    </div>
  );
};

export default DashCard;
