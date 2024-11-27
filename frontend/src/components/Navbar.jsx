import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <div className='w-full  bg-gray-900 text-white py-4 px-4' >
        <div className='max-w-5xl mx-auto flex items-center justify-between' >
            <h3  className='text-3xl font-bold' >
              <Link to='/'  className='border-none outline-none' >
              <img src='/header.jpeg' alt='logo' className='w-20 h-20 rounded-full border-none outline-none' />
              </Link>
            </h3>

            <Link to='/about'  className='px-4 py-2 bg-red-500 rounded-lg' >
            About
            </Link>
        </div>
    </div>
  )
}

export default Navbar