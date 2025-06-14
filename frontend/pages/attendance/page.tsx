

interface PageProps {
    height?: string; // Define the height prop as an optional string
}

const page = ({height}: PageProps) => {
    const attendanceData = [
        {
          name: "Syed Mahamudul Hasan",
          role: "Flutter Developer",
          checkIn: "09:36",
          checkOut: "18:55",
          workingHours: "09hr 02min",
          breakTime: "45min",
          extraHours: "(+30min)",
          status: "Late"
        },
        {
          name: "Kamrul Hasan",
          role: "Back-End Developer",
          checkIn: "09:00",
          checkOut: "18:30",
          workingHours: "09hr 30min",
          breakTime: "1hr 05min",
          extraHours: "--:--",
          status: "In time"
        },
        {
          name: "Arfan-Roky",
          role: "Front-End Developer",
          checkIn: "09:36",
          checkOut: "18:55",
          workingHours: "09hr 02min",
          breakTime: "30min",
          extraHours: "--:--",
          status: "In time"
        },
        {
          name: "Afsan-Rahmatullah",
          role: "Full-Stack Developer",
          checkIn: "09:10",
          checkOut: "16:55",
          workingHours: "07hr 02min",
          breakTime: "45min",
          extraHours: "--:--",
          status: "In time"
        },
        {
          name: "Wasif-Zaman-Omee",
          role: "Full-Stack Developer",
          checkIn: "09:36",
          checkOut: "18:55",
          workingHours: "09hr 02min",
          breakTime: "45min",
          extraHours: "(+45min)",
          status: "In time"
        }
      ];
      
  return (
    <div className='bg-white   text-[#034F75] max-h-[50vh] rounded-md shadow-md p-6'>
       <div className='flex items-center justify-between'>
       <h1 className='font-bold text-[16px]' >Attendance</h1>
       <p className='font-bold text-[12px] '> <span className='font-bold text-[16px] '>Date:</span> 10-06-2025</p>
       </div>
       <div className={`relative overflow-y-auto ${height? height:'max-h-[37vh]'} mt-6 scrollbar-hide`}>
            <table className="w-full">
                <thead className="sticky top-0 bg-white border-b border-zinc-100 z-10">
                    <tr className="w-full text-[14px] tracking-wider">
                      <th className="px-4 py-2 font-bold  text-center  tracking-wider">Profile</th>
                      <th className="px-4 py-2  font-bold text-left  tracking-wider ">Name</th>
                      <th className="px-4 py-2 font-bold  text-center  tracking-wider">Check In</th>
                      <th className="px-4 py-2  font-bold text-center  tracking-wider">Check Out</th>
                      <th className="px-4 py-2  font-bold text-center  tracking-wider">Working HR's</th>
                      <th className="px-4 py-2  font-bold text-center  tracking-wider">Break Time</th>
                      <th className="px-4 py-2 font-bold  text-center  tracking-wider">Extra Hr's</th>
                      <th className="px-4 py-2 font-bold  text-center  tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody >
                    {attendanceData.map((user, index) => (
                        <tr key={index} className="border-b border-zinc-100 text-sm font-medium tracking-wider" >
                            <td  className="text-center py-4"><img height={40} width={40} className="rounded-full w-8 h-8 object-cover mx-auto" src="/images/cat.jpg" alt="" /></td>
                            <td className="text-left py-4"> <div className='flex flex-col gap-1'> <h2 className='font-bold text-[14px]'>{user.name } </h2> <p className='text-[12px]'>{user.role}</p></div> </td>
                            <td className="text-center py-4">{user.checkIn}</td>
                            <td className="text-center py-4">{user.checkOut}</td>
                            <td className="text-center py-4">{user.workingHours}</td>
                            <td className="text-center py-4">{user.breakTime}</td>
                            <td className="text-center py-4">{user.extraHours}</td>
                            <td className="text-center py-4">{user.status}</td>
                            
                        </tr>
                        
                        
                    ))}
                       
                   
                </tbody>
            </table>
       </div>
    </div>
  )
}

export default page