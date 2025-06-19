import {useGetAnnouncementsQuery} from "@/store/api"
import Delete from "@/utils/media/svgs/Delete.svg"
import { useEffect, useState } from "react";
import {useDeleteAnnouncementMutation} from "@/store/api"
import { useAppSelector } from "@/store/hooks";


const AnnoucementsCard = () => {
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const user = useAppSelector((state) => state?.login?.user);


    const {
        data: announcementsData,
        isLoading: isFetchingAnnouncements,
        error: fetchAnnouncementsError,
        refetch: refetchAnnouncements,
      } = useGetAnnouncementsQuery(undefined);
    
      const [deleteAnnouncement] = useDeleteAnnouncementMutation();

      // Use the mutation function in your handler
      const handleDelete = async (id: string) => {
        try {
          await deleteAnnouncement(id).unwrap();
          refetchAnnouncements(); // Optionally refetch the list
        } catch (error) {
          // Handle error (show toast, etc.)
          console.error("Failed to delete announcement", error);
        }
      };

     
  return (
    <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-[1.005] transition-transform duration-300">
    <h3 className="font-bold text-xl mb-4 text-[#034F75]">
      Company Announcements
    </h3>
    <div className="space-y-4 max-h-64 overflow-y-auto scrollbar-hide">
      {announcementsData?.map((announcement) => (
        <div
          key={announcement._id}
          className="flex items-start space-x-4 border-b border-gray-100 pb-4 last:border-b-0 last:pb-0"
          onMouseEnter={() => setHoveredId(announcement._id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-md flex items-center justify-center transform transition-transform hover:rotate-3 duration-200">
            {hoveredId === announcement._id && user?.role === "Admin" ? (
              <Delete className="h-5 w-5 text-red-500" onClick={() => handleDelete(announcement._id)} />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[#034F75]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            )}
          </div>
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-800">
                {announcement.title}
              </h4>
              <p className="text-sm text-gray-500">
                {announcement.date.split("T")[0]}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {announcement.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
  )
}

export default AnnoucementsCard