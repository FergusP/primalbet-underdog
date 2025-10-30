export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen overflow-y-auto">
      {children}
    </div>
  );
}
