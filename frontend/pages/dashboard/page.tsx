import EmployeeDtsCard from "@/components/comman/Cards/EmployeeDtsCard"
import DepartmentCard from "@/components/comman/Cards/DepartmentCard"

const page = () => {
  return (
    <div className="mt-10 flex flex-col gap-4">
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
    </div>
  )
}

export default page