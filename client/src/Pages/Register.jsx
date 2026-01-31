import React, { useState } from 'react';
import { authService } from '@/services/api';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Label } from "@/Components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/Components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'investor',
        agreedToTerms: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.full_name || !formData.email || !formData.password || !formData.confirmPassword) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (!formData.agreedToTerms) {
            toast.error('You must agree to the terms and conditions');
            return;
        }

        setIsLoading(true);
        try {
            const { confirmPassword, agreedToTerms, ...registerData } = formData;
            await authService.register(registerData);
            toast.success('Account created successfully');

            // Auto login and redirect based on role
            const user = await authService.login(formData.email, formData.password);

            // Role-based redirect
            if (user.role === 'entrepreneur') {
                navigate('/dashboard');
            } else if (user.role === 'investor') {
                navigate('/marketplace');
            } else if (user.role === 'admin') {
                navigate('/admin/portal');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <Card className="w-full max-w-lg">
                <CardHeader className="space-y-2">
                    <CardTitle className="text-3xl font-bold text-center">Get Started Now</CardTitle>
                    <CardDescription className="text-center text-base">
                        It's easy to create a pitch using our online form. Your pitch can be in front of our investors before you know it.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5">
                        <div className="space-y-3">
                            <Label className="text-base font-medium">Select Your Role *</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className={`flex items-center justify-center space-x-2 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                    formData.role === 'investor' 
                                        ? 'border-emerald-600 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="investor"
                                        checked={formData.role === 'investor'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="form-radio text-emerald-600"
                                        required
                                    />
                                    <span className="font-medium">I'm an Investor</span>
                                </label>
                                <label className={`flex items-center justify-center space-x-2 cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                    formData.role === 'entrepreneur' 
                                        ? 'border-emerald-600 bg-emerald-50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}>
                                    <input
                                        type="radio"
                                        name="role"
                                        value="entrepreneur"
                                        checked={formData.role === 'entrepreneur'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="form-radio text-emerald-600"
                                        required
                                    />
                                    <span className="font-medium">I'm an Entrepreneur</span>
                                </label>
                            </div>
                        </div>

                <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                        id="full_name"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <Input
                        id="password"
                        type="password"
                        placeholder="Create a strong password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                    />
                </div>

                <div className="space-y-3 pt-2">
                    <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.agreedToTerms}
                            onChange={(e) => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                            className="mt-1 form-checkbox text-emerald-600 rounded"
                            required
                        />
                        <span className="text-sm text-slate-600">
                            I agree to the{' '}
                            <a href="#" className="text-emerald-600 hover:underline">Privacy Policy</a>,{' '}
                            <a href="#" className="text-emerald-600 hover:underline">Terms and Conditions</a>,{' '}
                            and{' '}
                            <a href="#" className="text-emerald-600 hover:underline">Refund Policy</a>.
                            I acknowledge that I am responsible for conducting my own due diligence.
                        </span>
                    </label>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 py-6 text-base font-semibold"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Create New Account
                </Button>
                <div className="text-sm text-center text-slate-600">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-emerald-600 hover:underline font-medium">
                        Login
                    </Link>
                </div>
            </CardFooter>
        </form>
            </Card >
        </div >
    );
}
