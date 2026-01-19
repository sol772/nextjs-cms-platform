export default function ContentLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="mx-auto w-full max-w-[1360px] p-[80px_20px] md:p-[120px_40px] min-[1400px]:px-0">
            {children}
        </div>
    );
}
