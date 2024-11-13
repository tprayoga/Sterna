import { useState, useEffect, Fragment } from "react";
import { TablePagination } from "@components/organism/Table";
import { formatFullDate } from "node-format-date";
import axios from "axios";
import ToastHook from "@hooks/Toast";
import { useSelector } from "react-redux";
import { Dialog, Transition } from "@headlessui/react";

export default function Package() {
  const [users, setUsers] = useState([]);
  const [data, setData] = useState({
    id: "",
    name: "",
  });
  const [isEditMode, setIsEditMode] = useState(false);

  const [catData, setCatData] = useState([]);
  const [delData, setDelData] = useState();
  const [id, setID] = useState();
  const [plans, setPlans] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const { successToast, failedToast } = ToastHook();
  const { token } = useSelector((state) => state.auth);
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  };
  // const getPlanDataID = async (id) => {
  //   try {
  //     const response = await axios.get(`${process.env.REACT_APP_URL_API_2}/api/plans/${id}`);
  //     setPlans(response.data); // Memperbarui state dengan data dari API
  //   } catch (error) {
  //     console.error("Error fetching plan data:", error);
  //   }
  // };

  const column = [
    {
      name: <p className="2xl:text-lg xl:text-sm font-medium text-black">Category</p>,
      selector: (row) => <div className="2xl:text-lg xl:text-xs font-normal text-black">{row.category.name}</div>,
    },
    {
      name: <p className="2xl:text-lg xl:text-sm font-medium text-black">Type</p>,
      selector: (row) => <div className="2xl:text-lg xl:text-xs font-normal text-black">{row.name}</div>,
    },
    {
      name: <p className="2xl:text-lg xl:text-sm font-medium text-black">Price</p>,
      selector: (row) => (
        <div className="2xl:text-lg xl:text-xs font-normal text-black">
          {/* Check for price_monthly */}
          {row.price_monthly !== "0.00" && (
            <div>
              {parseFloat(row.price_monthly).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </div>
          )}

          {/* Check for price_weekly */}
          {row.price_weekly !== "0.00" && (
            <div>
              {parseFloat(row.price_weekly).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </div>
          )}

          {/* Check for price_monthly */}

          {/* Check for price_annual */}
          {row.price_annual !== "0.00" && (
            <div>
              {parseFloat(row.price_annual).toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </div>
          )}
        </div>
      ),
    },

    {
      name: <p className="2xl:text-lg xl:text-sm font-medium text-black">Aksi</p>,
      selector: (row) => (
        <div className="2xl:text-lg xl:text-xs font-normal text-white flex space-x-2">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-1 rounded-md transition duration-200 ease-in-out"
            onClick={() => {
              setDelData(row.id);
              setIsOpen(true);
            }}
          >
            Hapus
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-1 rounded-md transition duration-200 ease-in-out"
            onClick={() => {
              try {
                // Set ID paket yang akan diedit
                setID(row);
                setFormData(row);

                // Buka modal
                setIsOpenModal(true);

                // Aktifkan mode edit
                setIsEditMode(true);

                // Panggil fungsi untuk mendapatkan data paket berdasarkan ID
              } catch (error) {
                console.error("Error fetching plan data:", error);
              }
            }}
          >
            Edit
          </button>
        </div>
      ),
    },
  ];
  const initialData = {
    category: "6",
    type: "Forecast",
    periode: "Monthly",
    forecastPeriode: "Quarterly",
    price_monthly: "500",
    features: ["Feature 1", "Feature 2", "Feature 3"],
  };
  const [formData, setFormData] = useState({
    category: 0,
    name: "",
    periode: "",
    description: "",
    price_monthly: 0,
    price_annual: 0,
    price_weekly: 0,
    plan_id: 0,
    features: ["", "", ""],
    qty: 1,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  const handlePeriodeChange = (e) => {
    const selectedPeriode = e.target.value;
    setFormData({
      ...formData,
      periode: selectedPeriode,
      price_weekly: selectedPeriode === "Weekly" ? formData.price : 0,
      price_monthly: selectedPeriode === "Monthly" ? formData.price : 0,
      price_annual: selectedPeriode === "Annually" ? formData.price : 0,
    });
  };
  const handlePriceChange = (e) => {
    const { value } = e.target;
    const selectedPeriode = formData.periode;

    setFormData({
      ...formData,
      price: value,
      price_weekly: selectedPeriode === "Weekly" ? value : 0,
      price_monthly: selectedPeriode === "Monthly" ? value : 0,
      price_annual: selectedPeriode === "Annually" ? value : 0,
    });
  };

  // Handler untuk fitur input
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({ ...formData, features: updatedFeatures });
  };

  const getUsersData = async () => {
    try {
      axios.get(process.env.REACT_APP_URL_API + "/users", config).then(({ data }) => {
        setUsers(
          data.map((user) => ({
            ...user,
            name: user.name.includes("(?)") ? user.name.replace("(?)", " ") : user.name,
          }))
        );
      });
    } catch (error) {
      console.log(error);
    }
  };
  const getPlanData = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_URL_API_2 + "/api/plans");
      setPlans(response.data); // Assuming response.data contains the plans data
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  const getCategory = async () => {
    try {
      const response = await axios.get(process.env.REACT_APP_URL_API_2 + "/api/categories");
      setCatData(response.data); // Assuming response.data contains the plans data
    } catch (error) {
      console.error("Error fetching plan data:", error);
    }
  };

  // console.log("paln", plans);

  const delUser = async () => {
    try {
      axios
        .delete(process.env.REACT_APP_URL_API + "/delete/users/" + data.id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          setData({
            id: "",
            name: "",
          });
          getUsersData();
          setIsOpen(false);
          successToast("Berhasil menghapus data pengguna");
        });
    } catch (error) {
      console.log(error);
      setData({
        id: "",
        name: "",
      });
      failedToast("Gagal menghapus data pengguna");
    }
  };
  const delPackage = async () => {
    try {
      axios.delete(process.env.REACT_APP_URL_API + "/plans/" + delData).then(() => {
        setDelData();
        getPlanData();
        setIsOpen(false);
        successToast("Berhasil menghapus data pengguna");
      });
    } catch (error) {
      console.log(error);
      setDelData();
      failedToast("Gagal menghapus data pengguna");
    }
  };
  const [selectedCategory, setSelectedCategory] = useState("");
  const [typeOptions, setTypeOptions] = useState(["Forecast", "Monitoring", "Forecast & Monitoring"]);
  const [typePeriode] = useState(["Weekly", "Monthly", "Annually"]);
  const [forecastTypePeriode] = useState(["7 Days", "14 Days"]);

  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    setFormData({ ...formData, category: selectedCatId });

    if (selectedCatId === "6") {
      setTypeOptions(["Forecast & Monitoring"]);
    } else {
      setTypeOptions(["Forecast", "Monitoring"]);
    }
  };
  const submitData = {
    category_id: formData.category,
    name: formData.name,
    price_weekly: formData.periode === "Weekly" ? formData.price_weekly : 0,
    price_monthly: formData.periode === "Monthly" ? formData.price_monthly : 0,
    price_annual: formData.periode === "Annually" ? formData.price_annual : 0,
    description: formData.description,
    qty: 1,
  };
  // Submit Handler
  const handleSubmit = async () => {
    if (isEditMode) {
    } else {
      try {
        // Step 1: Create the main plan
        const response = await axios.post(`${process.env.REACT_APP_URL_API}/plans`, submitData);

        // Step 2: Extract the plan_id from the response
        const planId = response.data.id;

        if (!planId) {
          throw new Error("Plan ID not returned from server");
        }
        // Step 3: Map the features and include the correct plan_id
        const featuresData = formData.features.map((feat) => ({
          plan_id: planId,
          feature: feat,
        }));

        // Step 4: Send all feature objects concurrently
        await Promise.all(featuresData.map((feature) => axios.post(`${process.env.REACT_APP_URL_API}/plan-features`, feature)));

        // Display success message
        successToast("New data added successfully!");

        // Step 5: Reset form data
        setFormData({
          category: 0,
          name: "",
          periode: "",
          description: "",
          price_monthly: 0,
          price_annual: 0,
          price_weekly: 0,
          plan_id: 0,
          features: ["", "", ""],
          qty: 1,
        });

        // Step 6: Refresh the plan data list
        await getPlanData();
      } catch (error) {
        console.error("Error adding new data:", error.response ? error.response.data : error.message);
        failedToast("Error adding new data");
      }
    }

    // Close the modal after submitting
    setIsOpenModal(false);
  };

  useEffect(() => {
    getUsersData();
    getPlanData();
    getCategory();
  }, []);
  const [isFormValid, setIsFormValid] = useState(false);
  useEffect(() => {
    // Cek apakah semua field sudah terisi
    const isValid = formData.category && formData.name && formData.periode && formData.description && formData.price && formData.features.every((feature) => feature.trim() !== "");

    setIsFormValid(isValid);
  }, [formData]);

  return (
    <div className="2xl:mt-8">
      <div className="flex justify-between">
        <h1 className="font-semibold text-4xl pb-6">Package List</h1>
        <div>
          <button className="rounded-lg px-8 py-2 text-white bg-[#00672E] hover:opacity-60" onClick={() => setIsOpenModal(true)}>
            Tambah Package
          </button>
        </div>
      </div>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Peringatan
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Apa Anda yakin akan menghapus pengguna <b>{data.name}</b>?
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end gap-4">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={() => setIsOpen(false)}
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-green-100 px-4 py-2 text-sm font-medium text-green-900 hover:bg-green-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                      onClick={delPackage}
                    >
                      Hapus
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <Transition appear show={isOpenModal} as={Fragment}>
        <Dialog as="div" className="relative z-10 " onClose={() => setIsOpen(false)}>
          <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
            <div className="fixed inset-0 bg-black bg-opacity-25 " />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full  items-center justify-center p-4 text-center">
              <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {isEditMode ? "Edit Package" : "Add Package"}
                  </Dialog.Title>

                  {/* Category Dropdown */}
                  <div className="mt-2">
                    <label htmlFor="category" className="block text-sm/6 font-medium text-gray-900">
                      Category
                    </label>
                    <div className="mt-2">
                      <select id="category" name="category" className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500" value={formData.category_id} onChange={handleCategoryChange}>
                        <option value="">Select Category</option>
                        {catData.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Type Dropdown */}
                  <div className="mt-2">
                    <label htmlFor="type" className="block text-sm/6 font-medium text-gray-900">
                      Type
                    </label>
                    <div className="mt-2">
                      <select id="type" name="name" className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500" value={formData.name} onChange={handleChange}>
                        <option value="">Select Type</option>
                        {typeOptions.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label htmlFor="periode" className="block text-sm/6 font-medium text-gray-900">
                      Periode
                    </label>
                    <div className="mt-2">
                      <select id="periode" name="periode" className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500" value={formData.periode} onChange={handlePeriodeChange}>
                        <option value="">Select Periode</option>
                        {typePeriode.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-2">
                    <label htmlFor="forecast-periode" className="block text-sm/6 font-medium text-gray-900">
                      Forecast Periode
                    </label>
                    <div className="mt-2">
                      <select
                        id="forecast-periode"
                        name="description"
                        autoComplete="forecast-periode-name"
                        className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500"
                        value={formData.description}
                        onChange={handleChange}
                      >
                        <option value="">Select Forecast Periode</option>
                        {forecastTypePeriode.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Price Input */}
                  <div className="mt-2">
                    <label htmlFor="price" className="block text-sm/6 font-medium text-gray-900">
                      Price
                    </label>
                    <input type="number" name="price" className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500" placeholder="Price" value={formData.price} onChange={handlePriceChange} />
                  </div>

                  {/* Features Input */}
                  <div className="mt-2">
                    <label htmlFor="feature" className="block text-sm/6 font-medium text-gray-900">
                      Feature
                    </label>
                  </div>
                  {formData.features.map((feature, index) => (
                    <div className="mt-2" key={index}>
                      <input
                        type="text"
                        className="bg-[#F4F4F4] rounded-[10px] w-full py-2 px-4 border focus:outline-main-500"
                        placeholder={`Feature ${index + 1}`}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                      />
                    </div>
                  ))}

                  {/* Submit and Cancel Buttons */}
                  <div className="mt-4 flex justify-end gap-4">
                    <button type="button" className="bg-red-100 text-red-900 hover:bg-red-200 px-4 py-2 rounded-md" onClick={() => setIsOpenModal(false)}>
                      Cancel
                    </button>
                    <button type="button" className={`${isFormValid ? "bg-green-100 text-green-900 hover:bg-green-200" : "bg-gray-200 text-gray-500 cursor-not-allowed"} px-4 py-2 rounded-md`} onClick={handleSubmit} disabled={!isFormValid}>
                      {isEditMode ? "Update" : "Submit"}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <TablePagination items={plans} column={column} ItemsPerPage={10} />
    </div>
  );
}
