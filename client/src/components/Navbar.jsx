import React from 'react'
import { assets } from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { useAppContext } from '../context/AppContext.jsx'

const Navbar = () => {
  // const { token, uToken } = useAppContext();
  const token = localStorage.getItem('token');
  const uToken = localStorage.getItem('uToken');
  const navigate = useNavigate();

  // Decide button label and navigation target
  let buttonLabel = "Login";
  let handleClick = () => navigate('/login');

  if (token) {
    buttonLabel = "Dashboard";
    handleClick = () => navigate('/admin');
  } else if (uToken) {
    buttonLabel = "Profile";
    handleClick = () => navigate('/user');
  }

  return (
    <div className='flex justify-between items-center py-5 mx-8 sm:mx-20 xl:mx-32 cursor-pointer'>
      <img
        onClick={() => navigate('/')}
        src={assets.logo}
        alt='logo'
        className='w-32 sm:w-44'
      />
      <button
        onClick={handleClick}
        className='flex items-center gap-2 rounded-full text-sm cursor-pointer bg-primary text-white px-10 py-2.5'
      >
        {buttonLabel}
        <img src={assets.arrow} className='w-3' alt='arrow' />
      </button>
    </div>
  );
}

export default Navbar
