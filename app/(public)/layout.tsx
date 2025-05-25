import "../globals.css";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col items-center justify-center w-full flex-1">
        {children}
      </div>
    </div>
  );
}
