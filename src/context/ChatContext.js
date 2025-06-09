import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatContextProvider = ({ children }) => {
    const {currentUser} = useContext(AuthContext);
    const INITIAL_STATE = {
        chatId: "null",
        user: {},
        sidebarVisible: true,
        chatVisible: false
    }

    const chatReducer = (state, action) => {
        switch(action.type) {
            case "CHANGE_USER":
                return{
                    ...state,
                    user: action.payload,
                    chatId: currentUser.uid > action.payload.uid
                    ? currentUser.uid + action.payload.uid
                    : action.payload.uid + currentUser.uid,
                    chatVisible: true
                };
            case "TOGGLE_SIDEBAR":
                return {
                    ...state,
                    sidebarVisible: action.payload !== undefined ? action.payload : !state.sidebarVisible
                };
            case "RESET_CHAT":
                return {
                    ...INITIAL_STATE,
                    sidebarVisible: state.sidebarVisible
                };
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE)

    return (
        <ChatContext.Provider value={{ data:state, dispatch }}>
            {children}
        </ChatContext.Provider>
    );
};