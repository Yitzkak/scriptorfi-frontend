import Navbar from "./components/Navbar";
import {Outlet, useLocation} from 'react-router-dom';
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import OurProcess from "./components/OurProcess";
import WhyChooseUsSection from "./components/WhyChooseUsSection";
import CallToActionBanner from "./components/CallToActionBanner";

const Layout = () => {
    const location = useLocation();
    return(
        <>
            {location.pathname === '/' && <Navbar />}
            {location.pathname === '/' && <Hero />}
            {location.pathname === '/' && <OurProcess />}
            {location.pathname === '/' && <WhyChooseUsSection />}
            {location.pathname === '/' && <CallToActionBanner />}
           <main>
                <Outlet />
           </main>
            <Footer />
        </>
    )
}

export default Layout;