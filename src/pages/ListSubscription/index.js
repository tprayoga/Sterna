import { setLocationParams } from "@redux/features/location/locationSlice";
import axios from "axios";
import React, { useEffect, useLayoutEffect, useState } from "react";
import { AiFillCheckCircle, AiFillCloseCircle, AiFillWarning } from "react-icons/ai";
import { BiSad } from "react-icons/bi";
import { BsClockFill } from "react-icons/bs";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosArrowForward, IoIosArrowUp } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// "Semua", "Success", "Pending", "Cancel"

const status = ["Semua", "Success", "Pending", "Cancel"];

function getIndonesianMonthName(date) {
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return months[date.getMonth()];
}

const ListSubscription = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [active, setActive] = useState(status[0]);
  const [listPayment, setListPayment] = useState(null);
  const [dataPayment, setDataPayment] = useState(null);
  const [subData, setSubData] = useState([]);
  const [dataUtc, setDataUts] = useState();

  const [loadingGetPayment, setLoadingGetPayment] = useState(false);
  const provinceBaseMapping = [
    "ACEH",
    "SUMATERA UTARA",
    "SUMATERA BARAT",
    "RIAU",
    "KEPULAUAN RIAU",
    "JAMBI",
    "BENGKULU",
    "SUMATERA SELATAN",
    "KEPULAUAN BANGKA BELITUNG",
    "LAMPUNG",
    "BANTEN",
    "DKI JAKARTA",
    "JAWA BARAT",
    "JAWA TENGAH",
    "DAERAH ISTIMEWA YOGYAKARTA",
    "JAWA TIMUR",
    "BALI",
    "NUSA TENGGARA BARAT",
    "NUSA TENGGARA TIMUR",
    "KALIMANTAN BARAT",
    "KALIMANTAN TENGAH",
    "KALIMANTAN SELATAN",
    "KALIMANTAN TIMUR",
    "KALIMANTAN UTARA",
    "SULAWESI UTARA",
    "GORONTALO",
    "SULAWESI TENGAH",
    "SULAWESI BARAT",
    "SULAWESI SELATAN",
    "SULAWESI TENGGARA",
    "MALUKU",
    "MALUKU UTARA",
    "PAPUA BARAT",
    "PAPUA",
  ];

  const baseValue = [7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 8, 8, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9, 9];

  // Fungsi untuk mendapatkan nilai dari baseValue berdasarkan provinsi
  const getBaseValueByProvince = (pov) => {
    const index = provinceBaseMapping.findIndex((province) => province === pov);

    // Jika provinsi ditemukan, kembalikan nilai dari baseValue, jika tidak, kembalikan null atau nilai default
    return index !== -1 ? baseValue[index] : null;
  };

  // Contoh penggunaan
  const pov = dataUtc;
  const utc = getBaseValueByProvince(pov);

  useEffect(() => {
    function compareCreatedAt(a, b) {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    // Fungsi untuk memisahkan data berdasarkan bulan
    function separateByMonth(data) {
      const separatedData = {};

      data.forEach((item) => {
        const createdDate = new Date(item.created_at);
        const monthYear = `${getIndonesianMonthName(createdDate)} ${createdDate.getFullYear()}`;

        if (!separatedData[monthYear]) {
          separatedData[monthYear] = [];
        }
        separatedData[monthYear].push(item);
      });

      return separatedData;
    }

    const fetchPayment = async () => {
      setLoadingGetPayment(true);
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_URL_API_2}/api/subscriptions/user/${user.id}`);

        const options = {
          weekday: "long",
        };

        if (data.length > 0) {
          const res = data.map((item) => {
            // Mengonversi created_at dari format ISO ke Date
            const dateCreated = new Date(item.created_at);

            // Mendapatkan nama hari dalam bahasa Indonesia
            const hari = dateCreated.toLocaleDateString("id-ID", options);

            // Mendapatkan jam dalam format HH:mm:ss
            const jam = dateCreated.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            // Mendapatkan tanggal dalam format DD
            const tanggal = dateCreated.getDate().toString().padStart(2, "0");

            return { ...item, hari, jam, tanggal };
          });

          res.sort(compareCreatedAt);

          const result = separateByMonth(res);

          setListPayment(result);
          setDataPayment(result);

          setLoadingGetPayment(false);
        } else {
          setListPayment(null);
          setDataPayment(null);

          setLoadingGetPayment(false);
        }
      } catch (error) {
        setLoadingGetPayment(false);
        console.log(error);
      }
    };

    if (token) {
      fetchPayment();
    }
  }, [token]);

  useEffect(() => {
    if (active !== "Semua") {
      const filteredData = {};
      const data = dataPayment;
      Object.keys(data).forEach((monthYear) => {
        const successPayments = data[monthYear].filter((item) => item.status === "SUCCESS");
        if (successPayments.length > 0) {
          filteredData[monthYear] = successPayments;
        }
      });
      setListPayment(filteredData);
    } else {
      setListPayment(dataPayment);
    }
  }, [active]);

  if (!token) {
    navigate("/");
  }

  const dateDifference = (expDate) => {
    const currentDate = new Date();

    const firstDate = currentDate;
    const secondDate = new Date(expDate);

    const differenceInMs = Math.abs(secondDate - firstDate);

    const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

    return differenceInDays;
  };
  const getSubData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_URL_API_2 + "/api/subscriptions/user/" + user.id);
      setSubData(response.data); // Assuming response.data contains the plans data
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };
  useEffect(() => {
    getSubData();
  }, []);

  return (
    <div className="px-[2%] py-4 2xl:container mx-auto">
      <div className="flex flex-col gap-1">
        <p className="text-3xl font-bold text-[#1F8A70]">Daftar Langganan</p>
        <p className="text-sm font-bold text-[#1F8A70]">Lihat dan Cek Status Langganan Anda</p>
      </div>
      <div className="mt-8">
        {/* Button Filter */}
        <div className="flex mb-4 justify-between items-center">
          <div className="flex px-2 items-center">
            {status.map((stat, index) => (
              <div key={index} className="py-1 rounded" id={index === 0 ? "button-sub-all" : index === 1 ? "button-sub-all" : index === 2 ? "button-sub-active" : index === 3 ? "button-sub-pending" : "button-sub-cancel"}>
                <button className={`text-black px-4 pt-1 pb-6 border-b-4 hover:opacity-60 duration-150 ${stat === active ? "border-b-[#1F8A70]" : ""} `} disabled={stat === active || !dataPayment} onClick={() => setActive(stat)}>
                  {stat === "Success" ? "Aktif" : stat === "Pending" ? "Menunggu" : stat === "Cancel" ? "Dibatalkan" : stat}
                </button>
              </div>
            ))}
          </div>

          {/* <div className="bg-white border flex gap-2 px-2 items-center rounded shadow">
            {status.map((stat, index) => (
              <div key={index} className="py-1 rounded">
                <button
                  className={`font-medium py-1 px-3 border border-transparent rounded ${
                    stat === active
                      ? "bg-main-500 text-white rounded border-main-300"
                      : "text-main-300 hover:border-main-500 duration-150 hover:text-main-500"
                  } `}
                  disabled={stat === active || !dataPayment}
                  onClick={() => setActive(stat)}
                >
                  {stat === "Success"
                    ? "Aktif"
                    : stat === "Pending"
                    ? "Menunggu"
                    : stat === "Cancel"
                    ? "Dibatalkan"
                    : stat}
                </button>
              </div>
            ))}
          </div> */}
        </div>
        {/* End Button Filter */}

        {/* List */}
        <div className="h-[66vh] overflow-auto">
          {listPayment && !loadingGetPayment ? (
            Object.keys(listPayment).map((month, monthIndex) => (
              <div key={monthIndex} className="mt-4">
                <p className="font-bold text-slate-900" id={`text-list-sub-month-${monthIndex + 1}`}>
                  {month}
                </p>
                {listPayment[month].map((item, index) => (
                  <div key={index} id={`card-list-sub-${index + 1}`} className=" rounded border-2 md:border mt-2 shadow-sm px-6 flex gap-4 items-center py-4 md:py-0 md:h-20">
                    <div id={`text-list-sub-date-${index + 1}`} className="flex items-center flex-col font-medium text-slate-600 text-sm">
                      <p>{item.hari}</p>
                      <p className="text-3xl font-bold text-main-500">{item.tanggal}</p>
                    </div>

                    <div className="border-r-2 w-2 h-14" />

                    {/* time and location */}
                    <div className="w-full h-full flex flex-col md:flex-row md:items-center justify-between">
                      <div className="w-full h-full flex flex-col md:flex-row md:items-center">
                        <div className="h-full flex flex-col justify-center gap-2 md:w-1/4">
                          <div className="flex gap-6 items-center text-sm text-slate-600">
                            <div className="flex items-center gap-3" id={`text-list-sub-time-${index + 1}`}>
                              <BsClockFill />
                              <p className="font-medium text-slate-500">{item.jam}</p>
                            </div>
                            {/* <div className="">
                              <IoIosArrowForward className="w-3" />
                            </div> */}
                            {/* <div className="flex items-center gap-3">
                       
                              <p className="font-medium text-slate-500">
                                11.12
                              </p>
                            </div> */}
                          </div>
                          <div id={`text-list-sub-location-${index + 1}`} className="flex items-center gap-3 text-sm text-slate-600">
                            <FaLocationDot />
                            <p className="font-semibold text-slate-800 whitespace-nowrap w-full overflow-hidden text-ellipsis">{item.location.region}</p>
                          </div>
                        </div>
                        {/* end time and location */}

                        {/* longitude & lattitude */}
                        <div className="h-full flex flex-col justify-center mt-4 md:mt-0 gap-2 md:w-1/3 lg:w-1/4">
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <p className="font-medium text-slate-500 w-[80px]">Garis Lintang</p>
                            <p className="font-medium text-slate-700">: {item.location.lat}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <p className="font-medium text-slate-500 w-[80px]">Garis Bujur</p>
                            <p className="font-medium text-slate-700">: {item.location.lon}</p>
                          </div>
                        </div>
                        {/* end longitude & lattitude */}

                        {/* Paket */}
                        <div className="h-full md:flex flex-col justify-center md:gap-2 mt-4 md:mt-0 hidden md:w-1/6 lg:1/5">
                          <div className="flex items-center md:gap-3 text-xs text-slate-600">
                            <p className="font-medium text-sm text-slate-500">Paket</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <p className="font-medium text-slate-700">{item.package}</p>
                          </div>
                        </div>
                        <div className="h-full flex flex-col justify-center mt-4 md:mt-0 gap-2 md:hidden">
                          <div className="flex items-center gap-3 text-xs text-slate-600">
                            <p className="font-medium text-slate-500 w-[80px]">Paket</p>
                            <p id={`text-list-sub-paket-${index + 1}`} className="font-medium text-slate-700">
                              {item.package}
                            </p>
                          </div>
                        </div>
                        {/* End Paket */}

                        {/* status */}
                        <div className="h-full flex mt-4 md:mt-0 md:flex-col md:justify-center gap-2 md:w-[100px]">
                          <div className="flex items-center gap-3 md:flex-col text-xs text-slate-600">
                            <p className="font-medium text-slate-500 w-[80px]">Status</p>
                            <div
                              className={`font-semibold lg:text-sm md:w-full flex  ${
                                item.status === "SUCCESS" ? "text-green-500" : item.status === "PENDING" ? "text-yellow-500" : item.status === "Cancel" ? "text-red-500" : "text-slate-900"
                              } flex items-center gap-1 md:gap-2`}
                            >
                              <span className="text-slate-500 md:hidden">: </span>
                              {item.status === "SUCCESS" ? <AiFillCheckCircle /> : item.status === "PENDING" ? <AiFillWarning /> : <AiFillCloseCircle />}
                              <p id={`text-list-sub-status-${index + 1}`}>{item.status === "SUCCESS" ? "Aktif" : item.status === "PENDING" ? "Menunggu" : item.status === "Cancel" ? "Dibatalkan" : item.status}</p>
                            </div>
                          </div>
                        </div>
                        {/* End status */}

                        {
                          item.status === "SUCCESS" && (
                            /* Masa Aktif */
                            <>
                              <div className="h-full flex mt-4 md:mt-0 md:flex-col md:justify-center gap-2 md:w-[100px] md:gap-2 ml-8">
                                <div className="flex items-center gap-2 md:flex-col text-xs text-slate-600">
                                  <p className="font-medium text-slate-500">Masa Aktif</p>
                                  <p className={`font-medium`}>{dateDifference(item.end_date)} hari lagi</p>
                                </div>
                              </div>
                              {/* End Masa Aktif */}

                              {/* Perpanjang */}
                              {/* commentted for now */}
                              <div className="h-full flex mt-4 md:mt-0 md:flex-col md:justify-center gap-2 md:w-[100px] md:gap-2 ml-8">
                                <div className="flex items-center gap-2 md:flex-col text-xs text-slate-600">
                                  <p className="font-medium text-slate-500">Aksi</p>
                                  <button
                                    className="p-2 font-semibold bg-emerald-100 rounded-lg"
                                    onClick={() => {
                                      console.log(item);
                                      navigate("/payment-process", {
                                        // state: {
                                        //   // send data using state
                                        //   pac: {
                                        //     duration: item.paket,
                                        //   },
                                        //   location: {
                                        //     lat: item.lat,
                                        //     lon: item.lon,
                                        //     province: item.province,
                                        //     region: item.region,
                                        //   },
                                        //   price:
                                        //   item.price_monthly !== "0.00" && item.price_annual !== "0.00"
                                        //     ? item.price_weekly
                                        //     : item.price_weekly !== "0.00" && item.price_annual !== "0.00"
                                        //     ? item.price_monthly
                                        //     : item.price_weekly !== "0.00" && item.price_monthly !== "0.00"
                                        //     ? item.price_annual
                                        //     : null,
                                        // },
                                        state: {
                                          pac: {
                                            item,
                                            price_annual: item.plan.price_annual,
                                            price_weekly: item.plan.price_weekly,
                                            price_monthly: item.plan.price_monthly,
                                            id: item.plan_id,
                                          },
                                          location: {
                                            lat: item.location.lat,
                                            lon: item.location.lon,
                                            province: item.location.province,
                                            region: item.location.region,
                                          },
                                        },
                                      });
                                    }}
                                  >
                                    Perpanjang
                                  </button>
                                </div>
                              </div>
                            </>
                          )
                          /* End Perpanjang */
                        }
                      </div>

                      <button
                        className="flex justify-end mt-6 md:mt-0 items-center text-xs font-medium text-blue-500 hover:text-blue-700 duration-150 group"
                        onClick={() => {
                          // Dynamically get UTC value based on the province
                          const utc = getBaseValueByProvince(item.location.province); // Ensure 'item.location.province' is correct

                          // Dispatch location params update to the store
                          dispatch(
                            setLocationParams({
                              long: item.location.lon,
                              lat: item.location.lat,
                              region: item.location.region,
                              province: item.location.province,
                              utc: utc,
                            })
                          );

                          // Construct the URL with query parameters, ensuring proper encoding
                          const queryParams = new URLSearchParams({
                            long: item.location.lon,
                            lat: item.location.lat,
                            region: item.location.region,
                            province: item.location.province,
                            utc: utc,
                          }).toString();

                          // Navigate to the desired route with query params
                          navigate(`/detail/data-historis?${queryParams}`);
                        }}
                        id={`btn-list-sub-more-${index + 1}`}
                      >
                        <p className="">Selengkapnya </p>
                        <IoIosArrowForward className="group-hover:translate-x-1/2 duration-150" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="h-full">
              <div className="font-medium flex flex-col gap-2 items-center justify-center h-full text-slate-600">
                <p id="text-sub-not-found">Maaf, Data Langganan tidak ditemukan</p>
                <BiSad className="w-6 h-6" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListSubscription;
