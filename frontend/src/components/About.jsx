import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
      <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-lg p-6 md:p-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
          Business Credibility Evaluation System
        </h1>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Overview</h2>
          <p className="text-gray-600 leading-relaxed">
            This system assesses the credibility of a business by leveraging API integrations and user-provided data. It operates in three comprehensive stages:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Data Collection</li>
            <li>Analysis and Scoring</li>
            <li>Visualization</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">1. Data Collection</h2>
          <p className="text-gray-600 leading-relaxed">
            This stage gathers relevant data about a business using multiple sources and user inputs to form a holistic dataset:
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-700">API Integrations:</h3>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>
                <strong>Google Places API:</strong> Fetches critical information like reviews, location details, and metadata.
              </li>
              <li>
                <strong>WHOIS API:</strong> Retrieves domain data to evaluate legitimacy, ownership, and red flags.
              </li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-700">User Inputs:</h3>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Business Name</li>
              <li>Domain</li>
              <li>Social Media URLs</li>
              <li>Additional Details (Email, phone, address, etc.)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">2. Analysis and Scoring</h2>
          <p className="text-gray-600 leading-relaxed">
            The backend processes the collected data through OpenAI’s GPT-4o Model to analyze and deliver results:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>
              <strong>Credibility Score (1–100):</strong> Based on factors like review consistency, domain reliability, and social media engagement.
            </li>
            <li>
              <strong>Categories of Scores:</strong> Includes labels like "Likely a Scam," "Suspicious," "Moderately Credible," and "Fully Credible."
            </li>
            <li>
              <strong>Detailed Explanation:</strong> Provides users with specific findings influencing the score.
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">3. Visualization</h2>
          <p className="text-gray-600 leading-relaxed">
            The frontend translates the credibility score into an intuitive graphical representation using:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-4">
            <li>Pie Chart Visualization: Displays the credibility score distribution.</li>
            <li>Score Display: Shows the exact credibility score alongside a detailed analysis.</li>
            <li>User-Friendly Design: Built with React and styled using Tailwind CSS.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Technical Implementation</h2>
          <p className="text-gray-600 leading-relaxed">
            The system is built using modern technologies with optimizations for performance and scalability:
          </p>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-700">Frontend:</h3>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>React-based interface with Tailwind CSS for styling.</li>
              <li>Chart.js for graphical score representation.</li>
              <li>Modal system for displaying results.</li>
            </ul>
          </div>
          <div className="mt-4">
            <h3 className="text-xl font-semibold text-gray-700">Backend:</h3>
            <ul className="list-disc list-inside text-gray-600 mt-2">
              <li>Node.js/Express for API handling.</li>
              <li>OpenAI API for advanced credibility analysis.</li>
              <li>Data caching and rate limiting for performance optimization.</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Improved Features</h2>
          <p className="text-gray-600 leading-relaxed">
            Key enhancements ensure better usability and feedback, including dynamic field validation, error handling, and data storage optimizations.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
