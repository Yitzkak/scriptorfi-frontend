import React from 'react';
import Hero from '../components/Hero';
import WhyChooseUs from '../components/WhyChooseUsSection';
import OurProcess from '../components/OurProcess';
import Pricing from '../components/Pricing';
import CallToActionBanner from '../components/CallToActionBanner';
import EditorHighlight from '../components/EditorHighlight';
import AutoTranscriptionSection from '../components/AutoTranscriptionSection';

const Home = () => {
    return (
        <div>
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