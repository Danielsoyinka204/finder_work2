import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const isValidUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(url);
};

const InputField = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
}) => (
  <div className="space-y-2">
    <label className="block text-gray-700 font-medium capitalize">
      {label}
      {!required && <span className="text-sm text-gray-500"> (Optional)</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      required={required}
    />
  </div>
);

const removeStarsAndHashtags = (text) => {
  if (!text) return "";
  return text.replace(/Credibility Score/, "Scam Analysis").replace(/[*#]/g, "");// Remove all '*' and '#' characters
};

const Modal = ({ response, onClose }) => {
  const { score, analysis, legitimacy } = response || {};

  const chartData = {
    labels: ["Score", "Remaining"],
    datasets: [
      {
        label: "Credibility Score",
        data: [score, 100 - score],
        backgroundColor: ["#4CAF50", "#FF5252"], // Green and Red
        borderColor: ["#388E3C", "#D32F2F"], // Slightly darker shades for borders
        borderWidth: 1,
      },
    ],
  };

  return (
    <div
      className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6 overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold text-gray-800">
          Scam Analysis
        </h3>
        <p className="mt-4 text-lg text-gray-700">
          {score ? `Score: ${score}` : "No score available"}
        </p>
        <div className="mt-4 flex justify-center">
          <div className="w-60 h-60">
            <Pie data={chartData} />
          </div>
        </div>
        <div className="mt-4 text-gray-600 whitespace-pre-wrap">
          {removeStarsAndHashtags(analysis) || "No analysis found"}
        </div>
        <p
          className={`mt-2 text-xl font-bold ${
            legitimacy === "scam" ||
            legitimacy === "Be cautious, potential Scam"
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {legitimacy}
        </p>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const Form = () => {
  const [formData, setFormData] = useState({
    businessName: "",
    domain: "",
    facebookUrl: "",
    email: "",
    phone: "",
    address: "",
    instagramUrl: "",
    hashtags: "",
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDomainChange = (e) => {
    const value = e.target.value
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    setFormData({ ...formData, domain: value });
  };

  const validateInputs = () => {
    if (
      !formData.businessName ||
      !formData.domain ||
      !isValidUrl(formData.facebookUrl)
    ) {
      setError(
        "Please provide a valid business name, domain, and Facebook URL."
      );
      return false;
    }
    if (
      formData.email &&
      !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)
    ) {
      setError("Please provide a valid email address.");
      return false;
    }
    if (formData.phone && formData.phone.length < 10) {
      setError("Please provide a valid phone number.");
      return false;
    }
    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      setError("Please provide a valid Instagram URL.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateInputs()) return;

    const { domain } = formData;
    const currentTime = Date.now(); // Current time in milliseconds
    const maxStorageTime = 10 * 60 * 1000; // 10 minutes in milliseconds

    // Retrieve existing stored data
    let storedData = JSON.parse(localStorage.getItem("storedRequests")) || [];

    // Check if the domain exists and if the data is still valid
    const existingData = storedData.find(
      (item) =>
        item.domain === domain && currentTime - item.timestamp < maxStorageTime
    );

    if (existingData) {
      setResponse(existingData.response);
      setFormData({
        businessName: "",
        domain: "",
        facebookUrl: "",
        email: "",
        phone: "",
        address: "",
        instagramUrl: "",
        hashtags: "",
      });
      return;
    }

    setLoading(true);

    try {
      // Send request to backend
      const res = await axios.post("/analyze", formData);

      // Prepare the new data to store
      const newEntry = {
        domain,
        response: res.data,
        timestamp: currentTime,
      };

      // Add the new data to the storage, maintaining a maximum of 10 entries
      storedData.push(newEntry);
      if (storedData.length > 10) {
        storedData.shift(); // Remove the oldest entry
      }

      // Save updated storage
      localStorage.setItem("storedRequests", JSON.stringify(storedData));
      setResponse(res.data);
      setFormData({
        businessName: "",
        domain: "",
        facebookUrl: "",
        email: "",
        phone: "",
        address: "",
        instagramUrl: "",
        hashtags: "",
      });
    } catch (err) {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Utility to clean up expired entries
  useEffect(() => {
    // Function to clean up expired entries
    const cleanupStorage = () => {
      const storedData =
        JSON.parse(localStorage.getItem("storedRequests")) || [];
      const currentTime = Date.now();
      const maxStorageTime = 10 * 60 * 1000; // 10 minutes in milliseconds

      // Remove entries older than maxStorageTime
      const validData = storedData.filter(
        (item) => currentTime - item.timestamp < maxStorageTime
      );

      // Update the localStorage with only valid entries
      localStorage.setItem("storedRequests", JSON.stringify(validData));
    };

    // Initial cleanup on component mount
    cleanupStorage();

    // Set interval to clean up storage every minute
    const intervalId = setInterval(() => {
      cleanupStorage();
    }, 60000); // Runs every 1 minute

    // Cleanup the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleCloseModal = () => setResponse(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">
         Scam Analysis
        </h2>
        <InputField
          label="Business Name"
          type="text"
          name="businessName"
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Enter business name"
          required
        />
        <InputField
          label="Domain (e.g., domainname.com)"
          type="text"
          name="domain"
          value={formData.domain}
          onChange={handleDomainChange}
          placeholder="Enter your domain (e.g., domainname.com)"
          required
        />
        <InputField
          label="Facebook URL"
          type="text"
          name="facebookUrl"
          value={formData.facebookUrl}
          onChange={handleChange}
          placeholder="Enter Facebook page URL"
          required
        />
        {["email", "phone", "address", "instagramUrl", "hashtags"].map(
          (field) => (
            <InputField
              key={field}
              label={field.replace(/([A-Z])/g, " $1")}
              type={
                field === "email" ? "email" : field === "phone" ? "tel" : "text"
              }
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
              required={false}
            />
          )
        )}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>
        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
      </form>
      {response && <Modal response={response} onClose={handleCloseModal} />}
    </div>
  );
};

export default Form;
