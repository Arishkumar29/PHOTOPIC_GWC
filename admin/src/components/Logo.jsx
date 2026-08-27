export function Logo({ onClick, size = 'default', showSubtitle = true }) {
  const isLarge = size === 'large';
  
  return (
    <div 
      onClick={onClick}
      className={`flex items-center gap-2.5 ${onClick ? 'cursor-pointer' : ''} select-none group`}
    >
      <div className="flex items-center">
        <img 
          src="/logo.png" 
          alt="GWC DATA.AI" 
          className={`${isLarge ? 'h-8 sm:h-9' : 'h-6 sm:h-7'} w-auto object-contain transition-transform duration-300 group-hover:scale-105`} 
        />
      </div>
      
      {showSubtitle && (
        <span className="text-[10px] font-bold tracking-widest text-[#6e2b8b] uppercase border-l border-slate-200 pl-2">
          Admin
        </span>
      )}
    </div>
  );
}
