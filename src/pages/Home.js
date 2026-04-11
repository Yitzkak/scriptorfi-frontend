import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUsSection';
import OurProcess from '../components/OurProcess';
import Pricing from '../components/Pricing';
import CallToActionBanner from '../components/CallToActionBanner';
import EditorHighlight from '../components/EditorHighlight';
import AutoTranscriptionSection from '../components/AutoTranscriptionSection';
import LaunchOfferBanner from '../components/LaunchOfferBanner';

const Home = () => {
    return (
        <div>
            <div className="mx-auto max-w-6xl px-4 pt-28 md:px-8">
                <LaunchOfferBanner />
            </div>
            <Hero />
            <OurProcess />
            <AutoTranscriptionSection />
            <WhyChooseUs />
            <Pricing />
            <EditorHighlight />
            <CallToActionBanner />
        </div>
    );
};

export default Home;