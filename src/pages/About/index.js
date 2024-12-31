import React, { Fragment, useState } from "react";
import batter from "@assets/batter2.png";
import dataPrakiraan from "@assets/dataPrakiraan.png";
import dataHistoris from "@assets/dataHistoris.png";
import userGuide from "@assets/userguide.png";
import { IoIosArrowForward, IoIosClose } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setLoginPopup } from "@redux/features/login/loginSlice";
import Footer from "@components/organism/Footer";
import AOS from "aos";
import "aos/dist/aos.css"; // You can also use <link> for styles
import { BiSolidSun } from "react-icons/bi";
import {
  BsCloudFog,
  BsCloudHaze,
  BsCloudHaze2Fill,
  BsCloudsFill,
  BsFillCloudRainFill,
  BsFillSunriseFill,
  BsSunFill,
  BsCloudFill,
} from "react-icons/bs";
import { FaTemperatureHalf } from "react-icons/fa6";
import { FiWind } from "react-icons/fi";
import Modal from "@components/molecule/Modal";
import { Dialog, Transition } from "@headlessui/react";

const dataGuide = [
  "Memilih Lokasi",
  "Akses Data Historis",
  "Akses Data Premium",
  "Menyimpan Lokasi",
];

const parameters = [
  {
    Icon: (props) => <BsSunFill {...props} />,
    label: "GHI",
    descriptions: [
      "Akumulasi radiasi global yang diterima pada permukaan horizontal bumi (global horizontal irradiance) selama satu hari.",
    ],
  },
  {
    Icon: (props) => <BsCloudsFill {...props} />,
    label: "Tutupan Awan",
    descriptions: [
      "Tutupan awan Total \n Parameter yang menggambarkan persentase tutupan awan yang menutupi langit. Diasumsikan awan pada masing-masing ketinggian tumpang tindih (overlap) satu sama lain, sehingga penentuan didasarkan pada total awan yang dapat diamati dari permukaan bumi tanpa memperhatikan jenis ketinggian awan tersebut.",
      "Tutupan Awan Rendah \n Parameter yang menggambarkan persentase tutupan awan rendah yang menutupi langit. Awan rendah merupakan awan dengan ketinggian antara 0 - 2000 m.",
      "Tutupan Awan Menengah \n Parameter yang menggambarkan persentase tutupan awan menengah yang menutupi langit. Awan menengah merupakan awan dengan ketinggian antara 2000 - 6000 m.",
      "Tutupan Awan Tinggi \n Parameter yang menggambarkan persentase tutupan awan tinggi yang menutupi langit. Awan tinggi merupakan awan dengan ketinggian antara 6000 - 18000 m.",
    ],
  },
  {
    Icon: (props) => <BsCloudFog {...props} />,
    label: "Indeks Kebeningan",
    descriptions: [
      "Indeks untuk menggambarkan kondisi kebersihan/kebeningan atmosfer yang digunakan untuk menggambarkan kondisi perawanan dalam satu hari. Indeks kebeningan memiliki rentang nilai 0 – 1, dimana 0 menandakan kondisi atmosfer yang sepenuhnya tertutup (overcast) dalam satu hari penuh, sementara 1 menandakan kondisi atmosfer yang sepenuhnya bersih tanpa tutupan awan (clear sky) atau partikel yang dapat menghalangi sinar matahari.",
    ],
  },
  {
    Icon: (props) => <BsFillSunriseFill {...props} />,
    label: "Pergerakan Matahari",
    descriptions: [
      "Jumlah radiasi gelombang pendek yang mencapai permukaan horizontal bumi baik secara langsung (direct) maupun tidak langsung (diffuse). Tidak seluruh radiasi matahari masuk dan mencapai permukaan bumi. Sebagian ada yang diserap dan dipantulkan kembali ke angkasa oleh awan maupun partikel di atmosfer (aerosol). Radiasi yang tidak dipantulkan dan tidak diserap itulah yang terukur sebagai radiasi matahari",
    ],
  },
  {
    Icon: (props) => <BsFillCloudRainFill {...props} />,
    label: "Curah Hujan",
    descriptions: [
      "Parameter yang menggambarkan ketinggian air hujan yang terkumpul pada sebuah luasan datar 1 m2, dengan asumsi tidak ada air yang terserap maupun mengalir. Dalam kegiatan operasional energi surya, air hujan membantu membersihkan debu-debu yang ada pada permukaan panel surya.",
    ],
  },
  {
    Icon: (props) => <FaTemperatureHalf {...props} />,
    label: "Suhu",
    descriptions: [
      "Tinggi rendahnya suhu udara lingkungan dapat berdampak pada efisiensi produksi listrik dari panel surya. Pada beberapa kondisi, bahkan diperlukan usaha untuk mendinginkan sistem panel surya agar efisiensi produksi listrik dapat tercapai.",
    ],
  },
  {
    Icon: (props) => <BsCloudHaze2Fill {...props} />,
    label: "Distribusi Arah Angin",
    descriptions: [
      "Parameter arah angin menggambarkan dari arah mana sumber angin berasal. Arah angin dinyatakan dalam derajat (°), dengan arah utara digunakan sebagai acuan (0°). Arah angin juga dapat dinyatakan dalam bentuk mata angin (Utara-U, Timur-T), dsb.). Informasi arah angin digunakan sebagai petunjuk pergerakan awan, awan sendiri dapat menyebabkan terjadinya intermitensi pada proses produksi energi.",
    ],
  },
  {
    Icon: (props) => <FiWind {...props} />,
    label: "Kecepatan Angin",
    descriptions: [
      "Menggambarkan kecepatan aliran udara dari tekanan tinggi ke tekanan rendah. Angin permukaan memiliki peran dalam menurunkan suhu dan kelembaban di suatu wilayah, sehingga profil kecepatan angin juga menentukan potensi energi matahari yang dapat diproduksi panel surya.",
    ],
  },
];

