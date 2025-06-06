'use client';
import { useGetUsersQuery } from "@/store/api";
import { useAppSelector } from "@/store/hooks";
import {User} from "@/types/users/page";


const page = () => {
  const searchTerm = useAppSelector((state) => state.search.searchQuery.toLowerCase());

  const {data: users, isLoading, isError} = useGetUsersQuery();
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading users</div>;


const filteredUserList = Array.isArray(users)
? users.filter(user => {
    // If search term is empty, show all users
    if (searchTerm === '') {
      return true;
    }
    // Otherwise, check if the search term matches any relevant field (case-insensitive)
    const firstName = user.personalDetails?.firstName?.toLowerCase() || '';
    const lastName = user.personalDetails?.lastName?.toLowerCase() || '';
    const email = user.contactDetails?.email?.toLowerCase() || '';
    const department = user.personalDetails?.department?.toLowerCase() || '';
    const role = user.personalDetails?.role?.toLowerCase() || '';
    // Add other fields as needed

    return (
      firstName.includes(searchTerm) ||
      lastName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      department.includes(searchTerm) ||
      role.includes(searchTerm)
      // Add checks for other fields here
    );
  })
: [];



  return (
    <div className="w-full h-[82vh] overflow-auto bg-white text-[#034F75] rounded-[12px]">
      <div className="px-4 py-6" >
        <div className="flex items-center justify-between p-4 mb-6">
          <h3 className="font-bold tracking-wider text-[24px]">Employee Management</h3>
         
          <span className="ri-filter-fill text-gray-600 text-xl"></span>
        
        </div>
        <table className="w-full">
            <thead className=" border-b border-zinc-100">
                <tr className="w-full text-[16px] tracking-wider">
                  <th className="px-4 py-2 font-bold  text-center  tracking-wider">Profile</th>
                  <th className="px-4 py-2  font-bold text-left  tracking-wider ">Name</th>
                  <th className="px-4 py-2 font-bold  text-center  tracking-wider">Role</th>
                  <th className="px-4 py-2  font-bold text-center  tracking-wider">Department</th>
                  <th className="px-4 py-2  font-bold text-center  tracking-wider">Mail</th>
                  <th className="px-4 py-2  font-bold text-center  tracking-wider">Contact</th>
                  <th className="px-4 py-2 font-bold  text-center  tracking-wider">Join Date</th>
                </tr>
            </thead>
            <tbody className=" " >
                {filteredUserList.map((user, index) => (
                    <tr key={index} className="border-b border-zinc-100 text-sm font-medium tracking-wider" >
                        <td  className="text-center py-4"><img height={40} width={40} className="rounded-full w-8 h-8 object-cover mx-auto" src="/images/cat.jpg" alt="" /></td>
                        <td className="text-left py-4">{user.personalDetails.firstName }  {user.personalDetails.lastName}</td>
                        <td className="text-center py-4">{user.personalDetails.role}</td>
                        <td className="text-center py-4">{user.personalDetails.department}</td>
                        <td className="text-center py-4">{user.contactDetails.email}</td>
                        <td className="text-center py-4">9876543216</td>
                        <td className="text-center py-4">707099696689i</td>
                        
                    </tr>
                    
                    
                ))}
                   {filteredUserList.length === 0 && searchTerm !== '' && (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No users found matching "{searchTerm}"
                    </td>
                  </tr>
                )}
                
               
            </tbody>
        </table>
      </div>
    </div>
  );
};

export default page;
