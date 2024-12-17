import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { LuUserCircle2 } from "react-icons/lu";
import Avatar from '../components/Avatar';
import { useDispatch } from 'react-redux';
import { setToken } from '../redux/userSlice';


const CheckPasswordPage = () => {
  const [data,setData] = useState({
    userId : "",
    password : "",
  })

  const navigate = useNavigate()
  const location = useLocation()
  const dispatch= useDispatch()


  console.log(location.state)

  useEffect(() => {
    if (!location?.state?.name) {
      navigate('/email');
    }
  }, [location, navigate]);
  

  const handleSummit = async (e) => {
    e.preventDefault();
  
    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/password`;
    console.log("Request URL:", URL);
    console.log("Request Body:", {
      userId: location?.state?._id,
      password: data.password
    });
  
    try {
      const response = await axios.post(URL, {
        userId: location?.state?._id,
        password: data.password
      }, {
        withCredentials: true // Đảm bảo gửi credentials
      });
  
      console.log("Response:", response.data);
      toast.success(response?.data?.message);
  
      if (response.data.success) {
        dispatch(setToken(response?.data?.token));
        localStorage.setItem('token', response?.data?.token);
        navigate('/');
      }
    } catch (error) {
      console.error("Error:", error?.response || error.message);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    }
  };
  
  const handleOnChange = (e)=>{
    const {name,value} = e.target

    setData((preve)=>{
      return{
        ...preve,
        [name] : value
      }
    })
  }

  return (
    <div className='mt-5 flex justify-center items-center bg-gray-100 h-screen'>
      <div className='flex w-full max-w-4xl shadow-lg rounded overflow-hidden'>

        <div className='flex-1 bg-primary p-8 text-white flex flex-col justify-center'>
          <h2 className='text-3xl font-bold mb-4'>Come join us!</h2>
          <p className='text-lg mb-8'>
            One more click to access Mager. Let's enter your password :)) 
          </p>
          <button className='bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200'>
            Forgot password ??{" "}
            <Link to="/forgot-password" className='hover:text-primary font-bold'>
              Recover now
            </Link>
          </button>
        </div>

        {/* Phần form đăng nhập */}
        <div className='flex-1 bg-white p-8'>
          <div className='w-fit mx-auto mb-2 flex justify-center items-center flex-col'>
            <Avatar
              width={70}
              height={70}
              name={location?.state?.name}
              imageUrl={location?.state?.profile_pic}
            />
            <h2 className='font-semibold text-lg mt-1'>Hello {location?.state?.name} !!</h2>
          </div>

          <h2 className='font-bold text-center mb-6 text-2xl'>Welcome to Mager!</h2>

          <form className='grid gap-3' onSubmit={handleSummit}>
            <div className='flex flex-col gap-1'>
              <label htmlFor='password'>Password :</label>
              <input
                type='password'
                id='password'
                name='password'
                placeholder='Enter your password'
                className='bg-slate-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.password}
                onChange={handleOnChange}
                required
              />
            </div>

            <button className='w-full bg-primary text-lg py-2 font-bold text-white rounded hover:bg-blue-700 mt-4'>
              Login
            </button>
          </form>

          <p className='my-3 text-center'>
            Forgot password?{" "}
            <Link to="/forgot-password" className='hover:text-primary font-bold'>
              Recover now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default CheckPasswordPage
