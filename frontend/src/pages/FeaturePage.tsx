import MainLayout from '../components/layout/MainLayout';
import { LucideIcon } from 'lucide-react';

interface FeaturePageProps {
    title: string;
    description: string;
    icon: LucideIcon;
}

export default function FeaturePage({ title, description, icon: Icon }: FeaturePageProps) {
    return (
        <MainLayout>
            <div className="flex-1 flex items-center justify-center h-[calc(100vh-100px)]">
                <div className="bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#E2E8F0] p-12 max-w-md w-full text-center animate-slide-in">
                    <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-blue-100">
                        <Icon size={26} />
                    </div>
                    <h2 className="text-[20px] font-semibold text-[#0F172A] mb-2 tracking-tight">{title}</h2>
                    <p className="text-[13px] text-[#64748B] mb-7 leading-relaxed">{description}</p>
                    <button className="btn-primary text-white px-6 py-2 rounded-lg text-[13px] font-semibold shadow-sm">
                        Coming Soon
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
