import React, { useEffect, useRef, useState } from "react";
import ToastHook from "@hooks/Toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const PaymentProcess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, token } = useSelector((state) => state.auth);

  // retrieve data from state
  const pac = location.state?.pac;
  const locationDetail = location.state?.location;
  const [data, setData] = useState();
  const { successToast } = ToastHook();

  // dummy payment methods
  const paymentMethods = [
    {
      index: 1,
      name: "Transfer Bank",
      number: "3421813624",
    },
    {
      index: 2,
      name: "Virtual Account",
      number: "4992727898411",
    },
    {
      index: 3,
      name: "E-Wallet",
      number: "5943329990182",
    },
  ];

  // function to print per characters
  const printCharacters = (string, index) => {
    return (
      <div className="flex flex-row gap-4 py-2 cursor-pointer w-auto" onClick={() => copyText(index)}>
        {string.split("").map((char, index) => (
          <p className="px-2 py-1 text-gray-500 border border-grey-300 " key={index}>
            {char}
          </p>
        ))}
      </div>
    );
  };

  // function to copy string to clipboards
  const copyText = (index) => {
    const text = paymentMethods[index].number;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        successToast("Numbers copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const handleSaveLocation = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL_API}/savelocation`,
        {
          lat: locationDetail.lat,
          lon: locationDetail.lon,
          province: locationDetail.province,
          region: locationDetail.region,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }
  };
  const [selectedFile, setSelectedFile] = useState(null);
  const [base64String, setBase64String] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Fungsi untuk mengubah file menjadi Base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Fungsi untuk menangani pemilihan file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        const base64 = await convertToBase64(file);
        setSelectedFile(file);
        setBase64String(base64);
      } catch (error) {
        console.error("Error converting file to Base64:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Fungsi untuk membuka dialog file input
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmitPayment = async () => {
    try {
      // Determine the package type and duration based on the available prices
      let packageType = "";
      let duration = 0;

      if (pac.price_weekly !== "0.00") {
        packageType = "weekly";
        duration = 7; // Weekly duration
      } else if (pac.price_monthly !== "0.00") {
        packageType = "monthly";
        duration = 30; // Monthly duration
      } else if (pac.price_annual !== "0.00") {
        packageType = "annual";
        duration = 365; // Annual duration
      }

      // Get today's date and format it as needed (YYYY-MM-DD)
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0];

      // Make the POST request to the server to create the subscription
      await axios.post(`${process.env.REACT_APP_URL_API}/subscriptions`, {
        lat: locationDetail.lat,
        lon: locationDetail.lon,
        province: locationDetail.province,
        region: locationDetail.region,
        day: pac.duration,
        uuid: user.uuid,
        plan_id: pac.id,
        location: {
          region: locationDetail.region,
          province: locationDetail.province,
          lon: locationDetail.lon,
          lat: locationDetail.lat,
        },
        start_date: formattedDate,
        package: packageType, // Use the determined package type
        qty: 1,
        base64image: base64String,
        user_id: user.id,
      });

      // Make the POST request for payment
      await axios.post(
        `${process.env.REACT_APP_URL_API}/payment`,
        {
          lat: locationDetail.lat, // Fix lat/lon order here
          lon: locationDetail.lon, // Fix lat/lon order here
          province: locationDetail.province,
          region: locationDetail.region,
          day: duration, // Use duration here
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleSaveLocation(); // Call any other function after success
      successToast("Request Berhasil");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/detail/data-historis${window.location.search}`);
      }, 2000);
    } catch (error) {
      console.error("Error during payment submission:", error);
    }
  };

  return (
    <>
      {pac && user ? (
        <div className="px-[2%] py-4 2xl:container mx-auto">
          {/* header */}
          <div className="py-8">
            <p className="text-3xl font-bold text-[#1F8A70]">Total Pembayaran</p>
            {/* if there is description put it here */}
          </div>

          {/* total pembayaran */}
          <div className="py-6 w-full mx-auto flex flex-row gap-10">
            {/* metode pembayaran */}
            <div className="p-6 w-4/6 gap-6 flex flex-col border rounded-md border-gray-300 bg-white">
              <p className="text-2xl font-bold text-[#1F8A70]">Metode Pembayaran</p>

              <div className="ml-4 flex flex-col text-lg text-gray-600 font-semibold gap-4">
                {paymentMethods.map((data, index) => (
                  <div key={index}>
                    <p>{data.name}</p>
                    {printCharacters(data.number, index)}
                  </div>
                ))}
              </div>
            </div>

            {/* order list */}
            <div className="p-6 w-2/6 gap-6 flex flex-col border rounded-md border-[#1F8A70] bg-white">
              <p className="text-2xl font-bold text-[#1F8A70]">Order List</p>

              <p className="font-semibold">
                {locationDetail.region}, {locationDetail.province}
              </p>
              <div>
                <p>Latitude: {locationDetail.lat}</p>
                <p>Longitude: {locationDetail.lon}</p>
              </div>

              <div>
                {pac.name && pac.type && (
                  <p>
                    {pac.name[0]} - {pac.type}
                  </p>
                )}
                {pac.price_weekly !== "0.00" && (
                  <p className="font-semibold" id={`text-sub-duration-weekly-${pac.id}`}>
                    7 Days
                  </p>
                )}
                {pac.price_monthly !== "0.00" && (
                  <p className="font-semibold" id={`text-sub-duration-monthly-${pac.id}`}>
                    1 Month
                  </p>
                )}
                {pac.price_annual !== "0.00" && (
                  <p className="font-semibold" id={`text-sub-duration-annual-${pac.id}`}>
                    1 Year
                  </p>
                )}
              </div>

              {pac.price_weekly !== "0.00" && (
                <p className="text-2xl text-right font-bold text-[#1F8A70] " id={`text-sub-price-weekly-${pac.id}`}>
                  Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_weekly))}
                </p>
              )}
              {pac.price_monthly !== "0.00" && (
                <p className="text-2xl text-right font-bold text-[#1F8A70] " id={`text-sub-price-monthly-${pac.id}`}>
                  Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_monthly))}
                </p>
              )}
              {pac.price_annual !== "0.00" && (
                <p className="text-2xl text-right font-bold text-[#1F8A70] " id={`text-sub-price-annual-${pac.id}`}>
                  Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_annual))}
                </p>
              )}
              <div className="flex flex-col items-center mt-8">
                {/* Button Upload */}
                <button onClick={handleButtonClick} className="px-6 py-2 w-full max-w-sm bg-[#1F8A70] text-white rounded-lg hover:bg-[#1F8A70] focus:outline-none focus:ring-2 focus:ring-[#1F8A70] focus:ring-offset-2" disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Upload a file"}
                </button>

                {/* Input File (Hidden) */}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />

                {/* Menampilkan File yang Sudah Diunggah */}
                {selectedFile && (
                  <div className="mt-4 p-4 bg-gray-100 rounded-lg w-full max-w-sm text-center">
                    <p className="text-gray-800 font-medium">File Uploaded:</p>
                    <p className="text-gray-600 mt-1">{selectedFile.name}</p>
                  </div>
                )}

                {/* Menampilkan String Base64 */}
              </div>
              <div className="flex justify-end">
                <button disabled={!selectedFile} className="p-2 w-[30%] text-center text-white bg-[#1F8A70] border rounded-md " onClick={() => handleSubmitPayment()}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="pt-6">
          <p className="text-3xl text-center font-bold text-[#1F8A70]">Halaman pembayaran tidak ditemukan!</p>
        </div>
      )}
    </>
  );
};

export default PaymentProcess;
