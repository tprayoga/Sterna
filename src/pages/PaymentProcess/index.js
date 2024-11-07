import React from "react";
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

  const { successToast } = ToastHook();

  // dummy payment methods
  const paymentMethods = [
    {
      "index": 1,
      "name": "Transfer Bank",
      "number": "3421813624"
    },
    {
      "index": 2,
      "name": "Virtual Account",
      "number": "4992727898411"
    },
    {
      "index": 3,
      "name": "E-Wallet",
      "number": "5943329990182"
    }
  ]

  // function to print per characters
  const printCharacters = (string, index) => {
    return (
      <div className="flex flex-row gap-4 py-2 cursor-pointer w-auto"
        onClick={() => copyText(index)}
      >
        {string.split('').map((char, index) => (
          <p className="px-2 py-1 text-gray-500 border border-grey-300 " key={index}>{char}</p>
        ))}
      </div>
    );
  }

  // function to copy string to clipboards
  const copyText = (index) => {
    const text = paymentMethods[index].number;
    navigator.clipboard.writeText(text)
      .then(() => {
        successToast("Numbers copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

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

  const handleSubmitPayment = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL_API}/payment`,
        {
          lat: locationDetail.lat,
          lon: locationDetail.lon,
          province: locationDetail.province,
          region: locationDetail.region,
          day: pac.duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      handleSaveLocation();
      successToast("Request Berhasil");
      setTimeout(() => {
        navigate(`/detail/data-historis${window.location.search}`);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
    {pac && user ?
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
              {paymentMethods.map((data, index) => 
                <div key={index}>
                  <p>{data.name}</p>
                  {printCharacters(data.number, index)}
                </div>
              )}
            </div>
          </div>

          {/* order list */}
          <div className="p-6 w-2/6 gap-6 flex flex-col border rounded-md border-[#1F8A70] bg-white">
            <p className="text-2xl font-bold text-[#1F8A70]">Order List</p>

            <p className="font-semibold">{locationDetail.region}, {locationDetail.province}</p>
            <div>
              <p>Latitude: {locationDetail.lat}</p>
              <p>Longitude: {locationDetail.lon}</p>
            </div>

            <div>
              {pac.name && pac.type && <p>{pac.name[0]} - {pac.type}</p>}
              <p className="font-semibold">
                {pac.duration === 30 ? "1 month" :
                  pac.duration === 365 ? "1 year" :
                  pac.duration === 90 ? " 3 months" :
                  `${pac.duration} days`}
              </p>
            </div>

            <p className="text-2xl text-right font-bold text-[#1F8A70] ">Rp{pac.price}</p>

            <div className="flex justify-end">
              <button className="p-2 w-[30%] text-center text-white bg-[#1F8A70] border rounded-md "
                onClick={() => handleSubmitPayment()}
              >
                Submit
              </button>
            </div>
          </div>

        </div>
      </div>
    :
      <div className="pt-6">
        <p className="text-3xl text-center font-bold text-[#1F8A70]">Halaman pembayaran tidak ditemukan!</p>
      </div>
    }
    </>
  );
};

export default PaymentProcess;
