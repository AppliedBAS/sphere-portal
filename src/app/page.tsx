export default function Home() {
  (
    <div>
      <div className="relative w-full h-1 overflow-hidden bg-gradient-to-r from-[#0070f3] via-[#0070f3] to-[#79ffe1] animate-loading-bar" />
      <style>
        {`
          @keyframes loading-bar {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-loading-bar {
            animation: loading-bar 1.5s infinite linear;
          }
        `}
      </style>
      Loading...
    </div>
  )
}
