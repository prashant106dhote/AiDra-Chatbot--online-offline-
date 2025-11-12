import { Children, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import { useNavigate } from "react-router-dom";
import { dummyChats, dummyUserData } from "../assets/assets";

  

  const AppContext = createContext();
  export const AppContextProvider  = ({children})=>{
 
const navigate = useNavigate()
const [user,setUser] = useState(null)
const [chats,setChats] = useState([])
const [selectedChat,setSelectedChat] = useState(null)
    const [theme,setTheme] = useState(localStorage.getItem('theme')|| 'light');
const fetchUser = async()=>{
    setUser(dummyUserData) //dummyUserData hatao login page lao
}

const fetchUserChat  = async()=>{
    setChats(dummyChats)
    setSelectedChat(dummyChats[0]);
}

useEffect(()=>{
    const root = window.document.documentElement;
   if(theme === 'dark'){
    root.classList.add('dark')
}
else{
       root.classList.remove('dark')

   }
   localStorage.setItem('theme',theme)
},[theme])  

useEffect(()=>{
    if(user){
        fetchUserChat()
    }
    else{
        setChats([])
        setSelectedChat(null)
    }

},[user])
useEffect(()=>{
    fetchUser()
},[])
   const value ={
    navigate,user,setUser ,fetchUser , chats ,setChats,selectedChat,  setSelectedChat, theme, setTheme
   }    
    return(
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
  }
 
  export const useAppContext = ()=> useContext(AppContext)