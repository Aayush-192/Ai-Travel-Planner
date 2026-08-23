import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { IoIosSend } from "react-icons/io";
import { getPlacePhotoUrl } from "@/service/globalApi";

export const InfoSection = ({ trip }) => {
  const [photoUrl, setPhotoUrl] = useState();

  useEffect(() => {
    if (trip?.userSelection?.location?.label) {
      getPlacePhotoUrl(trip.userSelection.location.label).then(url => setPhotoUrl(url));
    }
  }, [trip]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3  ">
            <h2 className="p-1 px-1 md:px-3 bg-gray-200 rounded-full text-gray-500">
              📅 {trip?.userSelection?.noOfDays} Days
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500">
              💰 {trip?.userSelection?.budget} Budget
            </h2>
            <h2 className="p-1 px-3 bg-gray-200 rounded-full text-gray-500">
              🧳 No. Of Traveler: {trip?.userSelection?.traveller}
            </h2>
          </div>
        </div>
        <Button>
          <IoIosSend />
        </Button>
      </div>
    </div>
  );
};
