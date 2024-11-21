// import React, { useEffect, useRef, useState } from 'react'
// import Avatar from './Avatar'
// import uploadFile from '../helpers/uploadFile'
// import Divider from './Divider'
// import axios from 'axios'
// import taost from 'react-hot-toast'
// import { useDispatch } from 'react-redux'
// import { setUser } from '../redux/userSlice'

// const EditUserDetail = ({onClose,user}) => {
//     const uploadPhotoRef = useRef()
//     const dispatch = useDispatch()

//     const [data,setData] = useState({
        
//         name: user?.user || "",
//         profile_pic : user?.profile_pic
//     })

//     useEffect(() => {
//         if (user) {
//             setData((prev) => ({
//                 ...prev,
//                 ...user
//             }));
//         }
//     }, [user]);
//     const handleOnChange = (e)=>{
//         const { name, value } = e.target

//         setData((preve)=>{
//             return{
//                 ...preve,
//                 [name] : value
//             }
//         })
//     }

//     const handleOpenUploadPhoto = (e)=>{
//         e.preventDefault()
//         e.stopPropagation()

//         uploadPhotoRef.current.click()
//     }

//     const handleUploadPhoto = async(e)=>{
//         const file = e.target.files[0]

//         const uploadPhoto = await uploadFile(file)

//         setData((preve)=>{
//         return{
//             ...preve,
//             profile_pic : uploadPhoto?.url
//         }
//         })
//     }

//     const handleSubmit = async(e)=>{
//         e.preventDefault()
//         e.stopPropagation()
//         try {
//             const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`

//             const response = await axios({
//                 method : 'post',
//                 url : URL,
//                 data : data,
//                 withCredentials : true
//             })

//             console.log('response',response)
//             taost.success(response?.data?.message)
            
//             if(response.data.success){
//                 dispatch(setUser(response.data.data))
//                 onClose()
//             }
         
//         } catch (error) {
//             console.log(error)
//             taost.error()
//         }
//     }
//   return (
//     <div className='fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10'>
//         <div className='bg-white p-4 m-1 rounded w-full max-w-sm'>
//             <h2 className='font-semibold'>Profile details</h2>
//             <p className='text-sm '>Edit User Detail</p>

//             <form className='grip gap-3 mt-3 '>
//             <div className='flex flex-col gap-1'>
//                 <label htmlFor='name'>Name:</label>
//                 <input
//                     type='text'
//                     name='name'
//                     id='name'
//                     value={data.name}
//                     onChange={handleOnChange}
//                     className='w-full py-1 px-2 focus:outline-primary border-0.5'
//                 />
//             </div>
//             <div>
//                     <div>Photo:</div>
//                         <div className='my-1 flex items-center gap-4'>
//                             <Avatar
//                                 width={40}
//                                 height={40}
//                                 imageUrl={data?.profile_pic}
//                                 name={data?.name}
//                             />
//                             <label htmlFor='profile_pic'>
//                             <button className='font-semibold' onClick={handleOpenUploadPhoto}>Change Photo</button>
//                             <input
//                                 type='file'
//                                 id='profile_pic'
//                                 className='hidden'
//                                 accept="image/*"
//                                 onChange={handleUploadPhoto}
//                                 ref={uploadPhotoRef}
//                             />
//                             </label>
//                         </div>
//                 </div>
//                 <Divider/>    
//                 <div className='flex gap-2 w-fit ml-auto '>
//                     <button onClick={onClose} className='border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white'>Cancel</button>
//                     <button onClick={handleSubmit} className='border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary'>Save</button>
//                 </div>
//             </form>
//         </div>
//     </div>
//   )
// }

// export default React.memo(EditUserDetail)


import React, { useEffect, useRef, useState } from 'react';
import Avatar from './Avatar';
import Divider from './Divider';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/userSlice';
import uploadFile from '../helpers/uploadFile';

const EditUserDetail = ({ onClose, user }) => {
    const uploadPhotoRef = useRef();
    const dispatch = useDispatch();

    // State lưu thông tin user
    const [data, setData] = useState({
        name: user?.name || '',
        profile_pic: user?.profile_pic || '',
    });

    // Đồng bộ state khi prop `user` thay đổi
    useEffect(() => {
        if (user) {
            console.log('User prop received:', user); // Kiểm tra dữ liệu truyền vào
            setData({
                name: user.name || '',
                profile_pic: user.profile_pic || '',
            });
        }
    }, [user]);

    // Xử lý thay đổi input
    const handleOnChange = (e) => {
        const { name, value } = e.target;
        setData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Mở cửa sổ chọn ảnh
    const handleOpenUploadPhoto = (e) => {
        e.preventDefault();
        uploadPhotoRef.current.click();
    };

    // Upload ảnh mới
    const handleUploadPhoto = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
      
        try {
          const response = await uploadFile(file); // Gọi hàm uploadFile
          const uploadedUrl = response?.url;
      
          setData((prev) => ({
            ...prev,
            profile_pic: uploadedUrl,
          }));
          toast.success("Photo uploaded successfully");
        } catch (error) {
          console.error("Error uploading photo:", error.message);
          toast.error(error.message || "Failed to upload photo.");
        }
      };

    // Lưu thông tin user
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const URL = `${process.env.REACT_APP_BACKEND_URL}/api/update-user`;

            const response = await axios.post(URL, data, {
                withCredentials: true,
            });

            console.log('Response:', response);
            toast.success(response.data.message);

            if (response.data.success) {
                dispatch(setUser(response.data.data)); // Cập nhật Redux store
                onClose(); // Đóng modal
            }
        } catch (error) {
            console.error('Error updating user:', error);
            toast.error('Failed to update user.');
        }
    };

    return (
        <div className="fixed top-0 bottom-0 left-0 right-0 bg-gray-700 bg-opacity-40 flex justify-center items-center z-10">
            <div className="bg-white p-4 m-1 rounded w-full max-w-sm">
                <h2 className="font-semibold">Profile Details</h2>
                <p className="text-sm">Edit User Detail</p>

                <form className="grid gap-3 mt-3">
                    {/* Tên người dùng */}
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name">Name:</label>
                        <input
                            type="text"
                            name="name"
                            id="name"
                            value={data.name}
                            onChange={handleOnChange}
                            className="w-full py-1 px-2 focus:outline-primary border-0.5"
                        />
                    </div>

                    {/* Ảnh đại diện */}
                    <div>
                        <div>Photo:</div>
                        <div className="my-1 flex items-center gap-4">
                            <Avatar
                                width={40}
                                height={40}
                                imageUrl={data.profile_pic}
                                name={data.name}
                            />
                            <button
                                className="font-semibold"
                                onClick={handleOpenUploadPhoto}
                            >
                                Change Photo
                            </button>
                            <input
                                type="file"
                                id="profile_pic"
                                className="hidden"
                                accept="image/*"
                                onChange={handleUploadPhoto}
                                ref={uploadPhotoRef}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* Nút hành động */}
                    <div className="flex gap-2 w-fit ml-auto">
                        <button
                            onClick={onClose}
                            className="border-primary border text-primary px-4 py-1 rounded hover:bg-primary hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="border-primary bg-primary text-white border px-4 py-1 rounded hover:bg-secondary"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default React.memo(EditUserDetail);
