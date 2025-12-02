import React, { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Message from './Message'
import toast from 'react-hot-toast'
import MicButton from './MicButton'

const ChatBox = () => {
  const containerRef = useRef(null)
  const micRef = useRef(null)
  const { selectedChat, theme, user, axios, token, setUser } = useAppContext()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('text')
  const [isPublished, setIsPublished] = useState(false)

  // Submit handler
  const onSubmit = async (e) => {
    e.preventDefault()
    if (!user) return toast('Login to send message')

    // Stop mic when sending
    micRef.current?.stopMic()

    setLoading(true)
    const promptCopy = prompt
    setPrompt('')
    setMessages(prev => [...prev, { role: 'user', content: promptCopy, timestamp: Date.now(), isImage: false }])

    try {
      const { data } = await axios.post(
        `/api/message/${mode}`,
        { chatId: selectedChat._id, prompt: promptCopy, isPublished },
        { headers: { Authorization: token } }
      )
      if (data.success) {
        setMessages(prev => [...prev, data.reply])
        if (mode === 'image') setUser(prev => ({ ...prev, credits: prev.credits - 2 }))
        else setUser(prev => ({ ...prev, credits: prev.credits - 1 }))
      } else {
        toast.error(data.message)
        setPrompt(promptCopy)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setPrompt('')
      setLoading(false)
    }
  }

  // Load selected chat messages
  useEffect(() => {
    if (selectedChat) setMessages(selectedChat.messages)
  }, [selectedChat])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  return (
    <div className="flex-1 flex flex-col justify-between m-5 md:m-10 xl:mx-30 max-md:mt-14 2xl:pr-40">
      {/* Chat messages */}
      <div ref={containerRef} className="flex-1 md-5 overflow-y-scroll">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-primary">
            <img
              src={theme === 'dark' ? assets.logo_full : assets.logo_full_dark}
              alt=""
              className="w-full max-w-56 sm:max-w-68"
            />
            <p className="mt-5 text-4xl sm:text-6xl text-center text-gray-400 dark:text-white">
              Ask me anything.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <Message key={index} message={message} />
        ))}

        {/* Loading animation */}
        {loading && (
          <div className="loader flex items-center gap-1.5 mt-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 dark:bg-white animate-bounce"></div>
          </div>
        )}
      </div>

      {/* Image publish checkbox */}
      {mode === 'image' && (
        <label className="inline-flex items-center gap-2 md-3 text-sm mx-auto mt-2">
          <p className="text-xs">Publish Generated Image to Community</p>
          <input
            type="checkbox"
            className="cursor-pointer"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
          />
        </label>
      )}

      {/* Prompt input with mic */}
      <form
        onSubmit={onSubmit}
        className="bg-primary/20 dark:bg-[#583C79]/30 border border-primary dark:border-[#80609F]/30 rounded-full w-full max-w-2xl p-3 pl-4 mx-auto flex gap-3 items-center mt-4"
      >
        <select
          onChange={(e) => setMode(e.target.value)}
          value={mode}
          className="text-sm pl-3 pr-2 outline-none rounded-md"
        >
          <option className="dark:bg-purple-900" value="text">
            Text
          </option>
          <option className="dark:bg-purple-900" value="image">
            Image
          </option>
        </select>
        <input
          onChange={(e) => setPrompt(e.target.value)}
          value={prompt}
          type="text"
          placeholder="Type your prompt here..."
          className="flex-1 w-full text-sm outline-none bg-transparent"
          required
        />
        <MicButton ref={micRef} onText={(text) => setPrompt((prev) => prev + text)} />
        
        <button disabled={loading}>     
          <img
            src={loading ? assets.stop_icon : assets.send_icon}
            className="w-8 cursor-pointer"
            alt="send"
          />
        </button>
      </form>
    </div>
  )
}

export default ChatBox
