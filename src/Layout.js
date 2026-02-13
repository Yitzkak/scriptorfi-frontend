import Navbar from "./components/Navbar";
import {Outlet, useLocation} from 'react-router-dom';
import Footer from "./components/Footer";


const Layout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    
    return(
        <div className="bg-gray-50">
            <Navbar />
            {/* Spacer for fixed navbar - only needed on non-home pages */}
            {!isHomePage && <div className="h-20" />}
           <main className="">
                <Outlet />
           </main>
            <Footer />
        </div>
    )
}

export default Layout;