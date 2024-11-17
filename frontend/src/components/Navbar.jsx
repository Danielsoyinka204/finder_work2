import React from 'react'

const Navbar = () => {
  return (
    <div className='w-full  bg-gray-900 text-white py-4 px-4' >
        <div className='max-w-5xl mx-auto flex items-center justify-between' >
            <h3  className='text-3xl font-bold' >
              <img src='/header.jpeg' alt='logo' className='w-20 h-20 rounded-full' />
            </h3>
        </div>
    </div>
  )
}

export default Navbar