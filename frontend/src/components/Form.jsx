import React, { useState } from 'react';
import axios from 'axios';

const isValidUrl = (url) => {
  const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/.*)?$/i;
  return urlPattern.test(url);
};

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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDomainChange = (e) => {
    let value = e.target.value;
    value = value.replace(/^https?:\/\//, '').replace(/^www\./, '');
    setFormData({
      ...formData,
      domain: value,
    });
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
  
    const now = Date.now();
    const lastRequest = localStorage.getItem('lastRequest');
    if (lastRequest && now - parseInt(lastRequest, 10) < 30000) {
      setError('Please wait 30 seconds before submitting again.');
      return;
    }
  
    const storedData = JSON.parse(localStorage.getItem('responses') || '{}');
    const cachedResponse = storedData[formData.domain];
  
    // Check if cached response exists and is within the expiry time
    if (cachedResponse && now - cachedResponse.timestamp < 40000) {
      setResponse(cachedResponse.data);
      return;
    }
  
    // Clean up expired responses
    const cleanedData = Object.entries(storedData).reduce((acc, [key, value]) => {
      if (now - value.timestamp < 40000) {
        acc[key] = value;
      }
      return acc;
    }, {});
    localStorage.setItem('responses', JSON.stringify(cleanedData));
  
    setLoading(true);
  
    try {
      const res = await axios.post('/analyze', formData);
      const newResponse = res.data;
      setResponse(newResponse);
  
      // Save new response with timestamp
      const updatedData = {
        ...cleanedData,
        [formData.domain]: { data: newResponse, timestamp: now },
      };
      localStorage.setItem('responses', JSON.stringify(updatedData));
      localStorage.setItem('lastRequest', now.toString());
  
      setFormData({
        businessName: '',
        domain: '',
        email: '',
        phone: '',
        address: '',
        facebookUrl: '',
        instagramUrl: '',
        hashtags: '',
      });
    } catch (err) {
      setError(err.error || 'Something went wrong, please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  const handleCloseModal = () => {
    setResponse(null);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4" id="form">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-md space-y-6">
        <h2 className="text-4xl font-bold text-gray-800 text-center">See Your Business Credibility</h2>

        {['businessName', 'email', 'phone', 'address', 'facebookUrl', 'instagramUrl', 'hashtags'].map((field) => (
          <div key={field} className="space-y-1">
            <label className="block text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, ' $1')}
              {field === 'email' && <span className="text-sm text-gray-500">(Optional)</span>}
            </label>
            <input
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              name={field}
              value={formData[field]}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter ${field.replace(/([A-Z])/g, ' $1')}`}
              required={field !== 'email'}
            />
          </div>
        ))}

        <div className="space-y-1">
          <label className="block text-gray-700 capitalize">Domain (e.g., domainname.com)</label>
          <div className="flex">
            <input
              type="text"
              value="https://"
              disabled
              className="w-1/6 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-500"
            />
            <input
              type="text"
              name="domain"
              value={formData.domain}
              onChange={handleDomainChange}
              className="w-5/6 px-4 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your domain (e.g., domainname.com)"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Processing...' : 'See Credibility'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-100 text-red-800 rounded-md">
            <p>{error}</p>
          </div>
        )}
      </form>

      {response && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-2xl font-semibold text-gray-800">Credibility Score</h3>
            <p className="mt-4 text-lg text-gray-700">
              {response?.score ? `Score: ${response.score}` : 'No score available'}
            </p>
            <p className="mt-2 text-gray-600">{response?.analysis || 'No analysis found'}</p>
            <p
              className={`mt-2 text-xl font-bold ${
                response?.legitimacy === 'scam' ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {response?.legitimacy === 'scam' ? 'SCAM' : 'LEGITIMATE'}
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-4 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Form;
