export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full bg-black text-white text-xs px-2 py-1">
      {children}
    </span>
  );
}
