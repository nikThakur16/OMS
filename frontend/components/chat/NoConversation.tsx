import React from 'react'

const NoConversation = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full text-center text-gray-700">
      {/* Icon */}
      <div className="mb-6">
        {/* You can use a phone or video icon SVG here */}
        {/* <svg
          xmlns="/gifs/convoMessage.gif"
          className="mx-auto h-24 w-24 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.05 5.05a7 7 0 0 1 3.95 6.45v1a7 7 0 0 1-7 7 7 7 0 0 1-7-7v-1a7 7 0 0 1 3.95-6.45M9 10h.01M15 10h.01"
          />
        </svg> */}
        <img  src="/gifs/convoMessage.gif" alt="convo" />
      </div>
      {/* Heading */}
      <h2 className="text-2xl font-bold mb-2">Welcome to Your Conversations</h2>
      {/* Subtitle */}
      <p className="text-gray-500 max-w-md">
        Select a Chat from the list to start exploring your Chat history or begin a new chat.
      </p>
    </div>
  )
}

export default NoConversation