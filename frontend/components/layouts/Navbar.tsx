"use client";
import { useEffect, useState } from "react";
import { setSearchQuery } from "@/reducers/search/SearchSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials, logout, setUserData } from "@/reducers/auth/LoginSlice"; // Adjust the import path as necessary

import _ from "lodash";
import { useRouter } from "next/navigation"; // Adjust the import path as necessary
import { useLogoutMutation } from "@/store/api";

const Navbar = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  let loggedUser =useAppSelector((state)=>state?.login?.user);
  const router = useRouter();
  const [triggerLogout, { isLoading, error}] = useLogoutMutation();

  console.log("Logged User:", loggedUser);

  const handleLogout= async ()=>{
    try {
      await triggerLogout().unwrap();
      dispatch(logout());
      router.push('/'); // Redirect to login page after logout 
    } catch (err) {
      console.error("Failed to logout:", err);
      // Handle logout error (e.g., show a toast message)
    }
  }

  useEffect(() => {
  
    const debouncedSearch = _.debounce((term) => {
      dispatch(setSearchQuery(term));
    }, 300); // Adjust the debounce delay as needed
    // Dispatch the search term whenever it changes
    debouncedSearch(searchTerm);
  }, [searchTerm, dispatch]);
  useEffect(() => {
    if (!loggedUser && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Dispatch to Redux to populate the store, so subsequent renders use Redux state
          dispatch(setUserData(parsedUser));
          // Update local loggedUser variable for immediate render if needed
          loggedUser = parsedUser; 
        } catch (e) {
          console.error("Failed to parse user from localStorage", e);
          // Optionally clear invalid localStorage item
          localStorage.removeItem('user');
        }
      }
    }
  }, [loggedUser, dispatch]); // Depend on loggedUser and dispatch
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
