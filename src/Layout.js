import Navbar from "./components/Navbar";
import {Outlet, useLocation} from 'react-router-dom';
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import OurProcess from "./components/OurProcess";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import CallToActionBanner from "./components/CallToActionBanner";
import Pricing from "./components/Pricing";

const Layout = () => {
    const location = useLocation();
    return(
        <div className="bg-gray-50">
            {location.pathname === '/' && <Navbar />}
            {location.pathname === '/' && <Hero />}
            {location.pathname === '/' && <OurProcess />}
            {location.pathname === '/' && <WhyChooseUsSection />}
            {location.pathname === '/' && <Pricing />}
            {location.pathname === '/' && <CallToActionBanner />}
           <main>
                <Outlet />
           </main>
            <Footer />
        </div>
    )
}

export default Layout;