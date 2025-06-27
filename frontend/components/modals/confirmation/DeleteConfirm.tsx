import { useState ,useRef} from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { SuccessToast, FailedToast } from "@/components/toasts/Notifications";

const DeleteConfirm = (props: any) => {
  const { id, onClose, handleDelete, Data,modalRef,open } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async (e:any) => {
    try {
        e.stopPropagation();
      setIsDeleting(true);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleDelete(e);
      
      toast(<SuccessToast message="User deleted successfully" />);
    } catch (error) {
      toast(<FailedToast message="Failed to delete user" />);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  }
  console.log("=====",Data,  onClose, handleDelete);
  

  return (

   
    <div  className={`
        fixed inset-0  flex flex-col items-center justify-center w-screen  text-[#042349]
        bg-black/40 backdrop-blur-sm
        transition-opacity duration-500
        ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
      `}>
        <motion.div 
        
   
      onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className=" flex bg-white w-[350px] h-[320px]  rounded-lg shadow-lg flex-col items-center justify-center  "
    >
      {/* Warning icon with animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6"
      >
        <div  className="relative ">
          <div className="w-16 h-16 bg-red-100 rounded-full  z-50 flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <motion.div
            className="absolute inset-0 border-4 border-red-200 rounded-full"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Message with staggered animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center space-y-2 mb-6"
      >
        <h3 className="text-xl font-semibold text-[#042349]">Confirm Deletion</h3>
        <p className="text-[#042349] font-medium">
          Are you sure you want to delete{" "}
          <span className="font-bold text-red-500">
            {Data.title} 
          </span>
          ?
        </p>
        <p className="text-sm text-[#042349]">This action cannot be undone</p>
      </motion.div>

      {/* Buttons with hover effects */}
      <motion.div 
        className="flex justify-center gap-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium  bg-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 transition-all duration-200"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleConfirmDelete}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50 flex items-center gap-2 transition-all duration-200"
        >
          {isDeleting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    className="text-white"
                    fill="currentColor"
                    d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                    opacity="0.25"
                  />
                  <path
                    className="text-white"
                    fill="currentColor"
                    d="M12 2C14.5013 2 16.8912 2.99479 18.6985 4.69785C20.5058 6.4009 21.5 8.79129 21.5 11.2931"
                  />
                </svg>
              </motion.div>
              Deleting...
            </>
          ) : (
            'Delete'
          )}
        </motion.button>
      </motion.div>
    </motion.div>
    </div>
  );
};

export default DeleteConfirm;