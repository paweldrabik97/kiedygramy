import React from 'react'

const PrimaryButton = ({ onClick, children }) => {
  return (
    <>
      <button
        type="button"
        className="bg-gradient-to-r from-primary to-fuchsia-500 hover:from-primary-hover hover:to-fuchsia-600 text-white font-bold py-2 px-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-95"
        onClick={onClick}
      >
        {children}
      </button>
    </>
  )
}

export default PrimaryButton