import React from 'react';

interface UserInfoProps {
  name: string;
  photo?: string;
  onClose: () => void;
  onDeleteChat?: () => void;
  onBlockUser?: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({
  name,
  photo = "/images/cat.jpg", // Default profile photo
  onClose,
  onDeleteChat,
  onBlockUser,
}) => {
  return (
    <div className="relative h-full bg-white rounded-xl shadow-lg py-2  w-full  flex flex-col ">
   <div className='px-4 py-4 shadow-[0_4px_8px_0_rgba(0,0,0,0.08)]'> <h1 className='font-semibold text-[18px] w-full '>User Info</h1></div>
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-3 cursor-pointer text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none"
        aria-label="Close"
      >
        &times;
      </button>
      {/* Profile Picture */}
      <div className=' w-full max-w-xs px-4 flex flex-col items-center justify-center mt-10 '>
      <img
        src={photo}
        alt={name}
        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow mb-4"
      />
      {/* User Name */}
      <div className="text-xl font-semibold text-gray-800 mb-2">{name}</div>
      {/* (Optional) User status or info */}
      <div className="text-gray-500 text-sm mb-6">Online</div>
      {/* Action Buttons */}
      <button
        onClick={onDeleteChat}
        className="w-full py-2 mb-4 rounded bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition"
      >
        Delete Chat
      </button>
      <button
        onClick={onBlockUser}
        className="w-full py-2 rounded bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
      >
        Block User
      </button>
      </div>
    </div>
  );
};

export default UserInfo;