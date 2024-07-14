import { NavLink } from "react-router-dom";
import Button from "./ui/Button";

const Navbar = () => {

  return (
    <nav className="max-w-2xl mx-auto mt-7 mb-20 px-3 py-5">
      <ul className="flex items-center justify-between">
        <li className="duration-200 font-semibold text-md text-gray-700">
          <NavLink to="/">Home</NavLink>
        </li>

       
          <div className="flex items-center space-x-6">
           
            <Button className="cursor-pointer" size={"sm"} >
              Logout
            </Button>
          </div>
     
          
      
      </ul>
    </nav>
  );
};

export default Navbar;
