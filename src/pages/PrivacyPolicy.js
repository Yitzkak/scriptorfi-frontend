import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-6 lg:px-24">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl text-center  text-gray-800 border-b pb-4 md:text-4xl ">Privacy Policy</h1>
        
        <p className="mt-4 text-gray-600">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
        </p>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">1. Information We Collect</h2>
          <p className="mt-2 text-gray-600">We collect the following types of information when you use our service:</p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Personal Information: Name, email address, payment details.</li>
            <li>Uploaded Content: Audio files, transcripts.</li>
            <li>Usage Data: Log files, browser type, IP address.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>To provide transcription services.</li>
            <li>To process payments securely.</li>
            <li>To improve our platform and user experience.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">3. How We Protect Your Information</h2>
          <p className="mt-2 text-gray-600">We implement industry-standard security measures including encryption, secure data storage, and access controls to safeguard your information.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">4. Sharing Your Information</h2>
          <p className="mt-2 text-gray-600">We do not sell your information. We may share it with trusted third-party service providers like payment processors or cloud storage providers strictly for business operations.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">5. Your Rights & Control</h2>
          <p className="mt-2 text-gray-600">You have the right to:</p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>Access, update, or delete your personal information.</li>
            <li>Request a copy of the data we hold about you.</li>
            <li>Withdraw consent for data collection.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">6. Changes to This Policy</h2>
          <p className="mt-2 text-gray-600">We may update this policy periodically. We will notify you of significant changes through our website or email.</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-gray-700">7. Contact Us</h2>
          <p className="mt-2 text-gray-600">If you have any questions about this Privacy Policy, please contact us at <span className="font-semibold">support@yourcompany.com</span>.</p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
