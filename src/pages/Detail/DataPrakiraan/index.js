import React, { createRef, useEffect, useMemo, useRef, useState } from "react";
import html2pdf, { f } from "html2pdf.js";
import * as XLSX from "xlsx";

import Chart from "@components/molecule/Chart/Chart";
import { AiOutlineArrowLeft, AiOutlineLock } from "react-icons/ai";
import {
  IoIosArrowBack,
  IoIosArrowDown,
  IoIosArrowForward,
  IoMdCheckmark,
} from "react-icons/io";
import { FaLocationArrow, FaRegFilePdf } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoginPopup } from "@redux/features/login/loginSlice";
import Dropdown from "@components/molecule/Dropdown";
import { Menu } from "@headlessui/react";
import { BsFiletypeCsv } from "react-icons/bs";
import CustomBarChart from "@components/molecule/Chart/CustomChart/CustomeBarChart";
import LineChartCustome from "@components/molecule/Chart/CustomChart/ApexLineCustomeChart";
import LineChart from "@components/molecule/Chart/LineChart";

import axios from "axios";
import BarChart from "@components/molecule/Chart/BarChart";
import DetailMap from "@components/molecule/Map/DetailMap";
import WindowSize from "@hooks/windowSize";
import Skeleton from "react-loading-skeleton";
import Cookies from "js-cookie";
import Joyride from "react-joyride";
import { setUser } from "@redux/features/auth/authSlice";
import { fDate, fDateTime, fTime } from "@utils/format-date";

