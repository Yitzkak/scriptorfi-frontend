import React from 'react';

const Services = () => {
    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="bg-gray-50 py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto text-center">
                    <p className="text-sm font-semibold tracking-widest text-teal-600 uppercase">Services</p>
                    <h1 className="mt-3 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                        Transcription services built for speed and accuracy
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                        From interviews and podcasts to meetings and lectures, Scriptorfi delivers clear, human‑verified transcripts with flexible options and transparent pricing.
                    </p>
                </div>
            </section>

            {/* Service Grid */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                title: "General Transcription",
                                desc: "High‑accuracy transcripts for interviews, podcasts, lectures, and webinars.",
                            },
                            {
                                title: "Business Meetings",
                                desc: "Capture action items, speakers, and summaries for internal and client meetings.",
                            },
                            {
                                title: "Academic & Research",
                                desc: "Reliable transcripts for qualitative research, focus groups, and lectures.",
                            },
                            {
                                title: "Media & Content",
                                desc: "Turn audio/video into publish‑ready text for blogs, captions, and content repurposing.",
                            },
                            {
                                title: "Legal‑Ready Drafts",
                                desc: "Structured transcripts suitable for legal review and record‑keeping.",
                            },
                            {
                                title: "Customer Support",
                                desc: "Document support calls for QA, training, and compliance needs.",
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-gray-50 border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition">
                                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                                <p className="mt-2 text-gray-600">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Options */}
            <section className="bg-gray-50 py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Flexible options for every workflow</h2>
                            <p className="mt-4 text-gray-600">
                                Customize your transcript with add‑ons designed for professional use cases. Choose the output format and options that fit your project.
                            </p>
                        </div>
                        <ul className="space-y-4">
                            {[
                                "Verbatim transcription (fillers, pauses, false starts)",
                                "Timestamps and speaker IDs",
                                "Rush delivery options",
                                "Accent selection and formatting preferences",
                                "Additional instructions for custom formatting",
                            ].map((text, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <span className="mt-1 w-2 h-2 rounded-full bg-teal-500"></span>
                                    <p className="text-gray-700">{text}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-6 md:px-12">
                <div className="max-w-6xl mx-auto bg-gradient-to-r from-teal-500 to-mint-green rounded-2xl p-8 md:p-12 text-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold">Ready to get started?</h2>
                            <p className="mt-3 text-white/90">
                                Upload your files and get a clean transcript quickly with full visibility into pricing.
                            </p>
                        </div>
                        <div className="flex md:justify-end">
                            <a
                                href="/upload"
                                className="inline-flex items-center justify-center bg-white text-teal-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
                            >
                                Upload a file
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Services;