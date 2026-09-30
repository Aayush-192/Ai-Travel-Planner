import { getPlacePhotoUrl } from "@/service/globalApi";
import { db } from "@/service/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export const MyTripCard = ({ item }) => {
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const fetchPhoto = async () => {
      const location = item?.userSelection?.location?.label;

      if (!location) return;

      try {
        const url = await getPlacePhotoUrl(location);
        setPhotoUrl(url || "");
      } catch (error) {
        console.error("Error fetching photo:", error);
      }
    };

    fetchPhoto();
  }, [item]);

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!item?.id) {
      toast.error("Trip ID is missing");
      console.error("item:", item);
      return;
    }

    try {
      // Update Firestore
      const tripRef = doc(db, "trips", item.id);

      await updateDoc(tripRef, {
        isPublic: true,
      });

      // Create public trip URL
      const shareUrl = `${window.location.origin}/view-trip/${item.id}`;

      // Native share
      if (navigator.share) {
        await navigator.share({
          title: "My Travel Trip",
          text: `Check out my trip to ${
            item?.userSelection?.location?.label || "this destination"
          }`,
          url: shareUrl,
        });

        return;
      }

      // Clipboard fallback
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Trip link copied!");
        return;
      }

      // Final fallback
      window.prompt("Copy this trip link:", shareUrl);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Share error:", error);
      toast.error(error?.message || "Unable to share trip");
    }
  };

  if (!item) {
    return null;
  }

  return (
    <div className="border rounded-lg hover:scale-105 transition-all hover:shadow-md h-[250px] p-2 flex flex-col justify-between">
      <Link to={`/view-trip/${item.id}`} className="block">
        <img
          src={photoUrl}
          alt={
            item?.userSelection?.location?.label ||
            "Trip destination"
          }
          className="rounded-t-md object-cover w-full h-[130px]"
        />

        <div className="flex flex-col gap-1">
          <h2 className="font-bold text-lg truncate">
            {item?.userSelection?.location?.label ||
              "Unknown destination"}
          </h2>

          <h2 className="text-sm text-gray-500">
            {item?.userSelection?.noOfDays || 0} Days trip with{" "}
            {item?.userSelection?.budget || "N/A"} budget
          </h2>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleShare}
        className="mt-1 w-full bg-primary text-primary-foreground rounded-md px-4 py-1.5 text-sm hover:bg-primary/90"
      >
        Share Trip
      </button>
    </div>
  );
};
