import { ChevronLeft, Download, DownloadIcon, FileText, LogOut, MessageCircle, MoreVerticalIcon, Paperclip, Phone, Search, Send, Settings, Video } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getConversationMessages, sendMessege, uploadFile } from '../services/api';

export default function Home() {


    const { user, logout } = useContext(AuthContext);
    const { socket, onlineUser } = useContext(SocketContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = ('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [searchQuery, setSearchQuery] = useState(false);

    const scrollRef = useRef();
    const fileInputRef = useRef();


    //date helper

    const formatDate = (timestamp) => {
        if (!timestamp) return "Just Now";

        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? "Just Now" : date.toDateString([], { hour: '2-digit', minute: '2-digit' });
    }

    const filteredUsers = useMemo(() => {
        return users.filter((u) => u.name?.toLowerCase().includes(searchQuery.toLowerCase()),);
    }, [users, searchQuery]);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await getAllUsers();
                setUsers(data);
            }
            catch (error) {
                console.log("Users fetch error", error.message);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!selectedUser?._id) return;
            setLoading(true);
            try {
                const data = await getConversationMessages(selectedUser._id);
                setMessages(data);
            }
            catch (error) {
                console.log("Conversation history error", error.message);
                setMessages([]);
            }

            finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [selectedUser]);


    //real time chat

    useEffect(() => {
        if (!socket) return;

        const handleMessage = (data) => {
            const isFormSelected = selectedUser?._id === data.senderId;
            const isFormMe = data.senderId === (user.id || user._id);

            if (isFormSelected || isFormMe) {
                setMessages((prev) => [...prev, data]);
            }
        };

        socket.on("getMessage", handleMessage);

        return () => socket.off("getMessage", handleMessage);
    }, [socket, selectedUser, user]);


    // Send text message
    const handleSend = async () => {
        if (!input.trim() || !selectedUser) return;

        try {
            const data = await sendMessege({
                recipientId: selectedUser._id,
                text: input,
            });

            socket.emit("sendMessage", {
                recipientId: selectedUser._id,
                ...data,
            });

            setMessages((prev) => [...prev, data]);
            setInput("");
        } catch (error) {
            console.error("send error", error.message);
        }
    };


    const handleChange = async (e) => {
        const file = e.target.files[0];

        if (!file || !selectedUser) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("recipientId", selectedUser._id);

        if (input) formData.append("text", input);

        try {
            const data = await uploadFile(formData);
            socket.emit('sendMessage', { recipientId: selectedUser._id, ...data });
        } catch (error) {
            alert("Upload Failed" + error.message);
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };


    return (
        <div className="flex h-screen w-full bg-[#080a0f] text-slate-300 overflow-hidden font-sans antialiased">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 z-50 w-full md:relative md:w-80 lg:w-96 bg-[#0c0f16] border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out`}>

                {/* Profile Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0e121a]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src=""
                                alt=""
                                className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30"
                            />
                            <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0c0f16] rounded-full'></div>
                        </div>

                        <div className='flex flex-col'>
                            <span className='font-bold text-white text-sm truncate w-24'>User Name</span>
                            <span className='text-[12px] text-slate-500 font-medium'>My Account</span>
                        </div>
                    </div>

                    <div className='flex gap-2'>
                        <button className='p-2.5 hover:bg-white/5 rounded-full transition-all text-slate-400'>
                            <Settings size={18} />
                        </button>
                        <button className='p-2.5 hover:bg-white/5 rounded-full transition-all text-slate-400'>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Search  */}

                <div className='px-6 py-4 '>

                    <div className='relative flex items-center bg-[#141923] rounded-xl px-4 py-2.5 group border border-white/5 focus-within:border-emerald-300/30 transition-all'>
                        <Search size={16} className='text-slate-500 group-focus-within:text-emerald-500 transition-all' />
                        <input type="text" placeholder='Search contracts...'
                            className='bg-transparent text-sm ml-3 outline-none w-full text-slate-200 placeholder:text-slate-600'
                        />
                    </div>
                </div>

                {/* User List  */}

                <div className="flex-1 overflow-y-auto px-4 space-1.5 custom-scrollbar pb-6">
                    <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        All Messages
                    </p>

                    {/* I will use Map Method */}
                    <div className={`group p-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300`}>
                        {/* Individual contact or group item */}

                        <div className='relative'>
                            <img src="" alt="" className={`w-12 h-12 rounded-2xl object-cover transition-all duration-300`} />

                            {/* Coditional Rendering  */}
                            <div className='absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-4 border-[#0c0f16] rounded-full'> </div>
                        </div>


                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-0.5">
                                <p className={`text-sm font-bold truncate`}>User Name</p>
                                <span className="text-[12px] text-slate-500 truncate font-medium">12:45</span>
                            </div>

                            <p className='text-[11px] text-slate-500 truncate font-medium '>
                                {/* Conditional Rendering  */}
                                Active Now
                            </p>
                        </div>

                    </div>
                </div>
            </aside>

            {/* Chat Area  */}

            <main className="flex-1 flex flex-col relative bg-[#080a0f]">
                {/* Conditional Rendering */}
                <>
                    <header className="px-6 py-4 bg-[#080a0f]/60 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center z-40">
                        <div className="flex items-center gap-4">
                            <button>
                                <ChevronLeft />
                            </button>
                            <img src="" alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                            <div>
                                <h2 className="font-bold text-white leading-tight">Name</h2>
                                <span className='text-[12px] font-bold text-slate-500 tracking-tighter '>Online</span>
                            </div>
                        </div>

                        <div className='flex gap-1 '>
                            <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'>
                                <Phone size={18} />
                            </button>

                            <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'>
                                <Video size={18} />
                            </button>

                            <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'>
                                <MoreVerticalIcon size={18} />
                            </button>

                        </div>
                    </header>

                    {/* Messege  */}

                    <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right, #10141d_0%, #080a0f_45% )] '>
                        {/* Conditional Rendering */}

                        <div className='h-full flex flex-col items-center justify-center space-y-4 '>
                            <div className='w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin'></div>
                            <span className='text-[10px] text-slate-500 uppercase font-black tracking-widest '>Encrypted Sync</span>
                        </div>

                        {/* ELSE Conditional Based */}

                        <div className={`flex `}>
                            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col `}>
                                <div className={`relative px-4 py-3 shadow-2xl`}>
                                    {/* Conditonal Rendering */}
                                    <div className='mb-2 relative group overflow-hidden rounded-xl'>

                                        <img src="" alt="" className='max-w-fit rounded-xl cursor-zoom-in hover:scale-105 transition-all' />

                                        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center'>
                                            <Download />
                                        </div>
                                    </div>

                                    {/* Else state */}

                                    <div className='flex items-center gap-3 p-3 bg-black/20 rounded-xl mb-2 border border-white/5 group '>
                                        <div className='p-2 bg-emerald-500/10 text-emerald-400 rounded-lg'>
                                            <FileText size={20} />
                                        </div>
                                        <div className='flex-1 min-w-0 '>
                                            <p className='text-xs font-bold truncate'>
                                                Documents
                                            </p>
                                        </div>

                                        <a href="#" className='p-1.5 text-slate-400 hover:text-white transition-all '>
                                            <DownloadIcon size={16} />
                                        </a>
                                    </div>

                                    {/* Conditional Rendering */}

                                    <p className='text-[13px] leading-relaxed font-medium '>Text</p>

                                    {/* Date  */}

                                    <div className={`mt-1.5 text-[9px] font-bold `}>
                                        Date
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* input  */}

                    <div className='p-6 bg-gradient-to-t from-[#080a0f] to-transparent  '>
                        <div className='max-w-4xl mx-auto flex items-center gap-3 bg-[#0f141e] rounded-[24px] p-2 border border-white/10 shadow-2xl focus-within:border-emerald-500/40 transition-all '>
                            <input type="file" className='hidden' />
                            <button className='p-3 text-slate-500 hover:text-emerald-400 transition-all'>
                                <Paperclip size={20} />
                            </button>

                            <input type="text"
                                placeholder='Type a message...'
                                className='flex-1 bg-transparent text-[13px] py-2 px-2 outline-none text-slate-100 placeholder:text-slate-600  '
                            />

                            <button className='bg-emerald-500 text-black p-3.5 rounded-full hover:bg-emerald-400 active:scale-90 transition-all disabled:opacity-30 shadow-lg shadow-emerald-500/30 '>
                                <Send size={18} />
                            </button>

                        </div>
                    </div>
                </>

                {/* Else Statement */}
                <div className='flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_top_right, #10141d_0%, #080a0f_100% )] '>
                    <div className='w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mb-6 border border-emerald-500/10 animate-pulse'>
                        <MessageCircle size={32} className='text-emerald-500/50' />
                    </div>

                    <h3 className='text-2xl font-bold text-white mb-2 tracking-tight '>Ghost Messenger</h3>
                    <p className='text-slate-500 text-xs max-w-[200px] font-medium leading-relaxed'>
                        Select a teammate to start secure encrypted session.
                    </p>
                </div>
            </main>

            <style>{
                `
                .custom - scrollbar::-webkit-scrollbar {width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track {background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb {background: #1a1f29; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {background: #34d399; }
                `
            }</style>

        </div>
    );
}
