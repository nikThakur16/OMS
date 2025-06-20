import messageIcon from '@/utils/media/gifs/message.gif'


type Announcement = {
  title: string;
  message: string;
  createdBy?: { role?: string };
};
const maxLength = 40;


// Employee Toast
export const EmployeeAnnouncementToast = ({
  announcement,
}: {
  announcement: Announcement;
}) => (
  <div
    className={`
     
      flex items-center gap-6 p-4 bg-[#175075] border-l-4 w-[300px] border-blue-400 rounded-xl shadow-lg
    `}
  >
    <img className='rounded-lg h-10 w-10' src={messageIcon.src} alt="" />
    <div className="text-gray-100">
      <div className="font-semibold">{announcement.title}</div>
      <div className="text-sm">{announcement.message.length>maxLength ? (announcement.message).slice(0, maxLength) + "..." :announcement.message}</div>
    
      <div className="text-xs text-gray-400 mt-2">
        From: {announcement.createdBy?.role || "Admin"}
      </div>
    </div>
 
  </div>
);

// Admin Toast
export const AdminAnnouncementToast = ({
  announcement,
}: {
  announcement: Announcement;
}) => (
  <div
    className={`
  
      flex items-center gap-3 p-4 bg-gray-900 border-l-4  border-emerald-500 rounded-xl shadow-lg
    `}
  >
    <i className="fa-solid fa-check-double text-emerald-500 text-lg" />
    <div className="text-gray-100">
      <div className="font-semibold">Announcement Sent</div>
      <div className="text-sm">{announcement.title}</div>

      <div className="text-xs text-gray-400 mt-2">
        From: {announcement.createdBy?.role || "You"}
      </div>
    </div>
 
  </div>
);

// HR Toast
export const HRAnnouncementToast = ({
  announcement,
}: {
  announcement: Announcement;
}) => (
  <div
    className={`
    
      flex items-center gap-3 p-4 bg-fuchsia-900 border-l-4 border-pink-500 rounded-xl shadow-lg
    `}
  >
    <i className="fa-solid fa-user-tie text-pink-400 text-lg" />
    <div className="text-gray-100">
      <div className="font-semibold">HR Announcement</div>
      <div className="text-sm">{announcement.title}</div>
      <div className="text-xs mt-1 text-gray-300">{announcement.message}</div>
      <div className="text-xs text-gray-400 mt-2">
        From: {announcement.createdBy?.role || "HR"}
      </div>
    </div>
   
  </div>
);
