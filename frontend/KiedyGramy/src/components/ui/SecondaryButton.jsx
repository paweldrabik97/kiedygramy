import React from 'react'

const SecondaryButton = ({ onClick, children }) => {
  return (
    <>
      <button
        type="button"
        className="bg-gradient-to-r from-secondary to-amber-300 hover:from-yellow-400 hover:to-amber-400 text-amber-900 font-bold py-2 px-4 rounded-xl shadow-md shadow-amber-200/50 transition-all active:scale-95"
        onClick={onClick}
      >
        {children}
      </button>
    </>
  )
}

export default SecondaryButton