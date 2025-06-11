import EmployeeDtsCard from "@/components/comman/Cards/EmployeeDtsCard"
import DepartmentCard from "@/components/comman/Cards/DepartmentCard"
import Attendance from "@/pages/attendance/page"

const page = () => {
  return (
    <div className="mt-10 max-w-[76vw] flex flex-col gap-4  ">
      <div className="flex gap-8">
        <EmployeeDtsCard />
        <EmployeeDtsCard />
        
        <EmployeeDtsCard />
        
        <EmployeeDtsCard />
        
        
      </div>
      <div className="flex gap-3">
        <DepartmentCard/>
        <DepartmentCard/>
        <DepartmentCard/>
        <DepartmentCard/>
        <DepartmentCard/>
     

      </div>

      <Attendance height="max-h-[37vh]"  />
      {/* You can add more components here as needed */}

    </div>
  )
}

export default page