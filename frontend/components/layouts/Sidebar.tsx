'use client'

import React from 'react'
import { Admin } from '@/config/sidenav/Admin'
import { useRouter } from 'next/navigation'

const Sidebar = () => {
  const router = useRouter();

  return (
    <div className=' flex flex-col bg-[#034F75] w-[17%] max-h-[90vh] rounded-[22px] items-center px-2 py-6'>
      <img className='h-14 w-[70%] ' src="https://softradix.com/wp-content/uploads/2022/07/main-logo.png" alt="" />
      <div className='flex flex-col  gap-8 pt-10 pl-2 text-white'>
        {Admin.map((item, index) => (
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