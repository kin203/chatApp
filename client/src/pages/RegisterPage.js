import React, { useState } from 'react';
import { IoMdCloseCircle, IoMdEye, IoMdEyeOff } from "react-icons/io"; // Thêm icon mắt
import { useNavigate } from 'react-router-dom';
import uploadFile from "../helpers/uploadFile";
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    profile_pic: ""
  });

  const [showPassword, setShowPassword] = useState(false); // Trạng thái hiển thị mật khẩu
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Trạng thái hiển thị mật khẩu xác nhận
  const [uploadPhoto, setUploadPhoto] = useState("");
  const [errors, setErrors] = useState({});
  const [emailExists, setEmailExists] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,64}$/;
    return regex.test(password);
  };

  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    const uploadedPhoto = await uploadFile(file);
    setUploadPhoto(file);

    setData((prev) => ({
      ...prev,
      profile_pic: uploadedPhoto?.url
    }));
  };

  const handleClearUploadPhoto = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setUploadPhoto(null);
    setData((prev) => ({
      ...prev,
      profile_pic: ""
    }));
  };

  const checkEmailExists = async (email) => {
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/check-email`;
    try {
      const response = await axios.post(URL, { email });
      setEmailExists(response.data.exists);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === "password") {
      setErrors((prev) => ({
        ...prev,
        password: !validatePassword(value)
          ? "Password must be 8-64 characters, include uppercase, lowercase, number, and special character."
          : ""
      }));
    }

    if (name === "confirmPassword") {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== data.password ? "Passwords do not match." : ""
      }));
    }
  };

  const handleBlurEmail = () => {
    checkEmailExists(data.email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailExists) {
      toast.error("Email already exists.");
      return;
    }

    if (errors.password || errors.confirmPassword) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/register`;

    try {
      const response = await axios.post(URL, {
        name: data.name,
        email: data.email,
        password: data.password,
        profile_pic: data.profile_pic
      });
      toast.success(response?.data?.message);

      if (response.data.success) {
        setData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
          profile_pic: ""
        });

        navigate('/email');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  return (
    <div className='mt-5 flex justify-center items-center bg-gray-100 h-screen'>
      <div className='flex w-full max-w-4xl shadow-lg rounded overflow-hidden'>
        
        {/* Phần giới thiệu */}
        <div className='flex-1 bg-primary p-8 text-white flex flex-col justify-center'>
          <h2 className='text-3xl font-bold mb-4'>Come join us!</h2>
          <p className='text-lg mb-8'>
            We are so excited to have you here! If you haven’t already, create an account to get access to exclusive offers, rewards, and discounts.
          </p>
          <button
            className='bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200'
            onClick={() => navigate("/email")}
          >
            Already have an account? Login
          </button>
        </div>

        {/* Phần form đăng ký */}
        <div className='flex-1 bg-white p-8'>
          <h3 className='text-3xl font-bold text-center mb-6'>Welcome to Mager</h3>

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-1'>
              <label htmlFor='name'>Name :</label>
              <input
                type='text'
                id='name'
                name='name'
                placeholder='Enter your name'
                className='w-full bg-gray-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.name}
                onChange={handleOnChange}
                required
              />
            </div>

            <div className='flex flex-col gap-1'>
              <label htmlFor='email'>Email :</label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Enter your email'
                className='w-full bg-gray-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.email}
                onChange={handleOnChange}
                onBlur={handleBlurEmail}
                required
              />
              {emailExists && (
                <p className="text-red-600 text-sm">Email already exists.</p>
              )}
            </div>

            <div className='flex flex-col gap-1 relative'>
              <label htmlFor='password'>Password :</label>
              <input
                type={showPassword ? 'text' : 'password'}
                id='password'
                name='password'
                placeholder='Enter your password'
                className='w-full bg-gray-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.password}
                onChange={handleOnChange}
                required
              />
              <div
                className="absolute top-9 right-4 text-gray-500 cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
              </div>
              {errors.password && (
                <p className="text-red-600 text-sm">{errors.password}</p>
              )}
            </div>

            <div className='flex flex-col gap-1 relative'>
              <label htmlFor='confirmPassword'>Confirm Password :</label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id='confirmPassword'
                name='confirmPassword'
                placeholder='Re-enter your password'
                className='w-full bg-gray-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.confirmPassword}
                onChange={handleOnChange}
                required
              />
              <div
                className="absolute top-9 right-4 text-gray-500 cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
              </div>
              {errors.confirmPassword && (
                <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
              )}
            </div>

            <button className='w-full bg-primary text-lg py-2 font-bold text-white rounded hover:bg-blue-700'>
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
