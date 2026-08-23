import { getPlacePhotoUrl } from "@/service/globalApi";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const MyTripCard = ({ item, index }) => {
  // console.log(item)
  const [photoUrl, setPhotoUrl] = useState();
  useEffect(() => {
    if (item?.userSelection?.location?.label) {
      getPlacePhotoUrl(item.userSelection.location.label).then(url => setPhotoUrl(url));
    }
  }, [item]);
  return (
    <Link to={`/view-trip/${item.id}`}>
      <div className="border rounded-lg hover:scale-105 transition-all hover:shadow-md h-[250px]">
        <img
          src={photoUrl}
          className="rounded-t-md object-cover w-full h-[130px]"
        />
        <div>
          <h2 className="font-bold text-lg">
            {item?.userSelection?.location?.label}
          </h2>
          <h2 className="text-sm text-gray-500">
            {item?.userSelection?.noOfDays} Days trip with
            {item?.userSelection?.budget} budget{" "}
          </h2>
        </div>
      </div>
    </Link>
  );
};
