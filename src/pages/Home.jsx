import { ChevronLeft, DownloadIcon, FileText, LogOut, MessageCircle, MoreVerticalIcon, Paperclip, Phone, Search, Send, Settings, Video } from 'lucide-react';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext';
import { SocketContext } from '../contexts/SocketContext';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getConversationMessages, sendMessege, uploadFile } from '../services/api';

export default function Home() {
    const { user, logout, token } = useContext(AuthContext);
    const { socket, onlineUser } = useContext(SocketContext);
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const scrollRef = useRef();
    const fileInputRef = useRef();

    const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

    // Auto-scroll to bottom whenever messages change
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const formatDate = (timestamp) => {
        if (!timestamp) return "Just Now";
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? "Just Now" : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Filtered users for search sidebar
    const filteredUsers = useMemo(() => {
        if (!user) return [];
        return users.filter((u) =>
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [users, searchQuery, user]);

    // Fetch initial user list
    useEffect(() => {
        const fetchUsers = async () => {
            if (!token) return;
            try {
                const data = await getAllUsers();
                if (data && Array.isArray(data.user)) {
                    setUsers(data.user);
                } else {
                    setUsers(Array.isArray(data) ? data : []);
                }
            } catch (error) {
                console.log("Users fetch error", error.message);
            }
        };
        fetchUsers();
    }, [token]);

    // Fetch Chat History when a user is selected
    useEffect(() => {
        const fetchHistory = async () => {
            if (!selectedUser?._id) return;
            setLoading(true);
            try {
                const data = await getConversationMessages(selectedUser._id);
                setMessages(Array.isArray(data) ? data : []);
            } catch (error) {
                console.log("Conversation history error", error.message);
                setMessages([]);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [selectedUser]);

    // REAL-TIME: Socket Listener
    useEffect(() => {
        if (!socket) return;

        const handleIncoming = (msg) => {
            // Use .toString() to avoid Object vs String comparison bugs
            const currentChatId = selectedUser?._id?.toString();
            const senderId = msg.senderId?.toString();

            // Only add to state if the message is from the person I am talking to
            if (senderId === currentChatId) {
                setMessages((prev) => {
                    // Prevent duplicate messages
                    if (prev.find(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on("getMessage", handleIncoming);
        return () => socket.off("getMessage", handleIncoming);
    }, [socket, selectedUser]);

    // ACTION: Send Message
    const handleSend = async () => {
        if (!input.trim() || !selectedUser) return;

        try {
            const response = await sendMessege({
                recipientId: selectedUser._id,
                text: input,
            });

            // CRITICAL: Your backend returns { status: "Success", data: { ...msg } }
            // We need the ACTUAL message object from the database
            const newMessage = response.data;

            if (newMessage) {
                // 1. Update User A's UI immediately with the DB version
                setMessages((prev) => [...prev, newMessage]);

                // 2. Send the DB version to User B via Socket
                socket.emit("sendMessage", newMessage);

                setInput("");
            }
        } catch (error) {
            console.error("API Send Error:", error);
        }
    };

    // ACTION: Handle File Upload
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedUser) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("recipientId", selectedUser._id);

        try {
            const response = await uploadFile(formData);
            const msgData = response.newMsg || response;

            socket.emit('sendMessage', msgData);
            setMessages((prev) => [...prev, msgData]);
        } catch (error) {
            alert("Upload Failed: " + error.message);
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    return (
        <div className="flex h-screen w-full bg-[#080a0f] text-slate-300 overflow-hidden font-sans antialiased">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 z-50 w-full md:relative md:w-80 lg:w-96 bg-[#0c0f16] border-r border-white/5 flex flex-col transition-transform duration-500 ease-in-out ${selectedUser ? "-translate-x-full md:translate-x-0" : "translate-x-0"}`}>

                {/* Profile Header */}
                <div className="p-6 flex items-center justify-between border-b border-white/5 bg-[#0e121a]">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src={user?.profilePic || DEFAULT_AVATAR} alt="" className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500/30" />
                            {onlineUser?.includes(user?._id) && <div className='absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0c0f16] rounded-full'></div>}
                        </div>
                        <div className='flex flex-col'>
                            <span className='font-bold text-white text-sm truncate w-24'>{user?.name || "My Account"}</span>
                            <span className='text-[12px] text-slate-500 font-medium'>Online</span>
                        </div>
                    </div>
                    <div className='flex gap-2'>
                        <button className='p-2.5 hover:bg-white/5 rounded-full text-slate-400 cursor-pointer' onClick={() => navigate('/profile')}><Settings size={18} /></button>
                        <button className='p-2.5 hover:bg-white/5 rounded-full text-slate-400 cursor-pointer' onClick={logout}><LogOut size={18} /></button>
                    </div>
                </div>

                {/* Search */}
                <div className='px-6 py-4'>
                    <div className='relative flex items-center bg-[#141923] rounded-xl px-4 py-2.5 group border border-white/5 focus-within:border-emerald-300/30 transition-all'>
                        <Search size={16} className='text-slate-500 group-focus-within:text-emerald-500' />
                        <input type="text" placeholder='Search users...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='bg-transparent text-sm ml-3 outline-none w-full text-slate-200 placeholder:text-slate-600' />
                    </div>
                </div>

                {/* User List */}
                <div className="flex-1 overflow-y-auto px-4 space-y-2 custom-scrollbar pb-6">
                    <p className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-slate-600">All Messages</p>
                    {filteredUsers.map((u) => (
                        <div
                            key={u._id}
                            onClick={() => setSelectedUser(u)}
                            className={`group p-3 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 ${selectedUser?._id === u._id ? "bg-emerald-600/20 border border-emerald-500/30" : "hover:bg-white/5 border border-transparent"}`}
                        >
                            <div className='relative'>
                                <img src={u.profilePic || DEFAULT_AVATAR} alt="" className="w-12 h-12 rounded-2xl object-cover" />
                                {onlineUser?.includes(u._id) && <div className='absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-4 border-[#0c0f16] rounded-full'> </div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <p className={`text-sm font-bold truncate ${selectedUser?._id === u._id ? "text-emerald-400" : "text-slate-200"}`}>{u.name || u.email.split('@')[0]}</p>
                                </div>
                                <p className='text-[11px] text-slate-500 truncate font-medium '>
                                    {onlineUser?.includes(u._id) ? "Active Now" : "Offline"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* Chat Area */}
            <main className="flex-1 flex flex-col relative bg-[#080a0f]">
                {selectedUser ? (
                    <>
                        {/* Chat Header */}
                        <header className="px-6 py-4 bg-[#080a0f]/60 backdrop-blur-2xl border-b border-white/5 flex justify-between items-center z-40">
                            <div className="flex items-center gap-4">
                                <button onClick={() => setSelectedUser(null)} className='md:hidden p-2 text-slate-400'><ChevronLeft /></button>
                                <img src={selectedUser.profilePic || DEFAULT_AVATAR} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                                <div>
                                    <h2 className="font-bold text-white leading-tight">{selectedUser.name || selectedUser.email}</h2>
                                    <span className='text-[12px] font-bold text-slate-500'>{onlineUser?.includes(selectedUser._id) ? "Online" : "Offline"}</span>
                                </div>
                            </div>
                            <div className='flex gap-1'>
                                <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'><Phone size={18} /></button>
                                <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'><Video size={18} /></button>
                                <button className='p-2.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all'><MoreVerticalIcon size={18} /></button>
                            </div>
                        </header>

                        {/* Messages Area */}
                        <div className='flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right, #10141d_0%, #080a0f_45%)]'>
                            {loading ? (
                                <div className='h-full flex flex-col items-center justify-center space-y-4'>
                                    <div className='w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin'></div>
                                    <span className='text-[10px] text-slate-500 uppercase font-black tracking-widest'>Encrypted Sync</span>
                                </div>
                            ) : (
                                messages.map((m, i) => {
                                    const isMe = (m.senderId || m.sender) === (user?._id || user?.id);
                                    return (
                                        <div key={i} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                            <div className={`max-w-[75%] md:max-w-[60%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                                                <div className={`relative px-4 py-3 shadow-2xl ${isMe ? "bg-emerald-600 text-white rounded-[22px] rounded-br-none" : "bg-[#141923] text-slate-200 rounded-[22px] rounded-bl-none border border-white/5"}`}>
                                                    {m.fileUrl && m.fileType?.startsWith("image") && (
                                                        <div className='mb-2 relative group overflow-hidden rounded-xl'>
                                                            <img src={m.fileUrl} alt="" className='max-w-fit rounded-xl cursor-zoom-in hover:scale-105 transition-all' onClick={() => window.open(m.fileUrl, "_blank")} />
                                                        </div>
                                                    )}
                                                    {m.fileUrl && !m.fileType?.startsWith("image") && (
                                                        <div className='flex items-center gap-3 p-3 bg-black/20 rounded-xl mb-2 border border-white/5'>
                                                            <div className='p-2 bg-emerald-500/10 text-emerald-400 rounded-lg'><FileText size={20} /></div>
                                                            <p className='text-xs font-bold truncate flex-1'>{m.fileName || "Document"}</p>
                                                            <a href={m.fileUrl} download className='p-1.5 text-slate-400 hover:text-white'><DownloadIcon size={16} /></a>
                                                        </div>
                                                    )}
                                                    {m.text && <p className='text-[13px] leading-relaxed font-medium'>{m.text}</p>}
                                                    <div className={`mt-1.5 text-[9px] font-bold ${isMe ? "text-emerald-200/60" : "text-slate-500"}`}>{formatDate(m.createdAt)}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={scrollRef} />
                        </div>

                        {/* Input Area */}
                        <div className='p-6 bg-gradient-to-t from-[#080a0f] to-transparent'>
                            <div className='max-w-4xl mx-auto flex items-center gap-3 bg-[#0f141e] rounded-[24px] p-2 border border-white/10 shadow-2xl focus-within:border-emerald-500/40 transition-all'>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} className='hidden' />
                                <button className='p-3 text-slate-500 hover:text-emerald-400' onClick={() => fileInputRef.current.click()}><Paperclip size={20} /></button>
                                <input type="text" value={input} placeholder={uploading ? 'Uploading...' : 'Type a message...'} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className='flex-1 bg-transparent text-[13px] py-2 px-2 outline-none text-slate-100 placeholder:text-slate-600' />
                                <button className='bg-emerald-500 text-black p-3.5 rounded-full hover:bg-emerald-400 active:scale-90 transition-all disabled:opacity-30' onClick={handleSend} disabled={!input.trim() && !uploading}><Send size={18} /></button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className='flex-1 flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_top_right, #10141d_0%, #080a0f_100%)]'>
                        <div className='w-20 h-20 bg-emerald-500/5 rounded-full flex items-center justify-center mb-6 border border-emerald-500/10 animate-pulse'>
                            <MessageCircle size={32} className='text-emerald-500/50' />
                        </div>
                        <h3 className='text-2xl font-bold text-white mb-2 tracking-tight'>Ghost Messenger</h3>
                        <p className='text-slate-500 text-xs max-w-[200px] font-medium leading-relaxed'>Select a teammate to start secure encrypted session.</p>
                    </div>
                )}
            </main>
        </div>
    );
}