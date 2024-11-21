import React, { useState } from 'react'
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from 'react-router-dom';
import uploadFile from '../helpers/uploadFile';
import axios from 'axios'
import toast from 'react-hot-toast';
import { PiUserCircle } from "react-icons/pi";

const CheckEmailPage = () => {
  const [data,setData] = useState({
    email : "",
  })
  const navigate = useNavigate()

  const handleOnChange = (e)=>{
    const { name, value} = e.target

    setData((preve)=>{
      return{
          ...preve,
          [name] : value
      }
    })
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    e.stopPropagation()

    const URL = `${process.env.REACT_APP_BACKEND_URL}/api/email`

    try {
        const response = await axios.post(URL,data)

        toast.success(response.data.message)

        if(response.data.success){
            setData({
              email : "",
            })
            navigate('/password',{
              state : response?.data?.data
            })
        }
    } catch (error) {
        toast.error(error?.response?.data?.message)
    }
  }


  return (
    <div className='mt-5 flex justify-center items-center bg-gray-100 h-screen'>
      {/* Container chính */}
      <div className='flex w-full max-w-4xl shadow-lg rounded overflow-hidden'>

        {/* Phần giới thiệu */}
        <div className='flex-1 bg-primary p-8 text-white flex flex-col justify-center'>
          <h2 className='text-3xl font-bold mb-4'>Welcome to Chat App!</h2>
          <p className='text-lg mb-8'>
            Enter your email to start chatting with your friends and enjoy endless conversations!
          </p>
          <button
            className='bg-white text-primary font-bold py-2 px-4 rounded hover:bg-gray-200'
            onClick={() => navigate("/register")}
          >
            New user? Register now!
          </button>
        </div>

        {/* Phần form đăng nhập */}
        <div className='flex-1 bg-white p-8'>
          <div className='w-fit mx-auto mb-2'>
            <PiUserCircle size={80} />
          </div>
          <h3 className='text-3xl font-bold text-center mb-6'>Welcome to Chat App!</h3>

          <form className='grid gap-4 mt-3' onSubmit={handleSubmit}>
            <div className='flex flex-col gap-1'>
              <label htmlFor='email'>Email :</label>
              <input
                type='email'
                id='email'
                name='email'
                placeholder='Enter your email'
                className='bg-slate-100 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-primary'
                value={data.email}
                onChange={handleOnChange}
                required
              />
            </div>

            <button
              className='w-full bg-primary text-lg py-2 font-bold text-white rounded hover:bg-blue-700 mt-4'
            >
              Let's Go
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CheckEmailPage
