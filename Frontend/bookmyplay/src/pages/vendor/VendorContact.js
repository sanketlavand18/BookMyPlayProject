import { useState } from "react";
import VendorSidebar from "../../components/VendorSidebar";
import VendorNavbar from "../../components/VendorNavbar";
import Contact from "../Contact";

function VendorContact() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-2 p-0">
          <VendorSidebar mobileOpen={sidebarOpen} onCloseSidebar={() => setSidebarOpen(false)} />
        </div>

        {/* Content */}
        <div className="col-md-10 p-0 bg-light" style={{ minHeight: "100vh" }}>
          <VendorNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <div className="px-4 pb-4">
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
}

export default VendorContact;
