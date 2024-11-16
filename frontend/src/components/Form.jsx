import React, { useState } from 'react';
import axios from 'axios';

const isValidUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(url);
};

const InputField = ({ label, type, name, value, onChange, placeholder, required }) => (
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
  if (!text) return '';
  return text.replace(/[*#]/g, ''); // Remove all '*' and '#' characters
};

const Modal = ({ response, onClose }) => (
  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg space-y-6 overflow-y-auto max-h-[90vh]">
      <h3 className="text-2xl font-semibold text-gray-800">Credibility Score</h3>
      <p className="mt-4 text-lg text-gray-700">
        {response?.score ? `Score: ${response.score}` : 'No score available'}
      </p>
      <div className="mt-4 text-gray-600 whitespace-pre-wrap">
        {removeStarsAndHashtags(response?.analysis) || 'No analysis found'}
      </div>
      <p
        className={`mt-2 text-xl font-bold ${
          response?.legitimacy === 'scam' || response?.legitimacy === 'Be cautious, potential red flags exist' ? 'text-red-600' : 'text-green-600'
        }`}
      >
        {response?.legitimacy}
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

const Form = () => {
  const [formData, setFormData] = useState({
    businessName: '',
    domain: '',
    email: '',
    phone: '',
    address: '',
    facebookUrl: '',
    instagramUrl: '',
    hashtags: '',
  });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDomainChange = (e) => {
    const value = e.target.value.replace(/^https?:\/\//, '').replace(/^www\./, '');
    setFormData({ ...formData, domain: value });
  };

  const validateInputs = () => {
    if (!formData.businessName || !formData.domain || !isValidUrl(formData.domain)) {
      setError('Please provide a valid business name and domain.');
      return false;
    }
    if (formData.email && !/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email)) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (formData.phone && formData.phone.length < 10) {
      setError('Please provide a valid phone number.');
      return false;
    }
    if (formData.facebookUrl && !isValidUrl(formData.facebookUrl)) {
      setError('Please provide a valid Facebook URL.');
      return false;
    }
    if (formData.instagramUrl && !isValidUrl(formData.instagramUrl)) {
      setError('Please provide a valid Instagram URL.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await axios.post('/analyze', formData);
      setResponse(res.data);
    } catch (err) {
      setError('Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setResponse(null);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">
          Business Credibility Check
        </h2>
        {['businessName', 'email', 'phone', 'address', 'facebookUrl', 'instagramUrl', 'hashtags'].map(
          (field) => (
            <InputField
              key={field}
              label={field.replace(/([A-Z])/g, ' $1')}
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
              required={field !== 'email'}
            />
          )
        )}
        <InputField
          label="Domain (e.g., domainname.com)"
          type="text"
          name="domain"
          value={formData.domain}
          onChange={handleDomainChange}
          placeholder="Enter your domain (e.g., domainname.com)"
          required
        />
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Check Credibility'}
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
