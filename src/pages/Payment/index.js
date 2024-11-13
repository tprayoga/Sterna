import React, { useEffect } from "react";
import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { RadioGroup } from "@headlessui/react";
import { IoIosArrowDown } from "react-icons/io";
import { BsCheckAll } from "react-icons/bs";
import dataProv from "@data/dataprov.json";
import dataKab from "@data/datakab.json";
import Radio from "@components/molecule/Radio";
import Cookies from "js-cookie";
import { setSuccess } from "@redux/features/toast/toastSlice";
import { useNavigate } from "react-router-dom";
import ToastHook from "@hooks/Toast";
import { FaRegCheckCircle } from "react-icons/fa";
import axios from "axios";
import { useSelector } from "react-redux";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdOutlineLocationOn } from "react-icons/md";

const Payment = () => {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);

  const { token } = useSelector((state) => state.auth);
  const { locationParams } = useSelector((state) => state.location);

  const { successToast } = ToastHook();
  const [plans, setPlans] = useState([]);

  const [lonLat, setLonLat] = useState({
    lon: 0,
    lat: 0,
    region: "",
  });

  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { id: 0, title: "Basic" },
    { id: 1, title: "Profesional" },
    { id: 2, title: "Enterprise" },
    { id: 3, title: "Combo" },
  ];

  const [activeSubTab, setActiveSubTab] = useState(2);

  const subTabs = [
    { id: 2, title: "Weekly" },
    { id: 0, title: "Monthly" },
    { id: 1, title: "Annualy" },
  ];

  const [packageAvailable, setPackageAvailable] = useState([
    {
      id: "monthly-forecast",
      category: "basic",
      name: ["Basic", "Monthly", "30 Days"],
      type: "Forecast",
      price: "1.500.000",
      duration: 30,
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"],
      disable: false,
      loding: false,
    },
    {
      id: "annual-forecast",
      category: "basic",
      name: ["Basic", "Annual", "1 Year Calendar"],
      type: "Forecast",
      price: "16.000.000",
      duration: 365,
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"],
      disable: false,
      loading: false,
    },
    {
      id: "monthly-monitoring",
      category: "basic",
      name: ["Basic", "Monthly", "30 Days"],
      type: "Monitoring",
      price: "1.500.000",
      duration: 30,
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data hingga 30 hari yang lalu", "Akses data dalam format tabular (csv) dan format pdf"],
      disable: false,
      loading: false,
    },
    {
      id: "annual-monitoring",
      category: "basic",
      name: ["Basic", "Annual", "1 Year Calendar"],
      type: "Monitoring",
      price: "16.000.000",
      duration: 365,
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data hingga 30 hari yang lalu", "Akses data dalam format tabular (csv) dan format pdf"],
      disable: false,
      loding: false,
    },
    {
      id: "profesional-forecast",
      category: "profesional",
      name: ["Profesional"],
      type: "Forecast",
      price: "25.000", //gatau
      duration: 10, //gatau
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"], // ini gatau juga
      disable: false,
      loding: false,
    },
    {
      id: "profesional-monitoring",
      category: "profesional",
      name: ["Profesional"],
      type: "Monitoring",
      price: "25.000", //gatau
      duration: 90, //gatau
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"], // ini gatau juga
      disable: false,
      loding: false,
    },
    {
      id: "enterprise-forecast",
      category: "enterprise",
      name: ["Enterprise"],
      type: "Forecast",
      price: "40.000", //gatau
      duration: 14, //gatau
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"], // ini gatau juga
      disable: false,
      loding: false,
    },
    {
      id: "combo",
      category: "combo",
      name: ["Combo"],
      type: "Combo",
      price: "16.000.000", //gatau
      duration: 14, //gatau
      description: ["Gratis akses data klimatologis dan prakiraan bulanan (7 bulan)", "Akses data per jam hingga 7 hari ke depan", "Akses data dalam format tabular (csv) dan format pdf"], // ini gatau juga
      disable: false,
      loding: false,
    },
  ]);
  const getPlanData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_URL_API_2 + "/api/plans");
      setPlans(response.data); // Assuming response.data contains the plans data
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  useEffect(() => {
    getPlanData();

    if (locationParams) {
      return setLonLat({
        ...locationParams,
        lon: locationParams.long,
      });
    } else {
      const long = parseFloat(urlParams.get("long"));
      const lat = parseFloat(urlParams.get("lat"));
      const region = urlParams.get("region");
      const provice = urlParams.get("province");

      return setLonLat({
        lon: long,
        lat: lat,
        region: region,
        provice: provice,
      });
    }
  }, [dataKab, locationParams]);

  const handleSubmit = (dayPackage) => {
    Cookies.set(
      "_subs",
      JSON.stringify({
        location: {
          name: lonLat.region,
          lon: lonLat.lon,
          lat: lonLat.lat,
        },
        package: {
          day: dayPackage,
        },
      })
    );

    successToast("Requested Success");
    setTimeout(() => {
      navigate(`/detail/data-historis${window.location.search}`);
    }, 3000);
  };

  const handleSaveLocation = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_URL_API}/savelocation`,
        {
          lat: lonLat.lat,
          lon: lonLat.lon,
          province: lonLat.province,
          region: lonLat.region,
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

  const handleSubmitPayment = async (duration, index) => {
    setPackageAvailable((prev) => {
      return prev.map((pac, i) => {
        if (i === index) {
          return {
            ...pac,
            loading: true,
          };
        } else {
          return pac;
        }
      });
    });
    try {
      await axios.post(
        `${process.env.REACT_APP_URL_API}/payment`,
        {
          lat: lonLat.lat,
          lon: lonLat.lon,
          province: lonLat.province,
          region: lonLat.region,
          day: duration,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setPackageAvailable((prev) => {
        return prev.map((pac, i) => {
          if (i === index) {
            return {
              ...pac,
              loading: false,
            };
          } else {
            return pac;
          }
        });
      });

      handleSaveLocation();
      successToast("Request Berhasil");
      setTimeout(() => {
        navigate(`/detail/data-historis${window.location.search}`);
      }, 2000);
    } catch (error) {
      console.log(error);
    }
  };

  const packageCard = (pac, index) => (
    <div key={index} id={`card-sub-${pac.id}`} className={`bg-white lg:mb-0 h-[90%] py-4 px-6 mt-6 relative flex flex-col gap-10 ${pac.disable && "opacity-50 cursor-not-allowed"} border rounded-lg`}>
      <div className="flex justify-evenly flex-col gap-4 mt-2">
        <p className="text-xl pd-2 text-left text-black tracking-[.2em]" id={`text-sub-title-${pac.id}`}>
          {pac.name}
        </p>

        <div className="flex items-end w-full">
          {pac.price_weekly !== "0.00" && (
            <p className="font-bold text-3xl text-[#1F8A70] tracking-[.1em]" id={`text-sub-price-weekly-${pac.id}`}>
              Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_weekly))}
            </p>
          )}
          {pac.price_monthly !== "0.00" && (
            <p className="font-bold text-3xl text-[#1F8A70] tracking-[.1em]" id={`text-sub-price-monthly-${pac.id}`}>
              Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_monthly))}
            </p>
          )}
          {pac.price_annual !== "0.00" && (
            <p className="font-bold text-3xl text-[#1F8A70] tracking-[.1em]" id={`text-sub-price-annual-${pac.id}`}>
              Rp {new Intl.NumberFormat("id-ID").format(parseFloat(pac.price_annual))}
            </p>
          )}
          {pac.price_weekly !== "0.00" && (
            <p className="text-md text-gray-500 tracking-[.05em]" id={`text-sub-duration-weekly-${pac.id}`}>
              per Week
            </p>
          )}
          {pac.price_monthly !== "0.00" && (
            <p className="text-md text-gray-500 tracking-[.05em]" id={`text-sub-duration-monthly-${pac.id}`}>
              per Month
            </p>
          )}
          {pac.price_annual !== "0.00" && (
            <p className="text-md text-gray-500 tracking-[.05em]" id={`text-sub-duration-annual-${pac.id}`}>
              per Year
            </p>
          )}
        </div>

        <div className="flex flex-col text-xs font-semibold">
          <div className="flex items-center gap-2">
            <MdOutlineLocationOn className="text-[#1F8A70] text-xl" />
            <p className="tracking-[.1em] text-md" id={`text-sub-location-${pac.id}`}>
              {lonLat.region}
            </p>
          </div>
          <p className="ml-7 font-normal tracking-[.1em]">
            Long. {parseFloat(lonLat.lon).toFixed(5)}° Lat. {parseFloat(lonLat.lat).toFixed(5)}°
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 w-full  ">
        <div className="flex flex-col gap-2 flex-grow">
          {pac?.features?.map((feature, i) => (
            <div key={i} className="flex gap-2 w-full" id={`text-sub-desc${i + 1}-${pac.id}`}>
              <div className="mt-[2px]">
                <FaRegCheckCircle className="text-[#1F8A70]" />
              </div>
              <p className="text-sm">{feature.feature}</p>
            </div>
          ))}
        </div>

        <button
          className={` bottom-2 py-2 px-4 right-1 border border-green-600 absolute duration-150 w-[98%] bg-[#1F8A70] flex justify-center items-center rounded-lg text-white ${
            !pac.disable ? "hover:bg-white hover:text-[#1F8A70]" : "cursor-not-allowed "
          }`}
          disabled={pac.disable || pac.loading}
          onClick={() => {
            // handleSubmit(pac.duration);
            // handleSubmitPayment(pac.duration, index);
            navigate("/payment-process", {
              state: {
                pac: pac,
                location: {
                  lat: lonLat.lat,
                  lon: lonLat.lon,
                  province: lonLat.province,
                  region: lonLat.region,
                },
                price:
                  pac.price_monthly !== "0.00" && pac.price_annual !== "0.00"
                    ? pac.price_weekly
                    : pac.price_weekly !== "0.00" && pac.price_annual !== "0.00"
                    ? pac.price_monthly
                    : pac.price_weekly !== "0.00" && pac.price_monthly !== "0.00"
                    ? pac.price_annual
                    : null,
              },
            });
          }}
          id={`btn-sub-${pac.id}`}
        >
          {pac.loading ? <AiOutlineLoading3Quarters className="animate-spin" /> : "Berlangganan"}
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="py-4 px-7">
        <p className="text-3xl font-bold text-[#1F8A70]">Berlangganan</p>
        <p className="text-sm font-bold text-[#1F8A70]">Untuk mendapatkan akses lebih banyak data, berdasarkan lokasi yang telah dipilih.</p>
      </div>
      <div className="my-4 mx-10 rounded-[17px] h-auto ">
        <div className="h-full">
          {/* <div className="flex justify-center items-center py-6">
            <p className="text-white text-4xl font-bold">Pilih Paket</p>
          </div> */}

          <div className="w-full mx-auto">
            {/* Tabs Header */}
            <div className="flex w-3/6 h-[40px] py-1 px-2 mx-auto border rounded-full border-[#1F8A70] bg-white /">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(index)}
                  className={`flex-1 px-4 text-sm text-center font-small tracking-wider transition-colors duration-300 ${activeTab === index ? "text-slate-50 border-2 border-[#1F8A70] bg-[#1F8A70] rounded-full" : "text-gray-500"}`}
                >
                  {tab.title}
                </button>
              ))}
            </div>

            {/* Tabs Content */}
            <div className="pt-4 mt-6 w-4/6 mx-auto border rounded-2xl border-[#1F8A70] bg-white">
              {/* tab 1 */}
              {activeTab === 0 && (
                <>
                  <div className="flex justify-center">
                    {subTabs.map((tab, index) => (
                      <label key={tab.id} className="flex items-center cursor-pointer mr-8">
                        <input type="radio" name="subTab" checked={activeSubTab === tab.id} onChange={() => setActiveSubTab(tab.id)} className="hidden" />
                        <span className={`h-4 w-4 rounded-full border-2 ${activeSubTab === tab.id ? "bg-white border-[#1F8A70]" : "border-[#1F8A70]"} mr-2 flex items-center justify-center`}>
                          {activeSubTab === tab.id && (
                            <span className="h-2 w-2 rounded-full bg-[#1F8A70]"></span> // Inner dot
                          )}
                        </span>
                        <span className={`text-sm font-semibold tracking-wider transition-colors duration-300 ${activeSubTab === tab.id ? "text-[#1F8A70]" : "text-gray-500"}`}>{tab.title}</span>
                      </label>
                    ))}
                  </div>

                  {activeSubTab === 0 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Basic" && pac.price_weekly === "0.00" && pac.price_annual === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Jika tidak memenuhi kondisi, kembalikan null agar tidak merender apa pun
                      })}
                    </div>
                  ) : activeSubTab === 1 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Basic" && pac.price_weekly === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  ) : (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Basic" && pac.price_annual === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  )}
                </>
              )}

              {/* tab 2 */}
              {activeTab === 1 && (
                <>
                  <div className="flex justify-center">
                    {subTabs.map((tab, index) => (
                      <label key={tab.id} className="flex items-center cursor-pointer mr-8">
                        <input type="radio" name="subTab" checked={activeSubTab === tab.id} onChange={() => setActiveSubTab(tab.id)} className="hidden" />
                        <span className={`h-4 w-4 rounded-full border-2 ${activeSubTab === tab.id ? "bg-white border-[#1F8A70]" : "border-[#1F8A70]"} mr-2 flex items-center justify-center`}>
                          {activeSubTab === tab.id && (
                            <span className="h-2 w-2 rounded-full bg-[#1F8A70]"></span> // Inner dot
                          )}
                        </span>
                        <span className={`text-sm font-semibold tracking-wider transition-colors duration-300 ${activeSubTab === tab.id ? "text-[#1F8A70]" : "text-gray-500"}`}>{tab.title}</span>
                      </label>
                    ))}
                  </div>

                  {activeSubTab === 0 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Professional" && pac.price_weekly === "0.00" && pac.price_annual === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Jika tidak memenuhi kondisi, kembalikan null agar tidak merender apa pun
                      })}
                    </div>
                  ) : activeSubTab === 1 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Professional" && pac.price_weekly === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  ) : (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Professional" && pac.price_annual === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  )}
                </>
              )}

              {/* tab 3 */}
              {activeTab === 2 && (
                <>
                  <div className="flex justify-center">
                    {subTabs.map((tab, index) => (
                      <label key={tab.id} className="flex items-center cursor-pointer mr-8">
                        <input type="radio" name="subTab" checked={activeSubTab === tab.id} onChange={() => setActiveSubTab(tab.id)} className="hidden" />
                        <span className={`h-4 w-4 rounded-full border-2 ${activeSubTab === tab.id ? "bg-white border-[#1F8A70]" : "border-[#1F8A70]"} mr-2 flex items-center justify-center`}>
                          {activeSubTab === tab.id && (
                            <span className="h-2 w-2 rounded-full bg-[#1F8A70]"></span> // Inner dot
                          )}
                        </span>
                        <span className={`text-sm font-semibold tracking-wider transition-colors duration-300 ${activeSubTab === tab.id ? "text-[#1F8A70]" : "text-gray-500"}`}>{tab.title}</span>
                      </label>
                    ))}
                  </div>

                  {activeSubTab === 2 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Enterprise" && pac.price_weekly === "0.00" && pac.price_annual === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Jika tidak memenuhi kondisi, kembalikan null agar tidak merender apa pun
                      })}
                    </div>
                  ) : activeSubTab === 1 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Enterprise" && pac.price_weekly === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  ) : (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Enterprise" && pac.price_annual === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  )}
                </>
              )}

              {/* tab 4 */}
              {activeTab === 3 && (
                <>
                  <div className="flex justify-center">
                    {subTabs.map((tab, index) => (
                      <label key={tab.id} className="flex items-center cursor-pointer mr-8">
                        <input type="radio" name="subTab" checked={activeSubTab === tab.id} onChange={() => setActiveSubTab(tab.id)} className="hidden" />
                        <span className={`h-4 w-4 rounded-full border-2 ${activeSubTab === tab.id ? "bg-white border-[#1F8A70]" : "border-[#1F8A70]"} mr-2 flex items-center justify-center`}>
                          {activeSubTab === tab.id && (
                            <span className="h-2 w-2 rounded-full bg-[#1F8A70]"></span> // Inner dot
                          )}
                        </span>
                        <span className={`text-sm font-semibold tracking-wider transition-colors duration-300 ${activeSubTab === tab.id ? "text-[#1F8A70]" : "text-gray-500"}`}>{tab.title}</span>
                      </label>
                    ))}
                  </div>

                  {activeSubTab === 2 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Combo" && pac.price_weekly === "0.00" && pac.price_annual === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Jika tidak memenuhi kondisi, kembalikan null agar tidak merender apa pun
                      })}
                    </div>
                  ) : activeSubTab === 1 ? (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Combo" && pac.price_weekly === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  ) : (
                    <div className="pb-8 lg:pb-0 px-4 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-3 h-full w-full lg:h-[55vh] items-center">
                      {plans.map((pac, index) => {
                        if (pac.category.name === "Combo" && pac.price_annual === "0.00" && pac.price_monthly === "0.00") {
                          return packageCard(pac, index);
                        }
                        return null; // Kembalikan null jika tidak memenuhi kondisi
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* <div className="mt-8 pb-8 lg:pb-0 flex flex-col gap-4 md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mx-[10%] h-full lg:h-[55vh] items-center">
            {packageAvailable.map((pac, index) => (
              <div
                key={index}
                id={`card-sub-${pac.id}`}
                className={`bg-white lg:mb-0 h-[40vh] lg:h-full w-full relative ${
                  pac.disable && "opacity-50 cursor-not-allowed"
                }`}
              >
                <div className="border-r h-[80%] top-10 absolute" />
                <div className="flex text-slate-600 justify-evenly h-full items-center flex-col">
                  <center>
                    <p
                      className="font-bold text-xl text-[#1F8A70]"
                      id={`text-sub-title-${pac.id}`}
                    >
                      {pac.type}
                    </p>
                    {pac.name.map((name, i) => (
                      <p
                        className="font-bold text-sm p-0"
                        id={`text-sub-title-${pac.id}`}
                      >
                        {i == 2 ? `(${name})` : `${name}`}
                      </p>
                    ))}
                  </center>

                  <div className="flex flex-col items-center w-full">
                    <p
                      className="font-bold text-2xl text-[#1F8A70]"
                      id={`text-sub-price-${pac.id}`}
                    >
                      IDR. {pac.price}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 items-center text-xs font-semibold">
                    <p
                      className="font-normal"
                      id={`text-sub-location-${pac.id}`}
                    >
                      {lonLat.region}
                    </p>
                    <div>
                      <p className="">
                        Longitude: {parseFloat(lonLat.lon).toFixed(1)}°
                      </p>
                      <p className="">
                        Langitude: {parseFloat(lonLat.lat).toFixed(1)}°
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-start w-full pl-[10%] pr-5 flex-col gap-2">
                    {pac.description.map((desc, i) => (
                      <div
                        key={i}
                        className={`flex gap-2 items-center justify-start w-full`}
                        id={`text-sub-desc${i + 1}-${pac.id}`}
                      >
                        <div>
                          <FiCheckCircle className="text-[#1F8A70]" />{" "}
                        </div>
                        <p
                          className={`text-xs ${
                            i == 1 ? "font-bold" : "font-medium"
                          }`}
                        >
                          {desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`border border-green-600 px-4 py-1 duration-150 w-28 flex justify-center items-center ${
                      !pac.disable
                        ? "hover:bg-[#1F8A70] hover:text-white"
                        : "cursor-not-allowed"
                    }`}
                    disabled={pac.disable || pac.loading}
                    onClick={() => {
                      // handleSubmit(pac.duration);
                      handleSubmitPayment(pac.duration, index);
                    }}
                    id={`btn-sub-${pac.id}`}
                  >
                    {pac.loading ? (
                      <AiOutlineLoading3Quarters className="animate-spin" />
                    ) : (
                      "Berlangganan"
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Payment;