const About = () => {
  const { user, token } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  AOS.init();

  // state
  const [openModalParameter, setOpenModalParameter] = useState(false);
  const [selectedParameter, setSelectedParameter] = useState({
    title: "",
    descriptions: [],
  });

  return (
    <>
      <div className="bg-[#F7FFF4]">
        {/* Overview */}
        <div className="xs:px-7 xl:flex w-full h-auto bg-white pb-[50px] xl:pt-[10px] xl:px-[50px]">
          <div className="xs:w-full md:pt-[100px] xl:w-[30%] xs:flex xs:justify-center xs:pt-[50px] xl:pt-10 xl:order-last">
            <img
              src={batter}
              alt={batter}
              className="xs:w-[70%] md:w-[60%] lg:w-[40%] xl:w-full xl:h-[330px] xl:pt-[50px] transition-fadeinout"
            />
          </div>
          <div className="xs:w-full xl:w-[65%] flex flex-col xl:justify-start xs:text-center xl:text-left">
            <p className="xl:text-4xl xs:text-xl xs:pt-14 md:pt-24 xl:pt-10 xs:pb-3">
              SILENTERA
            </p>
            <p className="xl:pt-[24px] xl:text-[58px] font-bold xs:text-xl xl:pb-8">
              GREEN ENERGY
            </p>
            <p className="xl:text-[58px] font-bold xs:text-xl xs:pb-3">
              SOLUTION FOR EVERYONE
            </p>
            <p className="xl:pt-[30px] xl:pb-6 font-medium xl:w-[90%]">
              SILENTERA merupakan sebuah inovasi layanan data informasi potensi
              energi baru terbarukan (EBT) di Indonesia, berbasis{" "}
              <i>platform </i>
              interaktif yang dikembangkan oleh Pusat Layanan Informasi Iklim
              Terapan BMKG. Informasi dalam <i>platform</i> SILENTERA dapat
              digunakan bagi pemangku kebijakan, industri penyedia EBT, analis
              energi, dan masyarakat umum. SILENTERA menyediakan informasi
              ringkasan iklim dan prakiraan yang merupakan informasi penting
              dalam pengembangan energi terbarukan di Indonesia.
            </p>
            <div className="flex xs:w-full xs:justify-center xl:justify-start xl:w-full py-7">
              <button
                className="xl:px-16 xs:px-12 md:px-16 py-3 bg-green-600 text-white font-medium hover:opacity-75"
                onClick={() => {
                  if (user) {
                    navigate("/");
                  } else {
                    navigate("/");
                    setTimeout(() => {
                      dispatch(setLoginPopup(true));
                    }, 500);
                  }
                }}
              >
                <p>Mulai</p>
              </button>
              <button
                className="py-3 font-medium flex items-center xs:ml-7 xl:ml-10 z-[5px]"
                onClick={() => {
                  navigate("/about/silentera");
                  window.scrollTo(0, 0);
                }}
              >
                Selengkapnya
                <div className="w-full pl-3 mt-1 scale-125">
                  <IoIosArrowForward />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Produk Tersedia */}
        <div className="w-full xs:pt-10 xl:pt-24 pb-20 bg-[#F7FFF4]">
          <p className="text-center xs:text-3xl xl:text-5xl font-medium">
            Produk Tersedia
          </p>
          <div className="w-full xl:flex py-10">
            <div className="flex flex-col xl:w-[50%] justify-start">
              <center>
                <img
                  src={dataHistoris}
                  alt={dataHistoris}
                  className="xs:w-[60%] lg:w-[40%]"
                  data-aos="zoom-out-right"
                />
                <p
                  className="xl:text-4xl xs:text-2xl font-medium xl:py-8 xs:py-3"
                  data-aos="flip-left"
                >
                  Data Historis
                </p>
                <p className="w-[70%] font-medium" data-aos="flip-left">
                  Data historis adalah ringkasan iklim selama 30 tahun terakhir
                  (1991-2020) yang merupakan informasi penting dalam perencanaan
                  pembangunan pembangkit listrik. Informasi ini digunakan
                  sebagai referensi dasar dalam menentukan lokasi potensial
                  pengembangan energi terbarukan di Indonesia.
                </p>
              </center>
            </div>
            <div className="flex flex-col xl:w-[50%]">
              <center>
                <img
                  src={dataPrakiraan}
                  alt={dataPrakiraan}
                  className="xs:mt-14 lg:mt-0 xs:w-[60%] lg:w-[40%]"
                  data-aos="zoom-out-left"
                />
                <p
                  className="xl:text-4xl xs:text-2xl font-medium xl:py-8 xs:py-3"
                  data-aos="flip-right"
                >
                  Data Prakiraan
                </p>
                <p className="w-[70%] font-medium" data-aos="flip-right">
                  Informasi prakiraan energi surya ditampilkan dengan resolusi
                  tinggi dalam dua skala waktu berbeda, yaitu harian dan
                  bulanan. Prakiraan harian mencakup prakiraan tiap jam hingga
                  14 hari kedepan, sedangkan prakiraan bulanan berisi prakiraan
                  kondisi umum tiap bulan untuk 7 bulan ke depan.
                </p>
              </center>
            </div>
          </div>
          <center>
            <button
              className="px-16 py-3 bg-green-600 text-white font-medium hover:opacity-75"
              onClick={() => {
                navigate("/about/data-provided");
                window.scrollTo(0, 0);
              }}
            >
              Selengkapnya
            </button>
          </center>
        </div>

        {/* Petunjuk Pengguna */}
        <center>
          <div
            className="w-[90%] xs:h-[450px] xl:h-[700px] xl:py-12 bg-[#7FD9CA]"
            data-aos="fade-up"
          >
            <div className="w-full flex xl:py-5 h-full">
              <div className="flex flex-col xs:w-full md:w-[50%] xl:w-[50%] xl:pl-24 text-start">
                <p className="xs:text-2xl xs:text-center xl:text-[2.75rem] xl:text-start font-medium py-8">
                  PETUNJUK PENGGUNA
                </p>
                {dataGuide.map((item) => (
                  <div
                    className="flex items-center xs:pl-10 xl:pl-5 text-white"
                    data-aos="fade-right"
                    key={item}
                  >
                    <div className="bg-[#D9D9D9] rounded-full xs:w-4 xs:h-4 xl:w-7 xl:h-7"></div>
                    <p className="xs:text-2xl xl:text-4xl font-medium xs:py-3 xs:pl-3 xl:py-5 xl:pl-5">
                      {item}
                    </p>
                  </div>
                ))}
                <center className="xs:w-full xl:w-[70%] py-10">
                  <button
                    className="px-16 py-3 bg-green-600 text-white font-medium hover:opacity-75"
                    onClick={() => {
                      navigate("/about/user-guide");
                      window.scrollTo(0, 0);
                    }}
                  >
                    Selengkapnya
                  </button>
                </center>
              </div>
              <div className="flex flex-col xl:w-[50%] xs:w-[0%] md:w-[50%] items-center h-full">
                <center className="flex items-center h-full pr-5">
                  <img
                    src={userGuide}
                    alt={userGuide}
                    className="xl:scale-110"
                  />
                </center>
              </div>
            </div>
          </div>
        </center>

        {/* Divider */}
        <center>
          <div className="bg-[#9F9494] w-[90%] h-1 my-10 opacity-50"></div>
        </center>

        {/* Dokumentasi Parameter */}
        <div
          className="w-full xl:pt-8 pb-20 flex flex-col"
          data-aos="zoom-in-up"
        >
          <p className="text-center xs:text-2xl md:text-3xl xl:text-[2.5rem] font-semibold text-[#1F8A70] pb-5">
            PARAMETER
          </p>
          <div className="flex flex-col w-full mb-12 gap-3">
            <div
              className="flex gap-3 justify-center xs:text-sm md:text-lg xl:text-2xl font-semibold xs:flex-wrap"
              data-aos="fade-up"
            >
              {parameters.slice(0, 4).map(({ Icon, label, descriptions }) => (
                <center
                  key={label}
                  className="group pt-12 pb-5 border-green-200 border-2 rounded-lg xs:w-[40%] lg:w-[20%] hover:scale-105 duration-500 hover:shadow-xl hover:border-none hover:bg-[#f6fbf4] cursor-pointer"
                  onClick={() => {
                    setSelectedParameter({
                      title: label,
                      descriptions,
                    });
                    setOpenModalParameter(true);
                  }}
                >
                  <Icon className="text-[140px] text-green-500 duration-300 bg-white p-7 shadow-xl rounded-xl" />
                  <p className="pt-5">{label}</p>
                </center>
              ))}
            </div>
            <div
              className="flex justify-center gap-3 xs:text-sm md:text-lg xl:text-2xl font-semibold xs:flex-wrap"
              data-aos="fade-up"
            >
              {parameters.slice(4).map(({ Icon, label, descriptions }) => (
                <center
                  key={label}
                  className="group pt-12 pb-5 border-green-200 border-2 rounded-lg xs:w-[40%] lg:w-[20%] hover:scale-105 duration-500 hover:shadow-xl hover:border-none hover:bg-[#f6fbf4] cursor-pointer"
                  onClick={() => {
                    setSelectedParameter({
                      title: label,
                      descriptions: descriptions,
                    });
                    setOpenModalParameter(true);
                  }}
                >
                  <Icon className="text-[140px] text-green-500 duration-300 bg-white p-7 shadow-xl rounded-xl" />
                  <p className="pt-5">{label}</p>
                </center>
              ))}
            </div>
          </div>
          <center>
            <button
              className="px-16 py-3 bg-green-600 text-white font-medium hover:opacity-75"
              onClick={() => {
                navigate("/about/parameter");
                window.scrollTo(0, 0);
              }}
            >
              Selengkapnya
            </button>
          </center>
        </div>

        <Footer />
      </div>

      <DialogParameter
        open={openModalParameter}
        onClose={setOpenModalParameter}
        title={selectedParameter?.title}
        descriptions={selectedParameter?.descriptions}
      />
    </>
  );
};

export default About;

const DialogParameter = ({ open, onClose, title, descriptions = [] }) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => onClose(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between gap-4">
                  <Dialog.Title
                    as="h3"
                    className="text-md font-medium leading-6 text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={() => onClose(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <IoIosClose className="w-6 h-6" />
                  </button>
                </div>
                <div className="mt-4">
                  <ul className="list-disc pl-5 text-sm text-gray-500 text-justify">
                    {descriptions.map((desc, idx) => (
                      <li key={idx}>{desc}</li>
                    ))}
                  </ul>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
