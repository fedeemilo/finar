import Image from "next/image";

export function FinarBrand({ showBeta = true }: { showBeta?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <div className="relative size-8 shrink-0 overflow-hidden rounded-lg">
          <Image
            src="/logos/logo.png"
            alt=""
            fill
            sizes="38px"
            className="object-cover scale-[1.55] object-[38%_center]"
            priority
          />
        </div>
        <span className="ml-1 text-xl font-black tracking-tight leading-none text-gray-800 dark:text-white">
          Fin
          <span
            style={{
              background: "linear-gradient(135deg, #00c896, #00e6aa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AR
          </span>
        </span>
      </div>
      {showBeta && (
        <span className="text-[10px] text-gray-500 dark:text-white/30 bg-black/[0.08] dark:bg-white/5 px-1.5 py-0.5 rounded-md font-medium">
          BETA
        </span>
      )}
    </div>
  );
}
