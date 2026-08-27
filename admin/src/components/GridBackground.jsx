export function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" 
        style={{
          backgroundImage: `radial-gradient(#6e2b8b 1px, transparent 1px), radial-gradient(#da7756 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-purple-200/20 to-transparent blur-3xl" />
      <div className="absolute top-[30%] -right-[15%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl from-orange-200/15 to-transparent blur-3xl" />
    </div>
  );
}
