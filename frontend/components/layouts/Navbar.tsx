"use client";
import { useEffect, useState } from "react";
import { setSearchQuery } from "@/reducers/search/SearchSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import _ from "lodash";
import { logout } from "@/reducers/auth/LoginSlice"; // Adjust the import path as necessary
import { useRouter } from "next/navigation"; // Adjust the import path as necessary

const Navbar = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const loggedUser =useAppSelector((state)=>state?.login?.user);
  const router = useRouter();

  console.log("Logged User:", loggedUser);

  const handleLogout=()=>{
    dispatch(logout());
    router.push('/'); // Redirect to login page after logout 
  }

  useEffect(() => {
    const debouncedSearch = _.debounce((term) => {
      dispatch(setSearchQuery(term));
    }, 300); // Adjust the debounce delay as needed
    // Dispatch the search term whenever it changes
    debouncedSearch(searchTerm);
  }, [searchTerm, dispatch]);
  return (
    <div className="bg-white  h-[65px] flex justify-end items-center rounded-lg gap-[15vw] px-4">
      <div className="flex relative items-center justify-between">
        <input
          type="search"
          placeholder="Search Here"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-[35px] h-[39px] w-[240px] text-xs  text-[#034F75] border border-none bg-[#C7DFEA] px-4"
        />
        <span className="ri-search-line absolute flex items-center text-[#034F75] right-4 "></span>
      </div>
      <div className="flex gap-4 items-center ">
        <h4 className="text-[#034F75]">{loggedUser?.firstName }  {loggedUser?.lastName}</h4>
        <button className="bg-white px-6 py-2 rounded-lg cursor-pointer " onClick={()=>handleLogout()}>logout</button>
      </div>
    </div>
  );
};

export default Navbar;
