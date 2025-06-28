import { NavLink } from "react-router-dom";
import { FaHouse, FaGear } from "react-icons/fa6";

const SidebarNavigation = () => {
  return (
    <nav className="bg-light-primary dark:bg-dark-primary text-dark-primary dark:text-light-primary p-4 flex flex-col h-full">
      <div className="flex flex-row items-center mb-6">
        <img src="/logos/yoursounds.png" alt="" className="w-4 h-4" />
        <h1 className="ml-2">YourSounds</h1>
      </div>
      <div className="flex flex-col justify-between h-full">
        <NavLink to="/" className="navlink">
          <FaHouse size={20} className="navlink-icon" />
          <span>Home</span>
        </NavLink>
        <div>
          <NavLink to="/settings" className="navlink">
            <FaGear size={20} className="navlink-icon" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default SidebarNavigation;
