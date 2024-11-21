import React from 'react'
import logo from '../assets/logo.png'

const AuthLayouts = ({children}) => {
  return (
    <>
        <header className='flex justify-center items-center py-3 h-20 bg-white shadow-md'>
          <img
          scr={logo}
          alt='logo'
          width={180}
          height={60}
          />
        </header>
        {children}
    </>
  )
}

export default AuthLayouts
