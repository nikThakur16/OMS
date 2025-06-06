

const DepartmentCard = () => {
  return (
    <div className="bg-white rounded-lg shadow text-[#034F75] py-8 w-[15vw]">
    <div className="my-4 flex flex-col -lg px-4 gap-10">
      <img width={50} height={50} src="/images/EngIcon.png" alt="" />
      <p className="font-bold text-[16px] tracking-wide ">Engineering and Development
      </p>
    </div>
    <hr className="text-gray-300"/>

    <div className="px-4 flex flex-col gap-2 pt-2">
      <p className="text-[#4CAF50]  text-[14px] font-bold ">Total Employee: 245</p>
      <div className="flex items-center gap-1">
      <img width={10} height={10} src="https://img.icons8.com/ios/50/737373/clock--v1.png" alt="clock--v1"/>
      <p className="text-[13px] text-gray-400">Updated 2 days ago </p>
      </div>
 
    </div>
    </div>
  )
}

export default DepartmentCard