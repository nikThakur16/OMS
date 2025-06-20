'use client'

import React, { useEffect, useState } from 'react'
import { Admin ,Employee, Hr } from '@/config/sidenav/page'

import {  useRouter } from 'next/navigation'
import { set } from 'lodash'





const Sidebar = () => {
  const [role,setRole]=useState<string>('');
  
  useEffect(()=>{
    const storeRole = localStorage.getItem('role');
    setRole(storeRole || 'Employee'); // Default to 'Employee' if not set 
  },[]) 
  const router = useRouter();
  
   const data:{[key: string ]: typeof Admin} = {
    Admin : Admin,
    Employee: Employee,
    Hr: Hr,
  };
   

  
  

  return (
    <div className=' flex flex-col bg-[#034F75] w-[17%] max-h-[100vh] rounded-[22px] pl-[35px] px-2 py-6'>
      <img className='h-14 w-[70%] ' src="https://softradix.com/wp-content/uploads/2022/07/main-logo.png" alt="" />
      <div className='flex flex-col  gap-8 pt-10 pl-2 text-white'>
        {data[role]?.map((item, index) => (
          
         <div
            key={index}
            className='flex gap-6 items-center cursor-pointer'
            onClick={() => {
              if (item.path) {
                router.push(item.path);
              }
            }}
         >
          {item.icon}
           <h4 className='font-semibold'>{item.title}</h4>
          
          
         </div>
        ))}
      
      </div>
    </div>
  )
}

export default Sidebar