import { ArrowLeft, Camera, Save, User } from 'lucide-react'
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Profile() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0b0e14] text-slate-300 font-sans p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">

                    <Link to='/'>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition text-slate-400">
                            <ArrowLeft />
                        </button>

                    </Link>

                    <h1 className="text-xs font-black uppercase tracking-widest">
                        Profile Setting
                    </h1>

                    <div className="w-10"></div> {/* Spacer */}
                </div>

                <div className="bg-[#12161f] border border-white/5 rounded-4xl overflow-hidden shadow-2xl">

                    <div className='p-8'>
                        <form action="" className='space-y-8'>
                            <div className='flex flex-col items-center'>
                                <div className='relative group'>
                                    <div className='h-32 w-32 rounded-full overflow-hiddenr ring-4 ring-emerald-500/20 shadow-2xl'>

                                        <img
                                            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                                            alt=""
                                            className='h-full w-full object-cover transition-all duration-500 group-hover:scale-110'
                                        />
                                    </div>
                                    <label className='absolute -bottom-2 -right-2 p-3 bg-emerald-500 text-[#0b0e14] rounded-2xl cursor-pointer hover:bg-emerald-400 hover:scale-110 transition-all shadow-xl'>
                                        <Camera size={20} strokeWidth={3} />
                                        <input type="file" className='hidden' accept='image/*' />
                                    </label>
                                </div>
                                <p className='mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500'>
                                    Update Photo
                                </p>
                            </div>

                            {/* Form Field */}

                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-1 block'>
                                        Full Name
                                    </label>

                                    <div className='relative flex items-center bg-[1a1f29] rounded-2xl border border-white/5 focus-within:border-emerald-500/30 transition-all p-4 '>
                                        <User size={18} className='text-slate-600' />
                                        <input
                                            type="text"
                                            placeholder='Your Name'
                                            className='bg-transparent text-sm ml-4 outline-none w-full text-white placeholder:text-slate-700 '
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 ml-1 block'>
                                        Email Address
                                    </label>

                                    <div className='relative flex items-center bg-[1a1f29] rounded-2xl border border-white/5 focus-within:border-emerald-500/30 transition-all p-4 '>
                                        {/* <User size={18} className='text-slate-600' /> */}
                                        <input
                                            type="text"
                                            disabled
                                            placeholder='example@mail.com'
                                            className='bg-transparent text-sm ml-4 outline-none w-full text-white placeholder:text-slate-500 cursor-not-allowed'
                                        />
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#0b0e14] font-black py-4 rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer">
                                <Save size={20} /> <span>Save Changes</span>
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    )
}
