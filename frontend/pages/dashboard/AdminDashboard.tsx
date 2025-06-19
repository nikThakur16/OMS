import EmployeeDtsCard from "@/components/comman/Cards/EmployeeDtsCard"
import DepartmentCard from "@/components/comman/Cards/DepartmentCard"
import Attendance from "@/pages/attendance/page"
import AnnouncementForm from "@/components/annoucements/AnnouncementForm"
import AnnoucementsCard from "@/components/annoucements/AnnoucementsCard"

const page = () => {
  return (
    <div className="mt-10 max-w-[76vw] flex flex-col gap-4  ">
      <div className="flex gap-8">
        <EmployeeDtsCard />
        <EmployeeDtsCard />
        
        <EmployeeDtsCard />
        
  <AnnouncementForm/>
        
        
      </div>
      <div className="grid  gap-3">
        <DepartmentCard/>
        <DepartmentCard/>
        <DepartmentCard/>
   
      <AnnoucementsCard/>
     

      </div>

      <Attendance height="max-h-[37vh]"  />
   

    </div>
  )
}

export default page