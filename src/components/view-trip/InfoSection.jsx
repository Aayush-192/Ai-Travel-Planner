import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IoIosSend } from "react-icons/io";
import { getPlacePhotoUrl } from "@/service/globalApi";
import { db } from "@/service/firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

export const InfoSection = ({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      getPlacePhotoUrl(trip.userSelection.location.label).then((url) =>
        setPhotoUrl(url)
      );
    }
  }, [trip]);

  const handleShare = async () => {
    try {
      // 1. Make trip public in Firestore so others can view it
      if (trip?.id) {
        await updateDoc(doc(db, "trips", trip.id), {
          isPublic: true,
        });
      }

      // 2. Create the shareable URL
      const shareUrl = window.location.href;

      // 3. Use native share if available, otherwise copy to clipboard
      if (navigator.share) {
        await navigator.share({
          title: "Check out my AI Travel Plan!",
          text: `Check out this trip to ${trip?.userSelection?.location?.label} created with AI Travel Planner!`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Trip link copied!");
      }
    } catch (error) {
      console.error("Share error:", error);
      toast.error("Unable to share trip");
    }
  };

  return (
    <div>
      <img
        src={photoUrl}
        className="h-[300px] w-full object-cover rounded-xl"
      />
      <div className="flex justify-between items-center">
        <div className="my-5 flex flex-col gap-2">
          <h2 className="font-bold text-2xl">
            {trip?.userSelection?.location?.label}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
            <h2 className="p-1 px-1 md:px-3 bg-gray-200 rounded-full text-gray-500 text-sm">
              📅 {trip?.userSelection?.noOfDays} Days
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-sm">
              💰 {trip?.userSelection?.budget} Budget
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500 text-sm">
              🧳 No. Of Traveler: {trip?.userSelection?.traveller}
            </h2>
          </div>
        </div>

        <Button onClick={handleShare} className="flex gap-2 items-center">
          <IoIosSend className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};