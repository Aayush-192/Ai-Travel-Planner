import { Navbar } from "@/components/common/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  selectBudgetOptions,
  SelectTravelsList,
} from "@/constants/options";
import { generateTravelPlan } from "@/service/AIModal";
import { getGeoapifyAutocomplete } from "@/service/globalApi";
import React, { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "@/service/firebaseConfig";
import { Loading } from "@/components/common/Loading";
import { useNavigate } from "react-router-dom";

export const CreateTrip = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLocationInput = (e) => {
    const text = e.target.value;

    setInputValue(text);
    setShowDropdown(false);
    setSuggestions([]);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (text.trim().length < 2) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoadingSuggestions(true);

      try {
        const res = await getGeoapifyAutocomplete(text);

        const results = (
          res.data?.features || []
        ).map((feature) => feature.properties);

        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (error) {
        console.error("Geoapify error:", error);
      } finally {
        setIsLoadingSuggestions(false);
      }
    }, 300);
  };

  const handleSelectSuggestion = (item) => {
    const location = {
      label: item.formatted,
      city: item.city || item.name || item.formatted,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
      place_id: item.place_id,
    };

    setInputValue(item.formatted);
    setShowDropdown(false);
    setSuggestions([]);

    handleInputChange("location", location);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      console.log("Firebase user:", user);
      console.log("Firebase UID:", user.uid);
      console.log("Firebase email:", user.email);

      localStorage.setItem(
        "user",
        JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      );

      setOpenDialog(false);

      // Now that auth is confirmed, proceed with trip generation
      await generateTrip();
    } catch (error) {
      console.error("Firebase Google login error:", error);
      toast("Google login failed.");
    }
  };

  const generateTrip = async () => {
    const user = localStorage.getItem("user");

    if (!user) {
      setOpenDialog(true);
      return;
    }

    const days = parseInt(formData?.noOfDays);

    if (
      !formData?.noOfDays ||
      isNaN(days) ||
      days < 1 ||
      days > 5
    ) {
      toast("Number of days should be between 1 and 5.");
      return;
    }

    if (!formData?.location) {
      toast("Location is required.");
      return;
    }

    if (!formData?.budget) {
      toast("Budget is required.");
      return;
    }

    if (!formData?.traveller) {
      toast("Traveller details are required.");
      return;
    }

    setLoading(true);

    const userInput = `
Generate a travel plan.

Destination: ${formData.location.label}
Duration: ${days} days
Travelers: ${formData.traveller}
Budget: ${formData.budget}
`;

    console.log("USER INPUT SENT TO GEMINI:");
    console.log(userInput);

    try {
      const result = await generateTravelPlan(userInput);

      console.log(
        "GEMINI RESULT:",
        JSON.stringify(result, null, 2)
      );

      if (!result) {
        throw new Error("Gemini returned no result.");
      }

      if (result.status === "incomplete") {
        console.error(
          "GEMINI SAYS INCOMPLETE:",
          result
        );

        toast(
          result.message ||
          "Some travel information is missing."
        );

        return;
      }

      if (result.status !== "complete") {
        console.error(
          "UNEXPECTED GEMINI RESPONSE:",
          result
        );

        throw new Error(
          "Gemini returned an unexpected response."
        );
      }

      if (
        !result.travelPlan ||
        !result.travelPlan.itinerary
      ) {
        console.error(
          "TRAVEL PLAN MISSING:",
          result
        );

        throw new Error(
          "Gemini did not return a valid travel plan."
        );
      }

      console.log(
        "TRAVEL PLAN RECEIVED:",
        result.travelPlan
      );

      console.log(
        "SAVING TRIP TO FIREBASE..."
      );

      await saveTrip(result.travelPlan);

    } catch (error) {
      console.error(
        "ERROR GENERATING TRIP:",
        error
      );

      toast(
        error?.message ||
        "An error occurred while generating the trip."
      );
    } finally {
      setLoading(false);
    }
  };
  const saveTrip = async (tripData) => {
    const docId = Date.now().toString();

    try {
      // Step 8: Check Firebase Auth before saving
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        console.error("No Firebase user is logged in");
        throw new Error("No Firebase user is logged in.");
      }

      console.log("Saving trip for UID:", firebaseUser.uid);

      if (!tripData) {
        throw new Error("Trip data is empty.");
      }

      console.log("================================");
      console.log("SAVING TRIP");
      console.log("Document ID:", docId);
      console.log("User UID:", firebaseUser.uid);
      console.log("User email:", firebaseUser.email);
      console.log("Trip data:", tripData);
      console.log("================================");

      // Step 9: Include userId (UID) alongside userEmail for Firestore rules
      await setDoc(doc(db, "trips", docId), {
        userSelection: formData,
        tripData: tripData,
        userId: firebaseUser.uid,
        userEmail: firebaseUser.email,
        id: docId,
      });

      console.log("✅ FIREBASE SAVE SUCCESSFUL");
      console.log("Trip ID:", docId);

      toast("Trip generated successfully!");

      navigate(`/view-trip/${docId}`);
    } catch (error) {
      console.error("❌ FIREBASE SAVE ERROR");
      console.error("Error:", error);
      console.error("Error code:", error?.code);
      console.error("Error message:", error?.message);

      toast(
        error?.message ||
        "Unable to save the trip to Firebase."
      );

      throw error;
    }
  };



  return (
    <>
      <Navbar />

      <div className="sm:px-10 md:px-32 lg:px-56 xl:px-72 px-5 mt-10">

        <h2 className="font-bold text-3xl">
          Tell us your travel preferences ⛱️ 🌴
        </h2>

        <p className="mt-3 text-gray-500 text-xl">
          Just provide some basic information,
          and our trip planner will generate a
          customized itinerary based on your
          preferences.
        </p>

        <div className="mt-10 flex flex-col gap-10">

          <div>
            <h2 className="text-xl my-3 font-medium">
              What is destination of choice? *
            </h2>

            <div
              ref={wrapperRef}
              className="relative"
            >
              <input
                id="location-input"
                type="text"
                value={inputValue}
                onChange={handleLocationInput}
                onFocus={() =>
                  suggestions.length > 0 &&
                  setShowDropdown(true)
                }
                placeholder="Search a destination..."
                autoComplete="off"
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
              />

              {isLoadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  Searching…
                </div>
              )}

              {showDropdown &&
                suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
                    {suggestions.map(
                      (item, idx) => (
                        <li
                          key={
                            item.place_id ||
                            idx
                          }
                          onMouseDown={() =>
                            handleSelectSuggestion(
                              item
                            )
                          }
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
                        >
                          <span className="font-medium">
                            {
                              item.address_line1
                            }
                          </span>

                          <span className="text-gray-500 ml-1">
                            {
                              item.address_line2
                            }
                          </span>
                        </li>
                      )
                    )}
                  </ul>
                )}
            </div>
          </div>

          <div>
            <h2 className="text-xl my-3 font-medium">
              How many days are you planning
              your trip? *
            </h2>

            <Input
              placeholder="Ex. 3"
              type="number"
              min="1"
              max="5"
              onChange={(e) =>
                handleInputChange(
                  "noOfDays",
                  e.target.value
                )
              }
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">
            What is Your Budget? *
          </h2>

          <div className="grid grid-cols-3 gap-5 mt-5">
            {selectBudgetOptions.map(
              (item, index) => (
                <div
                  key={index}
                  className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.budget ===
                    item.title
                    ? "shadow-lg border-black"
                    : ""
                    }`}
                  onClick={() =>
                    handleInputChange(
                      "budget",
                      item.title
                    )
                  }
                >
                  <h2 className="text-4xl">
                    {item.icon}
                  </h2>

                  <h2 className="font-bold text-lg">
                    {item.title}
                  </h2>

                  <h2 className="text-gray-500 text-sm">
                    {item.desc}
                  </h2>
                </div>
              )
            )}
          </div>
        </div>

        <div>
          <h2 className="text-xl my-3 font-medium">
            Who do you plan on traveling with
            on your next adventure? *
          </h2>

          <div className="grid grid-cols-3 gap-5 mt-5">
            {SelectTravelsList.map(
              (item, index) => (
                <div
                  key={index}
                  className={`p-4 border cursor-pointer rounded-lg hover:shadow-lg ${formData?.traveller ===
                    item.people
                    ? "shadow-lg border-black"
                    : ""
                    }`}
                  onClick={() =>
                    handleInputChange(
                      "traveller",
                      item.people
                    )
                  }
                >
                  <h2 className="text-4xl">
                    {item.icon}
                  </h2>

                  <h2 className="font-bold text-lg">
                    {item.title}
                  </h2>

                  <h2 className="text-gray-500 text-sm">
                    {item.desc}
                  </h2>
                </div>
              )
            )}
          </div>
        </div>

        <div className="my-10 flex justify-center">
          <Button
            onClick={generateTrip}
            disabled={loading}
          >
            Generate Trip{" "}
            {loading && <Loading />}
          </Button>
        </div>

        <Dialog
          open={openDialog}
          onOpenChange={setOpenDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogDescription>
                <img
                  src="/mainlogo.png"
                  className="w-28 md:w-40"
                  alt="Logo"
                />

                <h2 className="font-bold text-lg mt-7">
                  Sign In with Google
                </h2>

                <p>
                  Sign In to the App with Google
                  authentication
                </p>

                <Button
                  className="w-full mt-5 flex items-center gap-2"
                  onClick={handleLogin}
                >
                  <FcGoogle className="h-5 w-5" />
                  Sign In with Google
                </Button>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
};
