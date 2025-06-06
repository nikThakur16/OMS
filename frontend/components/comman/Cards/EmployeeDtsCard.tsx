

const EmployeeDtsCard = () => {
  return (
    <div className="w-[20vw] bg-white rounded-lg shadow-lg text-[#034F75] py-3">
    <div className=" relative  px-6 ">
   <div  className=" absolute top-[-77%] flex items-center justify-center py-1  bg-gradient-to-b from-[#042349] w-[60px] h-[60px] to-[#04567B] rounded-[41px]">

   <img width="35" height="35" src="https://img.icons8.com/ios/50/FFFFFF/user--v1.png" alt="user--v1"/>
   </div>
        <div className="flex flex-col text-right">
            <p className="font-light text-[14px] tracking-wide">Active Employee</p>
            <p className="text-2xl font-bold">1081</p>
            </div>
          
    </div>
    <hr className="text-gray-300 my-2 " />
 <div className="px-6">
 <p className=" text-sm font-light"><span className="text-[#4CAF50]  text-[16px] font-bold font-roboto">+55%            </span> than Last week</p>
 </div>
   
</div>
  )
}

export default EmployeeDtsCard