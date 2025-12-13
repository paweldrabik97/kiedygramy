import React from 'react'

const PrimaryButton = ({ onClick, children }) => {
  return (
    <>
      <button
        type="button"
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onClick}
      >
        {children}
      </button>
    </>
  )
}

export default PrimaryButton