const DataPrakiraan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const windowSize = WindowSize();
  const urlParams = new URLSearchParams(window.location.search);

  const { user, token } = useSelector((state) => state.auth);
  const { locationParams } = useSelector((state) => state.location);

  // data potensi exacly should get from API
  const [lonLat, setLonLat] = useState({
    lon: 0,
    lat: 0,
    region: "",
    province: "",
    utc: "",
  });

  // checking payment
  const [subscription, setSubscription] = useState(true);
  const [subscriptionMonitoring, setSubscriptionMonitoring] = useState(false);
  const [listPayment, setListPayment] = useState([]);
  const [dataPayment, setDataPayment] = useState(null);
  const [isTahunan, setIsTahunan] = useState("default");

  const [months] = useState([
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ]);

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const { data } = await axios.get(
          // `${process.env.REACT_APP_URL_API}/payment/user`,
          `${process.env.REACT_APP_URL_API}/subscriptions/user/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const newData = data.map((item) => ({
          ...item,
          exp: item.end_date,
          id: item.id,
          lat: Number(item.location.lat),
          lon: Number(item.location.lon),
          paket: parseInt(item?.plan?.description) || 14,
          created_at: fDateTime(item.created_at, "yyyy-MM-dd HH:mm:ss"),
          updated_at: fDateTime(item.updated_at, "yyyy-MM-dd HH:mm:ss"),
        }));

        setListPayment(newData);
      } catch (error) {
        console.log(error);
      }
    };
    if (token) {
      fetchPayment();
    }
  }, [token]);

  useEffect(() => {
    if (locationParams) {
      return setLonLat({
        ...locationParams,
        lon: parseFloat(parseFloat(locationParams.long)?.toFixed(1)),
        lat: parseFloat(parseFloat(locationParams.lat)?.toFixed(1)),
      });
    } else {
      const long = parseFloat(urlParams.get("long"));
      const lat = parseFloat(urlParams.get("lat"));
      const region = urlParams.get("region");
      const province = urlParams.get("province");
      const utc = urlParams.get("utc");

      setLonLat({
        lon: parseFloat(parseFloat(long).toFixed(1)),
        lat: parseFloat(parseFloat(lat).toFixed(1)),
        region: region,
        province: province,
        utc: utc,
      });
    }
  }, [locationParams]);

  useEffect(() => {
    if (listPayment.length > 0) {
      // set checking payment
      for (const payment of listPayment) {
        const today = new Date().toISOString().split("T")[0]; // Mendapatkan tanggal hari ini dalam format yyyy-mm-dd
        const paymentExp = new Date(payment.exp).toISOString().split("T")[0]; // Konversi exp ke format yyyy-mm-dd

        if (
          parseFloat(payment.lat.toFixed(1)) === lonLat.lat &&
          parseFloat(payment.lon.toFixed(1)) === lonLat.lon &&
          payment?.plan?.name !== "Monitoring" &&
          payment.status.toLowerCase() === "success" &&
          paymentExp > today // Kondisi tambahan untuk memeriksa apakah exp lebih dari hari ini
        ) {
          const dateParts = payment.updated_at.split(" ")[0].split("-");
          const hourParts = payment.updated_at.split(" ")[1].split(":");

          // const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          if (isTahunan === "default") {
            var formattedDate = `${dateParts[2]} ${months.at(
              dateParts[1] - 1
            )} ${dateParts[0]} ${hourParts[0]}:${hourParts[1]}`;
          } else {
            var formattedDate = `${months.at(dateParts[1] - 1)} ${
              dateParts[0]
            }`;
          }

          setSubscription(true);
          setDataPayment({
            ...payment,
            updated: formattedDate,
          });
          break;
        } else {
          setSubscription(false);
        }
      }
    }
  }, [listPayment, lonLat, isTahunan]);

  // check if already have user and subscription
  useEffect(() => {
    if (!user || !subscription) {
      navigate(`/detail/data-historis${window.location.search}`);
    }
  }, [user, subscription]);

  const [loadingDownloadPdf, setLoadingDownloadPdf] = useState(false);

  const handleDownloadPdf = async (
    longitude,
    latitude,
    region,
    province,
    fileName,
    data = "bulanan",
    dayPackage,
    wait = 5,
    updatedAt
  ) => {
    const inputDate = dataPayment.created_at.split(" ")[0];
    const parts = inputDate.split("-");
    const outputDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

    setLoadingDownloadPdf(true);
    const origin = window.location.origin;
    const uri = `${origin}/detail/test-prakiraan?long=${longitude}&lat=${latitude}&region=${region}&province=${province}&data=${data}&package=${dayPackage}&updated=${updatedAt}&date=${outputDate}`;

    const body = {
      wait: wait,
      url: uri,
      filename: fileName,
      quality: 100,
    };

    try {
      const response = await axios.post(process.env.REACT_APP_PDF, body, {
        responseType: "blob",
        headers: {
          "Content-Disposition": "attachment",
        },
      });

      // Menggunakan objek response untuk menangani respons
      const blob = new Blob([response.data], { type: "application/pdf" });
      const anchor = document.createElement("a");
      anchor.href = URL.createObjectURL(blob);
      anchor.download = `${fileName}.pdf`;
      anchor.click();
      URL.revokeObjectURL(anchor.href);
    } catch (error) {
      console.error("Error downloading the file:", error);
    } finally {
      setLoadingDownloadPdf(false);
    }
  };

  const [slicePotensi, setSlicePotensi] = useState({
    start: 0,
    finish: 7,
    for: 7,
  });

  const resetSlicePotensi = () => {
    if (windowSize.width <= 768) {
      setSlicePotensi({
        start: 0,
        finish: 1,
        for: 1,
      });
    } else if (windowSize.width <= 1024) {
      setSlicePotensi({
        start: 0,
        finish: 2,
        for: 2,
      });
    } else {
      setSlicePotensi({
        start: 0,
        finish: 7,
        for: 7,
      });
    }
  };

  // data dummy BMKG still hard file
  // GHI
  const [dataGhi, setDataGhi] = useState([]);

  // ANGIN
  const [dataArahAngin, setDataArahAngin] = useState([]);

  const [dataKecepatanAngin, setDataKecepatanAngin] = useState([]);
  const [dataKecepatanAnginMaksimum, setDataKecepatanAnginMaksimum] = useState(
    []
  );

  // SUHU
  const [dataSuhu, setDataSuhu] = useState([]);
  const [dataSuhuMaksimum, setDataSuhuMaksimum] = useState([]);

  // TUTUPAN AWAN
  const [dataTutupanAwan, setDataTutupanAwan] = useState([]);

  // TUTUPAN AWAN NEW
  const [dataTutupanAwanTotal, setDataTutupanAwanTotal] = useState([]);
  const [dataTutupanAwanTinggi, setDataTutupanAwanTinggi] = useState([]);
  const [dataTutupanAwanMenengah, setDataTutupanAwanMenengah] = useState([]);
  const [dataTutupanAwanRendah, setDataTutupanAwanRendah] = useState([]);

  const [dataIndeksKebeningan, setDataIndeksKebeningan] = useState([]);
  // CURAH HUJAN
  const [dataCurahHujan, setDataCurahHujan] = useState([]);
  const [sliceIndeksKebeningan, setSliceIndeksKebeningan] = useState({
    start: 0,
    finish: 7,
    for: 7,
  });

  const resetSliceIndeksKebeningan = () => {
    if (windowSize.width <= 768) {
      setSliceIndeksKebeningan({
        start: 0,
        finish: 1,
        for: 1,
      });
    } else if (windowSize.width <= 1024) {
      setSliceIndeksKebeningan({
        start: 0,
        finish: 2,
        for: 2,
      });
    } else {
      setSliceIndeksKebeningan({
        start: 0,
        finish: 7,
        for: 7,
      });
    }
  };

  const currentDate = new Date();

  const currentTime = currentDate
    .toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .split(":")[0];

  // table data prakiraan
  const [tableData, setTableData] = useState([]);
  const [tableDataBulanan, setTableDataBulanan] = useState([]);
  const [sliceIndex, setSliceIndex] = useState({
    start: 0,
    end: 24,
    for: 24,
  });

  const resetSliceIndex = () => {
    if (windowSize.width <= 768) {
      setSliceIndex({
        start: 0,
        end: 3,
        for: 3,
      });
    } else if (windowSize.width <= 1024) {
      setSliceIndex({
        start: 0,
        end: 6,
        for: 6,
      });
    } else {
      setSliceIndex({
        start: 0,
        end: 24,
        for: 24,
      });
    }
  };

  useEffect(() => {
    if (windowSize?.width) {
      resetSliceIndex();
      resetSlicePotensi();
      resetSliceIndeksKebeningan();
    }
  }, [windowSize?.width]);

  const [bulanan] = useState([
    "bulan-1",
    "bulan-2",
    "bulan-3",
    "bulan-4",
    "bulan-5",
    "bulan-6",
    "bulan-7",
  ]);

  // select option table data
  const [tableDataOption, setTableDataOption] = useState(0);

  const [dataBulananGhi, setDataBulananGhi] = useState(null);
  const [dataBulananSuhu, setDataBulananSuhu] = useState(null);
  const [dataBulananIndex, setDataBulananIndex] = useState(null);

  useEffect(() => {
    if (
      subscription &&
      currentTime &&
      dataArahAngin.length > 0 &&
      dataKecepatanAngin.length > 0 &&
      dataSuhu.length > 0 &&
      dataSuhuMaksimum.length > 0 &&
      dataCurahHujan.length > 0 &&
      dataTutupanAwanTotal.length > 0 &&
      dataTutupanAwanTinggi.length > 0 &&
      dataTutupanAwanMenengah.length > 0 &&
      dataTutupanAwanRendah.length > 0

      // dataIndeksKebeningan.length > 0 &&
      // dataTutupanAwan.length > 0 &&
    ) {
      setTableData([
        {
          id: 1,
          name: (
            <select
              id="prakiraan-3"
              className="bg-[#00AF50] rounded border px-2 border-black/20 cursor-pointer"
              onChange={(e) => {
                setTableDataOption(e.target.value);
                resetSliceIndex();
              }}
            >
              {dataArahAngin.map((item, index) => (
                <option value={index}>{item.name}</option>
              ))}
            </select>
          ),
          data: dataArahAngin[tableDataOption].hour,
          border: false,
        },
        {
          id: 2,
          name: "Angin (m/s)",
          data: dataKecepatanAngin[tableDataOption]?.data[0]?.data?.map(
            (item) => parseFloat(parseFloat(item).toFixed(1))
          ),
          dataDir: dataArahAngin[tableDataOption]?.data[0]?.data?.map(
            (item) => item
          ),
          border: false,
        },
        {
          id: 3,
          name: "Kecepatan Maksimum (m/s)",
          data: dataKecepatanAnginMaksimum[tableDataOption]?.data[0]?.data?.map(
            (item) => item
          ),
          border: true,
        },
        {
          id: 4,
          name: "Suhu Maksimum (°C)",
          data: dataSuhuMaksimum[tableDataOption]?.data[0]?.data?.map((item) =>
            parseFloat(parseFloat(item).toFixed(1))
          ),
          border: false,
        },
        {
          id: 5,
          name: "Suhu (°C)",
          data: dataSuhu[tableDataOption]?.data[0]?.data?.map((item) =>
            parseFloat(parseFloat(item).toFixed(1))
          ),
          border: true,
        },
        {
          id: 6,
          name: "Tutupan Awan (%)",
          data: dataTutupanAwanTotal[tableDataOption]?.data[0]?.data?.map(
            (item) =>
              // parseFloat(parseFloat(item).toFixed(1))
              Math.round(item)
          ),
          border: false,
        },
        {
          id: 7,
          name: "Tinggi",
          data: dataTutupanAwanTinggi[tableDataOption]?.data[0]?.data?.map(
            (item) =>
              // parseFloat(parseFloat(item).toFixed(1))
              Math.round(item)
          ),
          border: false,
        },
        {
          id: 8,
          name: "Menengah",
          data: dataTutupanAwanMenengah[tableDataOption]?.data[0]?.data?.map(
            (item) =>
              // parseFloat(parseFloat(item).toFixed(1))
              Math.round(item)
          ),
          border: false,
        },
        {
          id: 9,
          name: "Rendah",
          data: dataTutupanAwanRendah[tableDataOption]?.data[0]?.data?.map(
            (item) =>
              // parseFloat(parseFloat(item).toFixed(1))
              Math.round(item)
          ),
          border: true,
        },
        {
          id: 10,
          name: "Curah Hujan (mm)",
          data: dataCurahHujan[tableDataOption]?.data[0]?.data?.map((item) =>
            parseFloat(parseFloat(item).toFixed(1))
          ),
          border: false,
        },
      ]);
    }

    if ((dataBulananGhi, dataBulananSuhu, dataBulananIndex)) {
      const now = new Date();
      const currentMonth = now.getMonth();

      let categoriesBulanan = [];

      for (let i = 0; i < bulanan.length; i++) {
        const targetMonthIndex = (currentMonth + i) % 12;
        const targetMonthName = months[targetMonthIndex];

        categoriesBulanan.push(targetMonthName);
      }

      setTableDataBulanan([
        {
          id: 1,
          name: <div />,
          data: categoriesBulanan,
          border: false,
        },
        {
          id: 2,
          name: "Suhu Maksimum (°C)",
          data: dataBulananSuhu?.data[0].data,
          border: true,
        },
        {
          id: 3,
          name: "Potensi Energi Surya",
          data: dataBulananGhi?.data[0].data,
          border: true,
        },
        {
          id: 4,
          name: "Indeks Kebeningan",
          data: dataBulananIndex?.data[0].data,
          border: true,
        },
      ]);
    }
  }, [
    subscription,
    currentTime,
    dataIndeksKebeningan,
    tableDataOption,
    dataArahAngin,
    dataKecepatanAngin,
    // dataTutupanAwan,
    dataSuhu,
    dataCurahHujan,
    dataBulananSuhu,
    dataBulananGhi,
    dataBulananIndex,
    dataTutupanAwanTotal,
    dataTutupanAwanTinggi,
    dataTutupanAwanMenengah,
  ]);

  const getDataPrakiraanBulanan = async (nameIndex, title) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_URL_API}/search/prakiraan`,
        {
          distance: "10km",
          lat: lonLat.lat,
          lon: lonLat.lon,
          nameindex: nameIndex,
          time: "bulanan",
          datetime: "03-01-2023",
        }
      );

      if (data?.error || data?.message) {
        return {
          data: [
            {
              name: title,
              data: bulanan.map((month) => 0),
            },
          ],
          categories: bulanan,
        };
      } else {
        let results =
          data.hits.hits.length > 0 || data.hits.hits[0]?._source
            ? data.hits.hits[0]._source
            : null;

        const filterCategories = Object.keys(results)
          .filter((f) => f !== "location" && f !== "Lon" && f !== "Lat")
          .sort();

        return {
          data: [
            {
              name: title,
              data: bulanan.map((month) =>
                parseFloat(parseFloat(results[month]).toFixed(1))
              ),
            },
          ],
          categories: bulanan,
        };
      }
    } catch (error) {
      console.log(error);
      return {
        data: [
          {
            name: title,
            data: bulanan.map((month) => parseFloat(0)),
          },
        ],
        categories: bulanan,
      };
    }
  };

  useEffect(() => {
    if (lonLat?.lon) {
      const now = new Date();
      const currentMonth = now.getMonth();

      let categoriesBulanan = [];

      for (let i = 0; i < bulanan.length; i++) {
        const targetMonthIndex = (currentMonth + i) % 12;
        const targetMonthName = months[targetMonthIndex];

        categoriesBulanan.push(targetMonthName);
      }

      getDataPrakiraanBulanan("potensi-bulanan", "Potensi Energi Surya").then(
        (res) =>
          setDataBulananGhi({
            data: res.data,
            categories: categoriesBulanan,
          })
      );
      getDataPrakiraanBulanan(
        "temperature-maximum-bulanan",
        "Temperatur Maksimum"
      ).then((res) =>
        setDataBulananSuhu({
          data: res.data,
          categories: categoriesBulanan,
        })
      );
      getDataPrakiraanBulanan("kebeningan-tahunan", "Indeks Kebeningan").then(
        (res) =>
          setDataBulananIndex({
            data: res.data,
            categories: categoriesBulanan,
          })
      );
    }
  }, [lonLat]);

  useEffect(() => {
    if (lonLat.lon && lonLat.lat && dataPayment) {
      const inputDate = dataPayment.created_at.split(" ")[0];
      const parts = inputDate.split("-");
      const outputDate = `${parts[2]}-${parts[1]}-${parts[0]}`;

      // new
      getDailyPrakiraanData(
        "DSWRF",
        lonLat.lon,
        lonLat.lat,
        "GHI",
        dataPayment?.paket
      ).then(setDataGhi);
      getDailyPrakiraanData(
        "VGRD",
        lonLat.lon,
        lonLat.lat,
        "Data Arah Angin",
        dataPayment?.paket || 7
      ).then(setDataArahAngin);
      getDailyPrakiraanData(
        "UGRD",
        lonLat.lon,
        lonLat.lat,
        "Data Angin",
        dataPayment?.paket || 7
      ).then(setDataKecepatanAngin);
      getDailyPrakiraanData(
        "GUST",
        lonLat.lon,
        lonLat.lat,
        "Data Angin Maksimum ",
        dataPayment?.paket || 7
      ).then(setDataKecepatanAnginMaksimum);
      getDailyPrakiraanData(
        "TMAX",
        lonLat.lon,
        lonLat.lat,
        "Suhu Maksimum",
        dataPayment?.paket || 7
      ).then(setDataSuhuMaksimum);
      getDailyPrakiraanData(
        "TMP",
        lonLat.lon,
        lonLat.lat,
        "Suhu",
        dataPayment?.paket || 7
      ).then(setDataSuhu);
      getDailyPrakiraanData(
        "TCDC",
        lonLat.lon,
        lonLat.lat,
        "Tutupan Awan Total",
        dataPayment?.paket || 7
      ).then(setDataTutupanAwanTotal);
      getDailyPrakiraanData(
        "HCDC",
        lonLat.lon,
        lonLat.lat,
        "Tutupan Awan Tinggi",
        dataPayment?.paket || 7
      ).then(setDataTutupanAwanTinggi);
      getDailyPrakiraanData(
        "MCDC",
        lonLat.lon,
        lonLat.lat,
        "Tutupan Awan Menengah",
        dataPayment?.paket || 7
      ).then(setDataTutupanAwanMenengah);
      getDailyPrakiraanData(
        "LCDC",
        lonLat.lon,
        lonLat.lat,
        "Tutupan Awan Rendah",
        dataPayment?.paket || 7
      ).then(setDataTutupanAwanRendah);
      getDailyPrakiraanData(
        "APCP",
        lonLat.lon,
        lonLat.lat,
        "Curah Hujan",
        dataPayment?.paket || 7
      ).then(setDataCurahHujan);
      getDailyPrakiraanData(
        "PV",
        lonLat.lon,
        lonLat.lat,
        "PV Output",
        dataPayment?.paket || 7
      ).then(setDataIndeksKebeningan);

      // finish

      // getDailyPrakiraan(
      //   "ghi-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "GHI",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataGhi(res.slice(0, dataPayment?.paket)));
      // getDailyPrakiraan(
      //   "pv-output-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "PV Output",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataIndeksKebeningan(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "kecepatan-angin-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Data Angin",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataKecepatanAngin(res.slice(0, dataPayment?.paket)));
      // getDailyPrakiraan(
      //   "kecepatan-angin-maksimum-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Data Angin Maksimum",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataKecepatanAnginMaksimum(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "arah-angin-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Data Angin",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataArahAngin(res.slice(0, dataPayment?.paket)));
      // getDailyPrakiraan(
      //   "temperature-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Suhu",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataSuhu(res.slice(0, dataPayment?.paket)));
      // getDailyPrakiraan(
      //   "tutupan-awan-total-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Tutupan Awan Total",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataTutupanAwanTotal(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "tutupan-awan-tinggi-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Tutupan Awan Tinggi",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataTutupanAwanTinggi(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "tutupan-awan-menengah-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Tutupan Awan Menengah",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataTutupanAwanMenengah(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "tutupan-awan-rendah-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Tutupan Awan Rendah",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) =>
      //   setDataTutupanAwanRendah(res.slice(0, dataPayment?.paket))
      // );
      // getDailyPrakiraan(
      //   "curah-hujan-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Tutupan Awan Rendah",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataCurahHujan(res.slice(0, dataPayment?.paket)));
      // getDailyPrakiraan(
      //   "temperature-maksimum-harian",
      //   lonLat.lon,
      //   lonLat.lat,
      //   parseInt(currentTime),
      //   "Suhu Maksimum",
      //   lonLat.utc,
      //   outputDate
      // ).then((res) => setDataSuhuMaksimum(res.slice(0, dataPayment?.paket)));
    }
  }, [lonLat, dataPayment]);

  const [newHour, setNewHour] = useState([]);

  const [dataChartGhi, setDataChartGhi] = useState([]);
  const [isSameLenght, setIsSameLenght] = useState(true);
  const [curent, setCurent] = useState(null);

  const [dataChartPv, setDataChartPv] = useState([]);
  const [isSameLenghtPv, setIsSameLenghtPv] = useState(true);
  const [curentPv, setCurentPv] = useState(null);

  function checkLengthArray(array) {
    for (const obj of array) {
      if (obj.hour.length !== 24) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    if (dataGhi.length > 0) {
      //  setDataGhi((prev) => prev.slice(slicePotensi.start, slicePotensi.finish))
      const ghi = dataGhi.slice(slicePotensi.start, slicePotensi.finish);

      setDataChartGhi(ghi);
      setIsSameLenght(checkLengthArray(ghi));
      setNewHour(
        ghi
          .map((item) => item.hour.map((hr) => `${hr}||${item.name}`))
          .reduce((acc, cur) => acc.concat(cur), [])
      );
      setCurent(ghi.find((item) => item.isCustomeColor));
    }

    if (dataIndeksKebeningan?.length) {
      const pv = dataIndeksKebeningan?.slice(
        sliceIndeksKebeningan.start,
        sliceIndeksKebeningan.finish
      );

      setDataChartPv(pv);
      setIsSameLenghtPv(checkLengthArray(pv));
      setCurentPv(pv.find((item) => item.isCustomeColor));
    }
  }, [
    slicePotensi.finish,
    dataGhi,
    sliceIndeksKebeningan.finish,
    dataIndeksKebeningan,
  ]);

  const refsById = useMemo(() => {
    const refs = [];
    dataGhi
      .slice(slicePotensi.start, slicePotensi.finish)
      .forEach((item, i) => {
        refs[i] = React.createRef(null);
      });
    return refs;
  }, [dataGhi]);

  // get elemnt marker
  const testRef = refsById?.map((item, i) => {
    let test = item?.current?.chart?.w?.globals?.dom?.baseEl
      .querySelector(".apexcharts-series")
      ?.querySelectorAll(".apexcharts-marker");
    return {
      id: item?.current?.chart?.w?.globals?.dom?.baseEl?.querySelector(
        ".apexcharts-series"
      )?.id,
      first: test?.length > 0 ? test[0] : null,
      last: test?.length > 0 ? test[test?.length - 1] : null,
    };
  });

  const handleTakeTour = async (tour) => {
    try {
      const data = await axios.post(
        `${process.env.REACT_APP_URL_API}/taketour`,

        {
          taketour: tour,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      dispatch(
        setUser({
          login: {
            user: { ...user, taketour: tour },
            token: token,
          },
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  const removeNumber = (inputString, numberToRemove) => {
    const regex = new RegExp(numberToRemove, "g");
    return inputString.replace(regex, "");
  };

  // const custom = {
  //   skip: (
  //     <button className="bg-red-600 rounded-md px-4 py-1.5">
  //       <strong className="text-white font-bold text-lg">Lewati</strong>
  //     </button>
  //   ),
  //   back: <strong className="text-[#004a14] font-bold px-3">Kembali</strong>,
  //   next: (
  //     <button className="bg-[#004a14] rounded-xl px-3 py-1">
  //       <strong className="text-white font-bold">Lanjutkan</strong>
  //     </button>
  //   ),
  //   last: (
  //     <button className="bg-[#004a14] rounded-xl px-3 py-1">
  //       <strong className="text-white font-bold">Selesai</strong>
  //     </button>
  //   ),
  // };

  const custom = {
    skip: (
      <button id="tour5-button-lewati">
        <strong>Lewati</strong>
      </button>
    ),
    back: <button id="tour5-button-lewati">Kembali</button>,
    next: <button id="tour5-button-lanjutkan">Lanjutkan</button>,
    last: <button id="tour5-button-lanjutkan">Selesai</button>,
  };

  // const [{ run, steps }, setSteps] = useState({
  //   run: true,
  //   steps: [
  //     {
  //       content: (
  //         <div>
  //           <h2>
  //             Anda dapat mengunduh data prakiraan dalam format csv maupun pdf
  //           </h2>
  //           <p className="text-right -mb-7 mt-2 font-semibold">1 dari 3</p>
  //         </div>
  //       ),
  //       disableBeacon: true,
  //       placement: "bottom",
  //       target: "#prakiraan-1",
  //       title: <p className="text-2xl text-green-500 font-bold">Unduh Data</p>,
  //       locale: custom,
  //     },
  //     {
  //       content: (
  //         <div>
  //           <h2>
  //             Pilihan untuk mengganti periode waktu data untuk ditampilkan
  //           </h2>
  //           <p className="text-right -mb-7 mt-2 font-semibold">2 dari 3</p>
  //         </div>
  //       ),
  //       placement: "bottom",
  //       target: "#prakiraan-2",
  //       title: (
  //         <p className="text-2xl text-green-500 font-bold">
  //           Periode Waktu Data
  //         </p>
  //       ),
  //       locale: custom,
  //     },
  //     {
  //       content: (
  //         <div>
  //           <h2>Pilihan untuk memilih periode hari</h2>
  //           <p className="text-right -mb-7 mt-2 font-semibold">3 dari 3</p>
  //         </div>
  //       ),
  //       placement: "right",
  //       target: "#prakiraan-3",
  //       title: (
  //         <p className="text-2xl text-green-500 font-bold">Periode Hari</p>
  //       ),
  //       locale: custom,
  //     },
  //   ],
  // });

  const [{ run, steps }, setSteps] = useState({
    run: true,
    steps: [
      {
        content: (
          <div>
            <h2>
              Anda dapat mengunduh data prakiraan dalam format csv maupun pdf
            </h2>
            {/* <p className="text-right -mb-7 mt-2 font-semibold">1 dari 3</p> */}
          </div>
        ),
        disableBeacon: true,
        placement: "bottom",
        target: "#prakiraan-1",
        title: "Unduh Data",
        locale: custom,
      },
      {
        content: (
          <div>
            <h2>
              Pilihan untuk mengganti periode waktu data untuk ditampilkan
            </h2>
            {/* <p className="text-right -mb-7 mt-2 font-semibold">2 dari 3</p> */}
          </div>
        ),
        placement: "bottom",
        target: "#prakiraan-2",
        title: "Periode Waktu Data",
        locale: custom,
      },
      {
        content: (
          <div>
            <h2>Pilihan untuk memilih periode hari</h2>
            {/* <p className="text-right -mb-7 mt-2 font-semibold">3 dari 3</p> */}
          </div>
        ),
        placement: "right",
        target: "#prakiraan-3",
        title: "Periode Hari",
        locale: custom,
      },
    ],
  });
  const generatePDF = () => {
    const element = document.getElementById("content-to-pdf"); // Ambil elemen HTML yang ingin dikonversi
    const options = {
      margin: 0, // Menghapus margin untuk memaksimalkan ruang halaman
      filename: "web-content.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2, // Tingkatkan skala gambar untuk kualitas yang lebih tinggi
        logging: false, // Nonaktifkan logging untuk mengurangi noise di konsol
        letterRendering: true, // Untuk rendering teks yang lebih baik
      },
      jsPDF: {
        unit: "mm", // Gunakan milimeter untuk satuan pengukuran
        format: "a3", // Gunakan format A4 agar lebih cocok dengan standar halaman
        orientation: "portrait", // Orientasi halaman portrait
        compress: true, // Kompres PDF agar ukuran file lebih kecil
      },
    };

    // Menggunakan html2pdf untuk mengonversi elemen ke PDF
    html2pdf().from(element).set(options).save();
  };
  const prepareDataForSheets = () => {
    const sheetData = [];

    // Loop setiap opsi pada tableData[0].name.props.children
    tableData[0].name.props.children.forEach((item, index) => {
      const sheetName = item.props.children; // Nama sheet berdasarkan tanggal
      const date = item.props.children;

      // Membuat header dan data dari tableData
      const header = ["Parameter", date];
      const rows = tableData.map((row) => [
        row.name.props ? "Jam" : row.name,
        ...row.data,
      ]);

      // Menambahkan data GHI berdasarkan tanggal yang sama
      const ghiEntry = dataGhi.find((ghi) => ghi.name === date);
      if (ghiEntry) {
        // Menambahkan header GHI
        rows.push(["", ""]);
        rows.push(["Hour", "GHI"]);

        ghiEntry.hour.forEach((hour, ghiIndex) => {
          rows.push([hour, ghiEntry.data[0].data[ghiIndex]]);
        });
      }
      const pvEntry = dataIndeksKebeningan.find((pv) => pv.name === date);
      if (pvEntry) {
        // Menambahkan header GHI
        rows.push(["", ""]);
        rows.push(["Hour", "PV Output"]);

        pvEntry.hour.forEach((hour, pvIndex) => {
          rows.push([hour, pvEntry.data[0].data[pvIndex]]);
        });
      }

      // Tambahkan header dan data ke setiap sheet
      const sheet = [header, ...rows];
      sheetData.push({ name: sheetName, data: sheet });
    });

    return sheetData;
  };

  // Fungsi untuk mengunduh file Excel
  const downloadExcel = () => {
    const workbook = XLSX.utils.book_new();
    const sheets = prepareDataForSheets();

    // Tambahkan setiap sheet ke workbook
    sheets.forEach(({ name, data }) => {
      const worksheet = XLSX.utils.aoa_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, name);
    });

    // Generate Excel file dan trigger download
    XLSX.writeFile(workbook, "tableData.xlsx");
  };

  //
  const isSubscribeMonitoring = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return (
      listPayment.filter((f) => {
        const isNotExpired =
          new Date(f.exp).toISOString().split("T")[0] > today;
        const isMonitoring =
          f?.plan?.description === "For Monitoring" ||
          f?.plan?.name === "Monitoring";
        const isSuccess = f?.status?.toLowerCase() === "success";
        const isLocationMatch =
          parseFloat(f.lat.toFixed(1)) === lonLat.lat &&
          parseFloat(f.lon.toFixed(1)) === lonLat.lon;

        return isNotExpired && isMonitoring && isSuccess && isLocationMatch;
      }) || []
    );
  }, [listPayment, lonLat]);

  return (
    <div
      id="content-to-pdf"
      className="font-poppins bg-[#F7FFF4] px-[2%] pt-10  2xl:container mx-auto"
    >
      {/* Tour Prakiraann */}
      {user?.taketour.toString().includes("4") ||
        (!Cookies.get("tour-prakiraan") &&
          window.location.pathname.includes("/detail/data-prakiraan") && (
            <Joyride
              continuous
              callback={(e) => {
                if (e.action === "reset") {
                  Cookies.set("tour-prakiraan", "done");
                  if (user) {
                    let tour = user?.taketour.toString();
                    if (tour.includes("4")) {
                      if (tour.length > 1) {
                        const output = removeNumber(tour, "4");
                        handleTakeTour(parseInt(output));
                      } else {
                        handleTakeTour(0);
                      }
                    }
                  }
                }
              }}
              steps={steps}
              hideCloseButton
              scrollToFirstStep
              scrollOffset={150}
              showSkipButton
              showProgress
              disableOverlayClose={true}
              styles={{
                options: {
                  primaryColor: "#004a14",
                },
              }}
            />
          ))}

      <div className="flex items-center justify-between gap-2 mb-6 pb-4">
        <div className="flex items-center gap-2 text-base lg:text-2xl text-main-500">
          <button onClick={() => navigate(user ? "/beranda" : "/")}>
            <AiOutlineArrowLeft className="text-black" />
          </button>
          <p className="font-bold ">{lonLat.region}</p>
        </div>
      </div>
      <div className="flex justify-between pb-2 relative">
        <div className="flex items-center gap-4 text-xs lg:text-sm">
          <button
            className={`text-black px-4 pt-1 pb-6  hover:opacity-60 duration-150`}
            onClick={() => {
              if (!user) {
                dispatch(setLoginPopup(true));
              } else if (user && subscription) {
                navigate(
                  `/detail/data-historis?long=${lonLat?.lon}&lat=${lonLat?.lat}&region=${lonLat?.region}&province=${lonLat?.province}`
                );
              }
            }}
          >
            Data Historis
          </button>
          <button
            className={`text-black px-4 pt-1 border-b-[#1F8A70] border-b-4 flex gap-1 items-center pb-6 hover:opacity-60 duration-150`}
          >
            Data Prakiraan
          </button>
          <button
            className={`text-black px-4 pt-1 flex gap-1 items-center pb-6 hover:opacity-60 duration-150`}
            onClick={() => {
              if (!user) {
                dispatch(setLoginPopup(true));
              } else if (user && isSubscribeMonitoring.length) {
                navigate(
                  `/detail/data-monitoring?long=${lonLat?.lon}&lat=${lonLat?.lat}&region=${lonLat?.region}&province=${lonLat?.province}`
                );
              }
            }}
          >
            Monitoring{" "}
            {isSubscribeMonitoring.length && user ? null : <AiOutlineLock />}
          </button>
          <div className="w-full border-b-2 absolute bottom-2" />
        </div>

        {/* drop down download */}
        {loadingDownloadPdf ? (
          <div className="text-xs opacity-50 cursor-not-allowed lg:text-sm flex items-center justify-between gap-2 border lg:py-1 text-black h-10 w-40 px-4 rounded bg-white">
            Downloading...
          </div>
        ) : (
          <div id="prakiraan-1" className="">
            <Dropdown
              width={"100%"}
              position={"right-0"}
              customDropdown={""}
              title={
                <p className="text-xs lg:text-sm flex items-center justify-between gap-2 border lg:py-1 text-black h-10 w-40 px-4 rounded bg-white">
                  Download <IoIosArrowDown />
                </p>
              }
            >
              <div className="px-1 py-1 shadow border rounded  z-50 w-full bg-white">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={`${
                        active
                          ? "opacity-70 duration-150 text-black"
                          : "text-black font-medium"
                      } group  flex w-full gap-2 items-center text-xs rounded-md disabled:opacity-50 px-1 py-2 font-medium`}
                      onClick={() => {
                        navigate(
                          `/detail/test-prakiraan?long=${lonLat?.lon}&lat=${lonLat?.lat}&region=${lonLat?.region}&province=${lonLat?.province}`
                        );
                      }}
                    >
                      <FaRegFilePdf className="text-red-500" />
                      PDF
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={downloadExcel}
                      className={`${
                        active
                          ? "opacity-70 duration-150 text-black"
                          : "text-black font-medium"
                      } group  flex w-full gap-2 disabled:opacity-50 items-center text-xs rounded-md px-1 py-2 font-medium`}
                    >
                      <BsFiletypeCsv className="text-green-500" />
                      CSV
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Dropdown>
          </div>
        )}
      </div>

      <select
        id="prakiraan-2"
        className="w-full border py-2 px-3 my-4 text-sm cursor-pointer font-medium"
        onChange={(e) => {
          setIsTahunan(e.target.value);
          resetSliceIndex();
        }}
        defaultValue={isTahunan}
        disabled={tableDataBulanan.length === 0}
      >
        <option value={"default"}>{dataPayment?.paket} Hari</option>
        <option value={"bulanan"}>7 Bulan</option>
      </select>

      <div id="downloadPdf capture-component">
        <div className="pb-8">
          <div className="flex justify-between items-center">
            <p className="font-medium">
              Data Prakiraan{" "}
              {isTahunan === "default"
                ? `${dataPayment?.paket} Hari`
                : "7 Bulan"}
            </p>
            <p className="text-sm">Diperbaharui tanggal {fDate(new Date())}</p>
          </div>

          {/* Maps Prakiraan */}
          <div className="h-[387] bg-[#EBFFE4] box-shadow mt-2 p-2">
            <div>
              <p className="text-xl">Maps</p>
            </div>
            <div className="h-[329px]">
              {user?.status !== "Admin" && (
                <DetailMap
                  center={
                    urlParams.get("lat") && urlParams.get("long")
                      ? [
                          parseFloat(urlParams.get("lat")),
                          parseFloat(urlParams.get("long")),
                        ]
                      : [-6.2088, 106.8456]
                  }
                  zoom={13}
                  data={lonLat}
                />
              )}
            </div>
          </div>

          {isTahunan === "default" && (
            <div className="bg-[#EBFFE4] box-shadow rounded p-2 mt-4">
              <p className="text-center text-xl ">
                Global Horizontal Irradiance (GHI)
              </p>
              <div className="flex mt-4 relative">
                {/* Chart */}
                <div
                  className={`absolute -bottom-3.5 z-[5] w-full ${
                    isSameLenght ? "" : "hidden"
                  }`}
                >
                  <LineChart
                    data={[
                      {
                        name: "GHI",
                        data: dataChartGhi
                          .map((item) => item.data[0].data)
                          .reduce((acc, cur) => acc.concat(cur), []),
                      },
                    ]}
                    categories={newHour.map((f, i) => {
                      const indexOf = newHour.findIndex(
                        (elemen) =>
                          elemen === `${curent?.curentTime}||${curent?.name}`
                      );
                      return `${curent?.curentTime}||${curent?.name}` === f
                        ? `${f.split("||")[0]}.`
                        : i % 3 === 0 &&
                          // `${curent?.curentTime}||${curent?.name}`
                          i !== indexOf - 1 &&
                          i !== indexOf + 1
                        ? f.split("||")[0]
                        : "";
                    })}
                    gridColor={false}
                    height={"200"}
                    title={"kWh/m²"}
                    styleTitle={{
                      fontSize: "10px",
                      color: "#FF6B36",
                    }}
                    colors={["#FFA537"]}
                    maxCount={7}
                    columnWidth={80}
                    yasis={{
                      max: getMaxValue(dataGhi),
                      tickAmount: 4,
                      labels: {
                        formatter: function (value) {
                          return Math.ceil(value);
                        },
                      },
                    }}
                    xasis={{
                      axisBorder: {
                        show: false,
                      },
                      axisTicks: {
                        show: false,
                      },
                    }}
                    tooltip={{
                      x: {
                        formatter: (
                          seriesName,
                          { series, seriesIndex, dataPointIndex, w }
                        ) => {
                          return `Pukul ${
                            newHour[dataPointIndex].split("||")[0]
                          }.00`;
                        },
                      },
                    }}
                    annotations={{
                      xaxis: [
                        {
                          x: `${
                            curent?.isCustomeColor
                              ? `${curent.curentTime}.`
                              : 50
                          }`,
                          strokeDashArray: 0,
                          borderColor: "rgb(239, 68, 68)",
                          borderWidth: 2,
                          label: {
                            style: {
                              color: "#fff",
                              background: "rgb(239, 68, 68)",
                            },
                            text: "Saat ini",
                          },
                        },
                      ],
                    }}
                  />
                  <div className="absolute bottom-[25px] left-0.5 text-[8px] font-bold">
                    Jam (
                    {lonLat.utc === 7
                      ? "WIB"
                      : lonLat.utc === 8
                      ? "WITA"
                      : lonLat.utc === 9
                      ? "WIT"
                      : "Jam"}
                    )
                  </div>
                </div>

                {/* {dataGhi
                  .slice(slicePotensi.start, slicePotensi.finish) */}
                {dataChartGhi.map((item, index) => (
                  <div
                    key={index}
                    className={`text-center relative  ${
                      index === 0 ? "w-[112%]" : "w-[100%]"
                    }`}
                  >
                    {/* Carousel */}
                    <div className="bg-[#00AF50] flex justify-between items-center">
                      {index === 0 ? (
                        <button
                          className="disabled:opacity-30 hover:opacity-30"
                          disabled={
                            item.name === dataGhi[0].name ? true : false
                          }
                          onClick={() => {
                            setSlicePotensi({
                              ...slicePotensi,
                              start: slicePotensi.start - 1,
                              finish: slicePotensi.finish - 1,
                            });
                          }}
                        >
                          <IoIosArrowBack className="" />
                        </button>
                      ) : (
                        <div />
                      )}
                      <p className="">{item.name}</p>
                      {index === slicePotensi.for - 1 ? (
                        <button
                          className="disabled:opacity-30 hover:opacity-30"
                          disabled={
                            item.name === dataGhi[dataGhi.length - 1].name
                              ? true
                              : false
                          }
                          onClick={() => {
                            setSlicePotensi({
                              ...slicePotensi,
                              start: slicePotensi.start + 1,
                              finish: slicePotensi.finish + 1,
                            });
                          }}
                        >
                          <IoIosArrowForward className="" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                    <div className="border rounded-br rounded-bl h-[200px]">
                      <div
                        className={`relative ${isSameLenght ? "hidden" : ""}`}
                      >
                        <LineChart
                          data={item.data}
                          categories={
                            item.hour.length > 15
                              ? item.hour.map((f, i) =>
                                  (i % 3 === 0 &&
                                    item.curentTime - 1 !== parseInt(f) &&
                                    item.curentTime + 1 !== parseInt(f) &&
                                    item.isCustomeColor) ||
                                  (i % 3 === 0 && !item.isCustomeColor) ||
                                  (item.curentTime === parseInt(f) &&
                                    item.isCustomeColor)
                                    ? f
                                    : ""
                                )
                              : item.hour
                          }
                          gridColor={false}
                          refsById={refsById[index]}
                          height={"200"}
                          title={"kWh/m²"}
                          styleTitle={{
                            fontSize: "10px",
                            color: "#FF6B36",
                          }}
                          yasis={{
                            max: getMaxValue(dataGhi),
                            tickAmount: 4,
                          }}
                          colors={["#FFA537", "rgba(249, 115, 22, 1)"]}
                          maxCount={7}
                          columnWidth={80}
                          curentTime={item.curentTime}
                          showYAxis={index === 0 ? true : false}
                          customColors={item.isCustomeColor ? "#FF0000" : false}
                          xasis={{
                            axisBorder: {
                              show: false,
                            },
                            axisTicks: {
                              show: false,
                            },
                          }}
                          tooltip={{
                            x: {
                              formatter: (
                                seriesName,
                                { series, seriesIndex, dataPointIndex, w }
                              ) => `Pukul ${item.hour[dataPointIndex]}.00`,
                            },
                          }}
                          annotations={{
                            xaxis: [
                              {
                                x: `${
                                  item.isCustomeColor ? item.curentTime : 50
                                }`,
                                strokeDashArray: 0,
                                borderColor: "rgb(239, 68, 68)",
                                borderWidth: 2,
                                label: {
                                  style: {
                                    color: "#fff",
                                    background: "rgb(239, 68, 68)",
                                  },
                                  text: "Saat ini",
                                },
                              },
                            ],
                          }}
                          chart={{
                            animations: {
                              enabled: index === 0 ? false : true,
                            },
                          }}
                        />
                        {index === 0 && (
                          <div className="absolute bottom-[9px] left-0.5 text-[8px] font-bold">
                            Jam (
                            {lonLat.utc === 7
                              ? "WIB"
                              : lonLat.utc === 8
                              ? "WITA"
                              : lonLat.utc === 9
                              ? "WIT"
                              : "Jam"}
                            )
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#EBFFE4] box-shadow rounded p-2 mt-4">
                <p className="text-center text-base font-medium ">
                  Potensi Energi Surya
                </p>
                <div className="relative">
                  <BarChart
                    data={dataBulananGhi.data}
                    categories={dataBulananGhi.categories}
                    title={"kWh/m²"}
                    styleTitle={{
                      fontSize: "10px",
                      color: "#FF6B36",
                    }}
                    colors={["#FFA537", "rgba(249, 115, 22, 1)"]}
                    height={"300"}
                    yaxis={{
                      // max: 7,
                      tickAmount: 10,
                    }}
                  />
                </div>
              </div>
              <div className="bg-[#EBFFE4] box-shadow rounded p-2 mt-2">
                <p className="text-center text-base font-medium ">
                  Indeks Kebeningan
                </p>
                <div className="mt-4">
                  <LineChart
                    data={dataBulananIndex.data}
                    categories={dataBulananIndex.categories}
                    colors={["#1DB5DB"]}
                    gridColor={false}
                    minLineChartValue={0}
                    maxLineChartValue={1}
                    // floating={item.hour.length > 15 ? true : false}
                    height={"285"}
                  />
                </div>
              </div>
            </div>
          )} */}

          {/* Table Prakiraan */}
          {tableData.length === 0 ? (
            <div className="w-full flex col-span-3 my-4 flex-col">
              <Skeleton className="py-2" />
              <Skeleton className="py-10 mt-1" />
              <Skeleton className="py-16 mt-0.5" />
              <Skeleton className="py-20 mt-0.5" />
            </div>
          ) : (
            <div className="w-full flex col-span-3 my-4 flex-col bg-[#EBFFE4] rounded box-shadow overflow-hidden">
              {isTahunan === "default"
                ? tableData.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between pb-2 relative ${
                        item.border ? "border-b-2 border-[#D9D9D9]" : ""
                      }
            ${
              item.id === 4 || item.id === 5 || item.id === 6
                ? "h-[150px] flex items-center"
                : ""
            }
            `}
                    >
                      {/* carousel */}
                      {index === 0 && (
                        <div className="absolute w-[87.3%] top-3 right-0 flex justify-between items-center">
                          <button
                            className="disabled:opacity-50  duration-150 hover:scale-110"
                            disabled={sliceIndex.start === 0}
                            onClick={() => {
                              setSliceIndex({
                                ...sliceIndex,
                                start: sliceIndex.start - sliceIndex.for,
                                end: sliceIndex.end - sliceIndex.for,
                              });
                            }}
                          >
                            <IoIosArrowBack />
                          </button>
                          <button
                            className="disabled:opacity-50  duration-150 hover:scale-110"
                            disabled={item.data.length <= sliceIndex.end}
                            onClick={() => {
                              setSliceIndex({
                                ...sliceIndex,
                                start: sliceIndex.start + sliceIndex.for,
                                end: sliceIndex.end + sliceIndex.for,
                              });
                            }}
                          >
                            <IoIosArrowForward />
                          </button>
                        </div>
                      )}

                      {/* Chart */}
                      {item.id === 4 || item.id === 5 || item.id === 6 ? (
                        <div
                          className="absolute w-[79.5%]  top-0 right-[3%]"
                          style={{
                            padding: `0 ${
                              sliceIndex.end - sliceIndex.start === 3 &&
                              sliceIndex.for === 3
                                ? 50
                                : sliceIndex.end - sliceIndex.start === 6 &&
                                  sliceIndex.for === 6
                                ? 20
                                : item.data.length <= sliceIndex.end
                                ? (sliceIndex.end - item.data.length) * 10
                                : 0
                            }px`,
                          }}
                        >
                          <LineChartCustome
                            height={100}
                            data={
                              item?.data?.length > sliceIndex.for
                                ? item.data.slice(
                                    sliceIndex.start,
                                    sliceIndex.end
                                  )
                                : item.data
                            }
                            colors={item.id === 4 ? "#DD2000" : "#1DB5DB"}
                          />
                        </div>
                      ) : null}
                      <div
                        className={`w-[15%] text-xs font-bold flex items-center pl-4 ${
                          index === 0 ? "bg-[#00AF50] py-2" : ""
                        }  ${
                          item.id === 5 || item.id === 6 || item.id === 2
                            ? "cursor-pointer hover:opacity-70 duration-150"
                            : ""
                        }}`}
                      >
                        {item.name}
                      </div>
                      {(item?.data?.length > sliceIndex.for
                        ? item.data.slice(sliceIndex.start, sliceIndex.end)
                        : item.data
                      )?.map((item2, index2) => (
                        <div
                          key={index2}
                          className={`flex-grow flex items-center flex-col justify-center ${
                            index === 0 ? `bg-[#00AF50] py-2 font-semibold` : ``
                          }`}
                        >
                          {item.id === 2 ? (
                            <div className="flex flex-col w-full gap-1 pt-4 items-center font-bold text-base">
                              <div
                                style={{
                                  rotate: `${
                                    !item.dataDir.slice(
                                      sliceIndex.start,
                                      sliceIndex.end
                                    )[index2]
                                      ? `0deg`
                                      : `-${parseFloat(
                                          item.dataDir.slice(
                                            sliceIndex.start,
                                            sliceIndex.end
                                          )[index2]
                                        )}deg`
                                  }`,
                                }}
                              >
                                <FaLocationArrow className="-rotate-45" />
                              </div>
                              <p className="">
                                {item2 ? parseFloat(item2)?.toFixed(1) : 0}
                              </p>
                            </div>
                          ) : item.id === 3 ? (
                            <div className="flex flex-col w-[40px] gap-1 justify-center py-2 items-center text-sm font-medium">
                              {item2 ? parseFloat(item2)?.toFixed(1) : 0}
                            </div>
                          ) : item.id === 4 ||
                            item.id === 5 ? null : item.id ===
                            6 ? null : item.id === 7 ||
                            item.id === 8 ||
                            item.id === 9 ? (
                            <div className="text-center w-[30px] text-sm font-bold">
                              {/* {item2 ? parseFloat(item2)?.toFixed(1) : 0} */}
                              {item2 ? item2 : 0}
                            </div>
                          ) : item.id === 10 ? (
                            <div className="flex flex-col w-[20px] h-full justify-center items-center text-sm font-bold">
                              <CustomBarChart
                                width="100%"
                                data={item2}
                                height={"130"}
                                maxCount={5}
                              />
                              <p className="text-xs text-black/60">{item2}</p>
                            </div>
                          ) : (
                            item2
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                : tableDataBulanan.map((item, index) => (
                    <div
                      key={index}
                      className={`flex justify-between pb-2 relative ${
                        item.border ? "border-b-2 border-[#D9D9D9]" : ""
                      }
                  ${
                    item.id === 2 || item.id === 3 || item.id === 4
                      ? "h-[150px] flex items-center"
                      : ""
                  }
                  `}
                    >
                      {index === 0 && (
                        <div className="absolute w-[87.3%] top-3 right-0 flex justify-between items-center">
                          <button
                            className="disabled:opacity-50  duration-150 hover:scale-110"
                            disabled={sliceIndex.start === 0}
                            onClick={() => {
                              setSliceIndex({
                                ...sliceIndex,
                                start: sliceIndex.start - sliceIndex.for,
                                end: sliceIndex.end - sliceIndex.for,
                              });
                            }}
                          >
                            <IoIosArrowBack />
                          </button>
                          <button
                            className="disabled:opacity-50  duration-150 hover:scale-110"
                            disabled={item.data.length <= sliceIndex.end}
                            onClick={() => {
                              setSliceIndex({
                                ...sliceIndex,
                                start: sliceIndex.start + sliceIndex.for,
                                end: sliceIndex.end + sliceIndex.for,
                              });
                            }}
                          >
                            <IoIosArrowForward />
                          </button>
                        </div>
                      )}

                      {/* Chart */}
                      {item.id === 2 || item.id === 3 || item.id === 4 ? (
                        <div
                          className="absolute w-[79.5%]  top-0 right-[3%]"
                          style={{
                            padding: `0 30px`,
                          }}
                        >
                          <LineChartCustome
                            height={100}
                            data={
                              item.data.length > sliceIndex.for
                                ? item.data.slice(
                                    sliceIndex.start,
                                    sliceIndex.end
                                  )
                                : item.data
                            }
                            colors={
                              item.id === 2
                                ? "#DD2000"
                                : item.id === 3
                                ? "rgb(250, 204, 21)"
                                : "#1DB5DB"
                            }
                          />
                        </div>
                      ) : null}
                      <div
                        className={`w-[15%] text-xs font-bold flex items-center pl-4 ${
                          index === 0 ? "bg-[#00AF50] py-2" : ""
                        }  cursor-pointer hover:opacity-70 duration-150`}
                      >
                        {item.name}
                      </div>
                      {(item.data.length > sliceIndex.for
                        ? item.data.slice(sliceIndex.start, sliceIndex.end)
                        : item.data
                      ).map((item2, index2) => (
                        <div
                          key={index2}
                          className={`flex-grow flex items-center flex-col justify-center ${
                            index === 0 ? `bg-[#00AF50] py-2 font-semibold` : ``
                          }`}
                        >
                          <div className="flex flex-col gap-1 justify-center items-center text-sm font-bold">
                            {item.id === 1 && item2}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
            </div>
          )}

          {/* index kebeningan */}
          {isTahunan === "default" && dataIndeksKebeningan.length ? (
            <div className="bg-[#EBFFE4] box-shadow rounded p-2 mt-2">
              <p className="text-center text-xl ">PV Output</p>
              <div className="flex mt-4 relative">
                {/* Chart */}
                <div
                  className={`absolute -bottom-4 z-[5] w-full ${
                    isSameLenghtPv ? "" : "hidden"
                  }`}
                >
                  <LineChart
                    data={[
                      {
                        name: "Pv Output",
                        data: dataChartPv
                          .map((item) => item.data[0].data)
                          .reduce((acc, cur) => acc.concat(cur), []),
                      },
                    ]}
                    categories={newHour.map((f, i) => {
                      const indexOf = newHour.findIndex(
                        (elemen) =>
                          elemen ===
                          `${curentPv?.curentTime}||${curentPv?.name}`
                      );
                      return `${curentPv?.curentTime}||${curentPv?.name}` === f
                        ? `${f.split("||")[0]}.`
                        : i % 3 === 0 && i !== indexOf - 1 && i !== indexOf + 1
                        ? f.split("||")[0]
                        : "";
                    })}
                    colors={["#1DB5DB"]}
                    gridColor={false}
                    // floating={item.hour.length > 15 ? true : false}
                    floating={false}
                    height={200}
                    xasis={{
                      axisBorder: {
                        show: false,
                      },
                      axisTicks: {
                        show: false,
                      },
                    }}
                    yasis={{
                      max: getMaxValue(dataIndeksKebeningan),
                      tickAmount: 4,
                      labels: {
                        formatter: function (value) {
                          return Math.ceil(value);
                        },
                      },
                    }}
                    tooltip={{
                      x: {
                        formatter: (
                          seriesName,
                          { series, seriesIndex, dataPointIndex, w }
                        ) => {
                          return `Pukul ${
                            newHour[dataPointIndex].split("||")[0]
                          }.00`;
                        },
                      },
                    }}
                    annotations={{
                      xaxis: [
                        {
                          x: `${
                            curentPv?.isCustomeColor
                              ? `${curentPv.curentTime}.`
                              : "50"
                          }`,
                          strokeDashArray: 0,
                          borderColor: "rgb(239, 68, 68)",
                          borderWidth: 2,
                          label: {
                            style: {
                              color: "#fff",
                              background: "rgb(239, 68, 68)",
                            },
                            text: "Saat ini",
                          },
                        },
                      ],
                    }}
                  />
                  <div className="absolute bottom-[25px] left-0.5 text-[8px] font-bold">
                    Jam (
                    {lonLat.utc === 7
                      ? "WIB"
                      : lonLat.utc === 8
                      ? "WITA"
                      : lonLat.utc === 9
                      ? "WIT"
                      : "Jam"}
                    )
                  </div>
                </div>

                {dataChartPv.map((item, index) => (
                  <div
                    key={index}
                    className={`text-center relative ${
                      index === 0 ? "w-[112%]" : "w-[100%]"
                    }`}
                  >
                    {/* Carousel */}
                    <div className="bg-[#00AF50] flex justify-between items-center">
                      {index === 0 ? (
                        <button
                          className="disabled:opacity-30 hover:opacity-30"
                          disabled={
                            item.name === dataIndeksKebeningan[0].name
                              ? true
                              : false
                          }
                          onClick={() => {
                            setSliceIndeksKebeningan({
                              ...sliceIndeksKebeningan,
                              start: sliceIndeksKebeningan.start - 1,
                              finish: sliceIndeksKebeningan.finish - 1,
                            });
                          }}
                        >
                          <IoIosArrowBack className="" />
                        </button>
                      ) : (
                        <div />
                      )}
                      <p className="">{item.name}</p>
                      {index === sliceIndeksKebeningan.for - 1 ? (
                        <button
                          className="disabled:opacity-30 hover:opacity-30"
                          disabled={
                            item.name ===
                            dataIndeksKebeningan[
                              dataIndeksKebeningan.length - 1
                            ].name
                              ? true
                              : false
                          }
                          onClick={() => {
                            setSliceIndeksKebeningan({
                              ...sliceIndeksKebeningan,
                              start: sliceIndeksKebeningan.start + 1,
                              finish: sliceIndeksKebeningan.finish + 1,
                            });
                          }}
                        >
                          <IoIosArrowForward className="" />
                        </button>
                      ) : (
                        <div />
                      )}
                    </div>
                    <div className="border rounded-br rounded-bl h-[200px]">
                      <div
                        className={`relative ${
                          isSameLenghtPv ? "hidden" : ""
                        } ${item.hour.length > 15 ? "" : ""}`}
                      >
                        <LineChart
                          data={item.data}
                          categories={
                            item.hour.length > 15
                              ? item.hour.map((f, i) =>
                                  (i % 3 === 0 &&
                                    item.curentTime - 1 !== parseInt(f) &&
                                    item.curentTime + 1 !== parseInt(f) &&
                                    item.isCustomeColor) ||
                                  (i % 3 === 0 && !item.isCustomeColor) ||
                                  (item.curentTime === parseInt(f) &&
                                    item.isCustomeColor)
                                    ? f
                                    : ""
                                )
                              : item.hour
                          }
                          title={"W/m²"}
                          styleTitle={{
                            fontSize: "10px",
                            color: "#1DB5DB",
                          }}
                          colors={["#1DB5DB"]}
                          gridColor={false}
                          showYAxis={index === 0 ? true : false}
                          // floating={item.hour.length > 15 ? true : false}
                          floating={false}
                          height={200}
                          xasis={{
                            axisBorder: {
                              show: false,
                            },
                            axisTicks: {
                              show: false,
                            },
                          }}
                          yasis={{
                            max: 200,
                            tickAmount: 4,
                          }}
                          tooltip={{
                            x: {
                              formatter: (
                                seriesName,
                                { series, seriesIndex, dataPointIndex, w }
                              ) => `Pukul ${item.hour[dataPointIndex]}.00`,
                            },
                          }}
                          annotations={{
                            xaxis: [
                              {
                                x: `${
                                  item.isCustomeColor ? item.curentTime : 50
                                }`,
                                strokeDashArray: 0,
                                borderColor: "rgb(239, 68, 68)",
                                borderWidth: 2,
                                label: {
                                  style: {
                                    color: "#fff",
                                    background: "rgb(239, 68, 68)",
                                  },
                                  text: "Saat ini",
                                },
                              },
                            ],
                          }}
                        />
                        {index === 0 && (
                          <div className="absolute bottom-6 left-0.5 text-[8px] font-bold">
                            Jam (
                            {lonLat.utc === 7
                              ? "WIB"
                              : lonLat.utc === 8
                              ? "WITA"
                              : lonLat.utc === 9
                              ? "WIT"
                              : "Jam"}
                            )
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DataPrakiraan;

const getDailyPrakiraan = async (
  nameIndex,
  lon,
  lat,
  curentTime,
  title,
  utc = 7,
  datePayment = "03-01-2023"
) => {
  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_URL_API}/search/new_prakiraan`,
      {
        distance: "10km",
        lat: lat,
        lon: lon,
        nameindex: nameIndex,
        time: "harian",
        datetime: datePayment,
      }
    );

    const separatedData = {};

    data.forEach((item) => {
      const { date, jam, value } = item;
      const dateKey = date.split("/").join(" - "); // Convert date format to use dashes instead of slashes

      if (!separatedData[dateKey]) {
        separatedData[dateKey] = {
          curentTime: curentTime,
          data: [
            {
              name: title,
              data: [],
            },
          ],
          hour: [],
          isCustomeColor: getDate() === dateKey ? true : false,
          name: dateKey,
        };
      }

      separatedData[dateKey].data[0].data.push(
        parseFloat(parseFloat(value).toFixed(1))
      );
      separatedData[dateKey].hour.push(jam);
    });

    const formattedData = Object.values(separatedData);

    return formattedData;
  } catch (error) {
    console.log(error);
    return [
      {
        curentTime: curentTime,
        data: [
          {
            name: title,
            data: [],
          },
        ],
        hour: [],
        isCustomeColor: false,
        name: "-",
      },
    ];
  }
};

const getDailyPrakiraanData = async (type, lon, lat, title, periode = 7) => {
  const now = new Date(); // Tanggal sekarang
  now.setHours(0, 0, 0, 0); // Set jam ke 00:00:00

  const totalDays = periode; // Total hari yang akan diambil

  // Tambahkan ?? hari ke startDate
  const endDateObj = new Date(now);
  endDateObj.setDate(endDateObj.getDate() + totalDays);

  const startDate = now.toISOString(); // Konversi ke format ISO untuk startDate
  const endDate = endDateObj.toISOString(); // Konversi ke format ISO untuk endDate

  try {
    const { data } = await axios.post(
      `${process.env.REACT_APP_URL_API_3}/query`,
      {
        type: type,
        latitude: lat,
        longitude: lon,
        starttime: startDate,
        endtime: endDate,
      }
    );

    const newData = data.data.map((item) => ({
      ...item,
      datetime: new Date(`${item.datetime}.000Z`),
    }));

    const transformedData = newData
      .reduce((result, item) => {
        const hour = getHour24(item.datetime);
        const date = fDate(item.datetime);

        let group = result.find((group) => group.date === date);

        if (!group) {
          group = { date, data: [], hour: [] };
          result.push(group);
        }

        group.data.push(Number(item.value.toFixed(1)));
        group.hour.push(hour);

        return result;
      }, [])
      .map((group) => ({
        name: group.date,
        data: [
          {
            name: title,
            data: group.data,
          },
        ],
        hour: group.hour,
        isCustomeColor: true,
      }));

    const separatedData = transformedData.slice(0, periode);

    return separatedData;
  } catch (error) {
    console.log(error);
    return [
      {
        data: [
          {
            name: title,
            data: [],
          },
        ],
        hour: [],
        isCustomeColor: false,
        name: "-",
      },
    ];
  }
};

function getMaxValue(dataArray) {
  let maxValue = -Infinity;

  dataArray.forEach((day) => {
    day.data.forEach((item) => {
      const currentMax = Math.max(...item.data);
      if (currentMax > maxValue) {
        maxValue = currentMax;
      }
    });
  });

  return Number(Math.ceil(maxValue));
}

function getHour24(dateString) {
  const date = new Date(dateString);
  const hours = date.getHours(); // Mengambil jam dalam format 24 jam
  return hours <= 10 ? String(hours) : String(hours).padStart(2, "0");
}

const getDate = () => {
  const date = new Date(); // Replace this with your Date object
  date.setDate(date.getDate());

  // Function to pad single digits with leading zeros
  function padWithZero(number) {
    return number.toString().padStart(2, "0");
  }

  // Get day, month, and year from the Date object
  const day = padWithZero(date.getDate());
  const month = padWithZero(date.getMonth() + 1); // Months are zero-based, so add 1
  const year = date.getFullYear();

  // Create the formatted date string
  return `${day} - ${month} - ${year}`;
};
