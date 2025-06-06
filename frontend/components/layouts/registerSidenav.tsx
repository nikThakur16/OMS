'use client'
import { registerSidebnavConfig , type RegisterSidenavItem } from '@/config/register/RegisterSidenavConfig'
import Link from 'next/link'
import { usePathname ,useSearchParams } from 'next/navigation'

const registerSidenav = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentType = searchParams ? searchParams.get('type') : null;

  return (
    <div className='bg-white w-[25%] min-h-[80vh] max-h-[80vh]  rounded-lg '>
        <div className='flex flex-col gap-6 px-5 py-10'>
            {registerSidebnavConfig.map((item:RegisterSidenavItem, index) => {
                 const isSelected = currentType === item.id;

                 const baseClasses = 'flex items-center gap-4 py-3 pl-10 cursor-pointer p-2 rounded-md font-semibold tracking-wider';
                 const defaultClasses = 'bg-[#D3E7F0] text-[#175075] hover:bg-[#4678B1] hover:text-[#ffffff]';
                 const selectedClasses = 'bg-[#175075] text-[#ffffff]';

                 const itemClasses = `${baseClasses} ${isSelected ? selectedClasses : defaultClasses}`;

                return (
                    <Link href={`${pathname}?type=${encodeURIComponent(item.id)}`} key={index} className={itemClasses}>
                        <span className='text-2xl'>{item.icon}</span>
                        <span className='text-[14px] font-semibold tracking-wider'>{item.title}</span>
                    </Link>
                );
            })}
        </div>
    </div>
  )
}

export default registerSidenav