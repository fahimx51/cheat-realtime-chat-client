import { Lock, Mail, ShieldCheck } from "lucide-react";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { loginAPI } from "../services/api";

function Login() {

    const { login } = useContext(AuthContext);

    const [isSubmitting, setSubmitting] = useState(false);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const formData = Object.fromEntries(new FormData(e.currentTarget));
            const response = await loginAPI(formData);

            login(response.user, response.token);

            navigate('/');

        }
        catch (error) {
            console.error("Login Error Details", error);
            alert(error.messege || "Invalid Email or Password");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-950 px-4">
            <div className="w-full max-w-md bg-slate-900 p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-[80px] rounded-full"></div>

                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10">
                        <div className="bg-emerald-500/15 p-4 rounded-2xl mb-4">
                            <ShieldCheck className="text-emerald-500 w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight ">Welcome Back</h2>
                        <p className="text-slate-400 text-sm mt-2 font-medium">Enter your details to access your chat</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest block">
                                Email
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-4.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors " size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="example@mail.com"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 p-3.5 pl-12 rounded-2xl text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />

                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-widest block">
                                Password
                            </label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-4.5 text-slate-500 group-focus-within:text-emerald-500 transition-colors " size={20} />
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Password"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 p-3.5 pl-12 rounded-2xl text-slate-200 outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all"
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black py-4 rounded-2xl transition-all duration-300 shadow-xs flex items-center justify-center gap-2 cursor-pointer">
                            <span className="text-white">Sign In</span>
                        </button>

                    </form>

                    <p className="mt-10 text-center text-slate-400 text-sm font-medium ">Don't have account?{" "}
                        <Link to="/register" className="text-emerald-500 font-bold hover:text-emerald-400 transition-all underline-offset-4  hover:underline">Create an Account</Link>
                    </p>

                </div>
            </div>

        </div>
    );
}

export default Login;